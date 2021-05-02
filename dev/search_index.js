var documenterSearchIndex = {"docs":
[{"location":"concepts/#Concepts","page":"Concepts","title":"Concepts","text":"","category":"section"},{"location":"concepts/#Bayesian-Networks","page":"Concepts","title":"Bayesian Networks","text":"","category":"section"},{"location":"concepts/","page":"Concepts","title":"Concepts","text":"A Bayesian Network (BN) represents a probability distribution over a set of variables, P(x_1 x_2 ldots x_n). Bayesian networks leverage variable relations in order to efficiently decompose the joint distribution into smaller conditional probability distributions.","category":"page"},{"location":"concepts/","page":"Concepts","title":"Concepts","text":"A BN is defined by a directed acyclic graph and a set of conditional probability distributions. Each node in the graph corresponds to a variable x_i and is associated with a conditional probability distribution P(x_i mid textparents(x_i)).","category":"page"},{"location":"usage/#Usage","page":"Usage","title":"Usage","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"using BayesNets, TikzGraphs, TikzPictures","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"using Random\nRandom.seed!(0) # seed the random number generator to 0, for a reproducible demonstration\nusing BayesNets\nusing TikzGraphs # required to plot tex-formatted graphs (recommended), otherwise GraphPlot.jl is used\nusing TikzPictures","category":"page"},{"location":"usage/#Representation","page":"Usage","title":"Representation","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Bayesian Networks are represented with the BayesNet type. This type contains the directed acyclic graph (a LightTables.DiGraph) and a list of conditional probability distributions (a list of CPDs). Here we construct the BayesNet a rightarrow b, with Gaussians a and b:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"a = mathcalN(01) qquad b = mathcalN(2a +31)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"bn = BayesNet()\npush!(bn, StaticCPD(:a, Normal(1.0)))\npush!(bn, LinearGaussianCPD(:b, [:a], [2.0], 3.0, 1.0))\nplot = BayesNets.plot(bn)\nTikzPictures.save(SVG(\"plot1\"), plot)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/#Conditional-Probability-Distributions","page":"Usage","title":"Conditional Probability Distributions","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Conditional Probablity Distributions, P(x_i mid textparents(x_i)), are defined in BayesNets.CPDs. Each CPD knows its own name, the names of its parents, and is associated with a distribution from Distributions.jl.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"CPDForm Description\nStaticCPD Any Distributions.distribution; indepedent of any parents\nFunctionalCPD Allows for a CPD defined with a custom eval function\nParentFunctionalCPD Modification to FunctionalCPD allowing the parent values to be passed in\nCategoricalCPD Categorical distribution, assumes integer parents in 1N\nLinearGaussianCPD Linear Gaussian, assumes target and parents are numeric\nConditionalLinearGaussianCPD A linear Gaussian for each discrete parent instantiation","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Each CPD can be learned from data using fit. Here we learn the same network as above.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"a = randn(100)\nb = randn(100) .+ 2*a .+ 3\n\ndata = DataFrame(a=a, b=b)\ncpdA = fit(StaticCPD{Normal}, data, :a)\ncpdB = fit(LinearGaussianCPD, data, :b, [:a])\n\nbn2 = BayesNet([cpdA, cpdB])\nplot = BayesNets.plot(bn2) # hide\nTikzPictures.save(SVG(\"plot2\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Each CPD implements four functions:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"name(cpd) - obtain the name of the variable target variable\nparents(cpd) - obtain the list of parents\nnparams(cpd - obtain the number of free parameters in the CPD\ncpd(assignment) - allows calling cpd() to obtain the conditional distribution\nDistributions.fit(Type{CPD}, data, target, parents)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"cpdB(:a=>0.5)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Several functions conveniently condition and then produce their return values:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"rand(cpdB, :a=>0.5) # condition and then sample\npdf(cpdB, :a=>1.0, :b=>3.0) # condition and then compute pdf(distribution, 3)\nlogpdf(cpdB, :a=>1.0, :b=>3.0) # condition and then compute logpdf(distribution, 3);","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"The NamedCategorical distribution allows for String or Symbol return values. The FunctionalCPD allows for crafting quick and simple CPDs:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"bn2 = BayesNet()\npush!(bn2, StaticCPD(:sighted, NamedCategorical([:bird, :plane, :superman], [0.40, 0.55, 0.05])))\npush!(bn2, FunctionalCPD{Bernoulli}(:happy, [:sighted], a->Bernoulli(a == :superman ? 0.95 : 0.2)))\nplot = BayesNets.plot(bn2) # hide\nTikzPictures.save(SVG(\"plot3\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Variables can be removed by name using delete!. A warning will be issued when removing a CPD with children.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"delete!(bn2, :happy)\nplot = BayesNets.plot(bn2) # hide\nTikzPictures.save(SVG(\"plot4\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/#Likelihood","page":"Usage","title":"Likelihood","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"A Bayesian Network represents a joint probability distribution, P(x_1 x_2 ldots x_n). Assignments are represented as dictionaries mapping variable names (Symbols) to variable values. We can evaluate probabilities as we would with Distributions.jl, only we use exclamation points as we modify the internal state when we condition:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"pdf(bn, :a=>0.5, :b=>2.0) # evaluate the probability density","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"We can also evaluate the likelihood of a dataset:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"data = DataFrame(a=[0.5,1.0,2.0], b=[4.0,5.0,7.0])\npdf(bn, data)    #  0.00215\nlogpdf(bn, data) # -6.1386;","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Or the likelihood for a particular cpd:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"pdf(cpdB, data)    #  0.006\nlogpdf(cpdB, data) # -5.201","category":"page"},{"location":"usage/#Sampling","page":"Usage","title":"Sampling","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Assignments can be sampled from a BayesNet.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"rand(bn)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"rand(bn, 5)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"In general, sampling can be done according to rand(BayesNet, BayesNetSampler, nsamples) to produce a table of samples, rand(BayesNet, BayesNetSampler) to produce a single Assignment, or rand!(Assignment, BayesNet, BayesNetSampler) to modify an assignment in-place. New samplers need only implement rand!. The functions above default to the DirectSampler, which samples the variables in topographical order.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Rejection sampling can be used to draw samples that are consistent with a provided assignment:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"bn = BayesNet()\npush!(bn, StaticCPD(:a, Categorical([0.3,0.7])))\npush!(bn, StaticCPD(:b, Categorical([0.6,0.4])))\npush!(bn, CategoricalCPD{Bernoulli}(:c, [:a, :b], [2,2], [Bernoulli(0.1), Bernoulli(0.2), Bernoulli(1.0), Bernoulli(0.4)]))\nplot = BayesNets.plot(bn) # hide\nTikzPictures.save(SVG(\"plot5\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"rand(bn, RejectionSampler(:c=>1), 5)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"One can also use weighted sampling:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"rand(bn, LikelihoodWeightedSampler(:c=>1), 5)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"One can also use Gibbs sampling. More options are available than are shown in the example below.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"bn_gibbs = BayesNet()\npush!(bn_gibbs, StaticCPD(:a, Categorical([0.999,0.001])))\npush!(bn_gibbs, StaticCPD(:b, Normal(1.0)))\npush!(bn_gibbs, LinearGaussianCPD(:c, [:a, :b], [3.0, 1.0], 0.0, 1.0))\n\nevidence = Assignment(:c => 10.0)\ninitial_sample = Assignment(:a => 1, :b => 1, :c => 10.0)\ngsampler = GibbsSampler(evidence, burn_in=500, thinning=1, initial_sample=initial_sample)\nrand(bn_gibbs, gsampler, 5)","category":"page"},{"location":"usage/#Parameter-Learning","page":"Usage","title":"Parameter Learning","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"BayesNets.jl supports parameter learning for an entire graph.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"fit(BayesNet, data, (:a=>:b), [StaticCPD{Normal}, LinearGaussianCPD])","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"fit(BayesNet, data, (:a=>:b), LinearGaussianCPD)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Fitting can be done for specific BayesNets types as well:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"data = DataFrame(c=[1,1,1,1,2,2,2,2,3,3,3,3],\nb=[1,1,1,2,2,2,2,1,1,2,1,1],\na=[1,1,1,2,1,1,2,1,1,2,1,1])\n\nbn5 = fit(DiscreteBayesNet, data, (:a=>:b, :a=>:c, :b=>:c))\nplot = BayesNets.plot(bn5) # hide\nTikzPictures.save(SVG(\"plot6\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Fitting a DiscreteCPD, which is a CategoricalCPD{Categorical}, can be done with a specified number of categories. This prevents cases where your test data does not provide an example for every category.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"cpd = fit(DiscreteCPD, DataFrame(a=[1,2,1,2,2]), :a, ncategories=3);\ncpd = fit(DiscreteCPD, data, :b, [:a], parental_ncategories=[3], target_ncategories=3);","category":"page"},{"location":"usage/#Inference","page":"Usage","title":"Inference","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Inference methods for discrete Bayesian networks can be used via the infer method:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"bn = DiscreteBayesNet()\npush!(bn, DiscreteCPD(:a, [0.3,0.7]))\npush!(bn, DiscreteCPD(:b, [0.2,0.8]))\npush!(bn, DiscreteCPD(:c, [:a, :b], [2,2], \n        [Categorical([0.1,0.9]),\n         Categorical([0.2,0.8]),\n         Categorical([1.0,0.0]),\n         Categorical([0.4,0.6]),\n        ]))\n\nplot = BayesNets.plot(bn) # hide\nTikzPictures.save(SVG(\"plot7\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"ϕ = infer(bn, :c, evidence=Assignment(:b=>1))","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Several inference methods are available. Exact inference is the default.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Inference Method Description\nExactInference Performs exact inference using discrete factors and variable elimination\nLikelihoodWeightingInference Approximates p(query \\ evidence) with N weighted samples using likelihood weighted sampling\nLoopyBelief The loopy belief propagation algorithm\nGibbsSamplingNodewise Gibbs sampling where each iteration changes one node\nGibbsSamplingFull Gibbs sampling where each iteration changes all nodes","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"ϕ = infer(GibbsSamplingNodewise(), bn, [:a, :b], evidence=Assignment(:c=>2))","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Inference produces a Factor type. It can be converted to a DataFrame.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"convert(DataFrame, ϕ)","category":"page"},{"location":"usage/#Structure-Learning","page":"Usage","title":"Structure Learning","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Structure learning can be done as well.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"using Discretizers\nusing RDatasets\niris = dataset(\"datasets\", \"iris\")\nnames(iris)\ndata = DataFrame(\n    SepalLength = iris[!,:SepalLength],\n    SepalWidth = iris[!,:SepalWidth],\n    PetalLength = iris[!,:PetalLength],\n    PetalWidth = iris[!,:PetalWidth],\n    Species = encode(CategoricalDiscretizer(iris[!,:Species]), iris[!,:Species]),\n)\n\ndata[1:3,:] # only display a subset...","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Here we use the K2 structure learning algorithm which runs in polynomial time but requires that we specify a topological node ordering.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"parameters = K2GraphSearch([:Species, :SepalLength, :SepalWidth, :PetalLength, :PetalWidth], \n                       ConditionalLinearGaussianCPD,\n                       max_n_parents=2)\nbn = fit(BayesNet, data, parameters)\n\nplot = BayesNets.plot(bn) # hide\nTikzPictures.save(SVG(\"plot8\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"CPD types can also be specified per-node. Note that complete CPD definitions are required - simply using StaticCPD is insufficient as you need the target distribution type as well, as in StaticCPD{Categorical}.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Changing the ordering will change the structure.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"CLG = ConditionalLinearGaussianCPD\nparameters = K2GraphSearch([:Species, :PetalLength, :PetalWidth, :SepalLength, :SepalWidth], \n                        [StaticCPD{Categorical}, CLG, CLG, CLG, CLG],\n                        max_n_parents=2)\nfit(BayesNet, data, parameters)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"A ScoringFunction allows for extracting a scoring metric for a CPD given data. The negative BIC score is implemented in NegativeBayesianInformationCriterion.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"A GraphSearchStrategy defines a structure learning algorithm. The K2 algorithm is defined through K2GraphSearch and GreedyHillClimbing is implemented for discrete Bayesian networks and the Bayesian score:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"data = DataFrame(c=[1,1,1,1,2,2,2,2,3,3,3,3], \n                 b=[1,1,1,2,2,2,2,1,1,2,1,1],\n                 a=[1,1,1,2,1,1,2,1,1,2,1,1])\nparameters = GreedyHillClimbing(ScoreComponentCache(data), max_n_parents=3, prior=UniformPrior())\nbn = fit(DiscreteBayesNet, data, parameters)\n\nplot = BayesNets.plot(bn) # hide\nTikzPictures.save(SVG(\"plot9\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"We can specify the number of categories for each variable in case it cannot be correctly inferred:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"bn = fit(DiscreteBayesNet, data, parameters, ncategories=[3,3,2])","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"A whole suite of features are supported for DiscreteBayesNets. Here, we illustrate the following:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Obtain a list of counts for a node\nObtain sufficient statistics from a discrete dataset\nObtain the factor table for a node\nObtain a factor table matching a particular assignment","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"We also detail obtaining a bayesian score for a network structure in the next section.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"count(bn, :a, data) # 1\nstatistics(bn.dag, data) # 2\ntable(bn, :b) # 3\ntable(bn, :c, :a=>1) # 4","category":"page"},{"location":"usage/#Reading-from-XDSL","page":"Usage","title":"Reading from XDSL","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Discrete Bayesian Networks can be read from the .XDSL file format.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"bn = readxdsl(joinpath(dirname(pathof(BayesNets)), \"..\", \"test\", \"sample_bn.xdsl\"))\n\nplot = BayesNets.plot(bn) # hide\nTikzPictures.save(SVG(\"plot10\"), plot) # hide","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"(Image: )","category":"page"},{"location":"usage/#Bayesian-Score-for-a-Network-Structure","page":"Usage","title":"Bayesian Score for a Network Structure","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"The bayesian score for a discrete-valued BayesNet can can be calculated based only on the structure and data (the CPDs do not need to be defined beforehand). This is implemented with a method of bayesian_score that takes in a directed graph, the names of the nodes and data.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"data = DataFrame(c=[1,1,1,1,2,2,2,2,3,3,3,3], \n                 b=[1,1,1,2,2,2,2,1,1,2,1,1],\n                 a=[1,1,1,2,1,1,2,1,1,2,1,1])\ng = DAG(3)\nadd_edge!(g,1,2); add_edge!(g,2,3); add_edge!(g,1,3)\nbayesian_score(g, [:a,:b,:c], data)","category":"page"},{"location":"install/#Installation","page":"Installation","title":"Installation","text":"","category":"section"},{"location":"install/","page":"Installation","title":"Installation","text":"Pkg.add(\"BayesNets\");","category":"page"},{"location":"install/","page":"Installation","title":"Installation","text":"Default visualization of the network structure is provided by the GraphPlot package. However, we recommend using tex-formatted graphs provided by the TikzGraphs package. Installation requirements for TikzGraphs (e.g., PGF/Tikz and pdf2svg) are provided here. Simply run using TikzGraphs in your Julia session to automatically switch to tex-formatted graphs (thanks to the Requires.jl package).","category":"page"},{"location":"#[BayesNets](https://github.com/sisl/BayesNets.jl)","page":"BayesNets","title":"BayesNets","text":"","category":"section"},{"location":"","page":"BayesNets","title":"BayesNets","text":"A Julia package for Bayesian Networks","category":"page"},{"location":"#Table-of-Contents","page":"BayesNets","title":"Table of Contents","text":"","category":"section"},{"location":"","page":"BayesNets","title":"BayesNets","text":"Pages = [\"install.md\", \"usage.md\", \"concepts.md]","category":"page"}]
}
