import LightXML

"""
    readxdsl( filename::AbstractString )
Return a DiscreteBayesNet read from the xdsl file
"""
function readxdsl( filename::AbstractString )

	# This currently assumes that the states are Integers
	# Thus, all <state id="???"/> must be integers

	splitext(filename)[2] == ".xdsl" || error("readxdsl only supports .xdsl format")

	xdoc  = LightXML.parse_file(filename)
	xroot = LightXML.root(xdoc)
	ces   = LightXML.get_elements_by_tagname(xroot, "nodes")[1]
	cpts  = collect(LightXML.child_elements(ces))

	varnames = Array(Symbol, length(cpts))
	for (i,e) in enumerate(cpts)
		id = LightXML.attribute(e, "id")
		varnames[i] = Symbol(id)
	end

	bn = DiscreteBayesNet()

	for (i,e) in enumerate(cpts)

		node_sym = varnames[i]

		for s in LightXML.get_elements_by_tagname(e, "state")
			attr = convert(String, LightXML.attribute(s, "id"))
			@assert(!isa(match(r"\d", attr), Void), "All state ids must be integers")
		end

		# set the node's domain
		states   = [parse(Int, match(r"\d", convert(String, LightXML.attribute(s, "id"))).match) for s in LightXML.get_elements_by_tagname(e, "state")]

		probs = Float64[parse(Float64, s) for s in split(LightXML.content(LightXML.find_element(e, "probabilities")))]

		# set any parents & populate probability table
		parents_elem = LightXML.get_elements_by_tagname(e, "parents")
		if !isempty(parents_elem)
			parents = NodeName[Symbol(s) for s in split(LightXML.content(parents_elem[1]))]

			# populate probability table
			reverse!(parents) # because SMILE varies first parent least quickly
            parental_ncategories = _get_parental_ncategories(bn, parents)
            k = length(states)
            Q = prod(parental_ncategories)
            distributions = Array(Categorical, Q)
            for q in 1:Q
                hi = k*q
                lo = hi - k + 1
                distributions[q] = Categorical{Float64}(probs[lo:hi])
            end

            push!(bn, DiscreteCPD(node_sym, parents, parental_ncategories, distributions))
		else
			# no parents
            push!(bn, DiscreteCPD(node_sym, probs))
		end
	end

	bn
end

"""
    write(io, text/plain, bn)

Writes a text file containing the sufficient statistics for a discrete Bayesian network.
This was inspired by the format listed in Appendix A of
"Correlated Encounter Model for Cooperative Aircraft in the National Airspace System Version 1.0"
by Mykel Kochenderfer.

The text file contains the following parameters:
- variable labels: A space-delimited list specifies the variable labels, which are symbols.
                   The ordering of the variables in this list determines the ordering of the variables
                   in the other tables. Note that the ordering of the variable labels is not
                   necessarily topological.
- graphical structure: A binary matrix is used to represent the graphical structure of the Bayesian
                   network. A 1 in the ith row and jth column means that there is a directed edge
                   from the ith varible to the jth variable in the Bayesian network. The ordering
                   of the variables are as defined in the variable labels section of the file.
                   The entries are 0 or 1 and are not delimited.
- variable instantiations: A list of integers specifying the number of instantiations for each variable.
                   The list is space-delimited.
- sufficient statistics: A list of space-delimited integers Nₐⱼₖ  which specifies the sufficient statistics.
                   The array is ordered first by increasing k, then increasing j, then increasing i.
                   The variable ordering is defined in the variable labels section of the file.
                   The list is a flattened matrices, where each matrix is rₐ × qₐ where rₐ is the number of
                   instantiations of variable a and qₐ is the number of instantiations of the parents of
                   variable a. The ordering is the same as the ordering of the distributions vector in
                   the CategoricalCPD type.
                   The entires in Nₐⱼₖ are integers, despite the fact that probabilities are floating point.
                   A number of digits, `ndigits`, of each probability past the decimal point are printed.
                   For a probability distribution with r values only the first r-1 values are printed.
                   To save a network to 3 decimals of precision, for instance, a categorical distribution
                   with probabilities [0.0123, 0.6759, 0.3123] would be saved as "012 676" and would
                   be read back in as [0.012,  0.676,  0.312] such that the probabilities sum to one.
                   A probability of one is output as the character `I'.

For example, the network Success -> Forecast
with Success ∈ [1, 2] and P(1) = 0.2, P(2) = 0.8
and Forecast ∈ [1, 2, 3] with
    P(1 | 1) = 0.4, P(2 | 1) = 0.4, P(3 | 1) = 0.2
    P(1 | 2) = 0.1, P(2 | 2) = 0.3, P(3 | 2) = 0.6

Is output as:

Success Forecast
01
00
2 3
2 4 4 1 3
"""
function Base.write(io::IO, mime::MIME"text/plain", bn::DiscreteBayesNet; digits::Int=6)

    n = length(bn)
    arr_names = names(bn)

    # variable labels
    for (i,name) in enumerate(arr_names)
        print(io, name, i != n ? " " : "\n")
    end

    # graphical structure
    for i in arr_names
        for j in arr_names
            print(io, has_edge(bn, i, j) ? "1" : "0")
        end
        print(io, "\n")
    end

    # variable instantiations
    for (i,name) in enumerate(arr_names)
        cpd = get(bn, name)
        print(io, ncategories(cpd), i != n ? " " : "\n")
    end

    # sufficient statistics
    space = false
    for name in arr_names
        cpd = get(bn, name)
        for D in cpd.distributions
            for p in probs(D)[1:end-1]
                str = p ≥ 1.0 ? "I" : string(round(p, digits))[3:end]
                print(io, space ? " " : "" , str)
                space = true
            end
        end
    end
    print(io, "\n")
end
function Base.read(io::IO, mime::MIME"text/plain", ::Type{DiscreteBayesNet})

    # variable labels
    arr_names = [Symbol(s) for s in split(readline(io))]
    n = length(arr_names)

    # graphical structure
    adj = falses(n,n)
    for i in 1 : n
        for (j,b) in enumerate(readline(io)[1:n])
            adj[i,j] = b == '1'
        end
    end

    # variable instantiations
    rs = [parse(Int, s) for s in split(readline(io))]

    # sufficient statistics
    stats = split(readline(io)) # strings for now

    # build DBN
    idx = 0
    cpds = Array(DiscreteCPD, n)
    for i in 1 : n
        name = arr_names[i]
        r = rs[i]
        parents = find(adj[:,i])
        if isempty(parents)
            probs = Array{Float64}(r)
            for j in 1 : r-1
                str = stats[idx += 1]
                probs[j] = str == "I" ? 1.0 : parse(Float64, "0."*str)
            end
            probs[end] = 1.0 - sum(probs[1:end-1])
            cpds[i] = DiscreteCPD(name, probs)
        else
            parent_names = arr_names[parents]
            parental_ncategories = rs[parents]
            Q = prod(parental_ncategories)
            distributions = Array{Categorical}(Q)
            for q in 1 : Q
                probs = Array{Float64}(r)
                for j in 1 : r-1
                    str = stats[idx += 1]
                    probs[j] = str == "I" ? 1.0 : parse(Float64, "0."*str)
                end
                probs[end] = 1.0 - sum(probs[1:end-1])
                distributions[q] = Categorical(probs)
            end
            cpds[i] = DiscreteCPD(name, parent_names, parental_ncategories, distributions)
        end
    end

    return BayesNet(cpds)
end