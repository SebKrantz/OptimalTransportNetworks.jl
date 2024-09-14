var documenterSearchIndex = {"docs":
[{"location":"api/#API-Documentation","page":"API","title":"API Documentation","text":"","category":"section"},{"location":"api/#Module-Overview","page":"API","title":"Module Overview","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"Modules = [OptimalTransportNetworks]\nPages   = [\"OptimalTransportNetworks.jl\"]","category":"page"},{"location":"api/#OptimalTransportNetworks.OptimalTransportNetworks","page":"API","title":"OptimalTransportNetworks.OptimalTransportNetworks","text":"Optimal Transport Networks in Spatial Equilibrium\n\nPure Julia implementation of the model and algorithms presented in:\n\nFajgelbaum, P. D., & Schaal, E. (2020). Optimal transport networks in spatial equilibrium. Econometrica, 88(4), 1411-1452.\n\nThe library is based on the JuMP modeling framework for mathematical optimization in Julia, and roughly follows the  MATLAB OptimalTransportNetworkToolbox (v1.0.4b) provided by the authors. Compared to MATLAB, the Julia library presents a simplified interface. Notably, the graph object contains both the graph structure and all data parameterizing  the network, whereas the param object only contains (non-spatial) model parameters.\n\nExported Functions\n\nProblem Setup\n\ninit_paramaters()   - Create parameters dictionary\n\ncreate_graph()      - Create network graph dictionary\n\napply_geography()   - (Optional) apply geographical features to alter the graph edge weights (network building and traversing costs)\n\nCompute Optimal Network + Refine Solution in Non-Convex Cases\n\noptimal_network()   - Compute optimal network given parameters and graph. Can also be used to just solve the model on a given network. \n\nannealing()         - Refine solution using simulated annealing in non-convex cases (automatically called in optimal_network() if param[:annealing] == true))\n\nPlot Graph (Incl. Network Solution)\n\nplot_graph()        - Plot network graph and optimal infrastructure levels\n\nHelper Functions to Manipulate Graphs\n\nfind_node()         - Find index of node that is closest to a given pair of coordinates\n\nadd_node()          - Add new node to graph with given coordinates and connected neighbors\n\nremove_node()       - Remove node from graph\n\nExamples\n\n# Convex case\nparam = init_parameters(K = 10)\ngraph = create_graph(param)\ngraph[:Zjn][61] = 10.0\nresults = optimal_network(param, graph)\nplot_graph(graph, results[:Ijk])\n\n# Nonconvex case, disabling automatic annealing\nparam = init_parameters(K = 10, gamma = 2, annealing = false)\ngraph = create_graph(param)\ngraph[:Zjn][61] = 10.0\nresults = optimal_network(param, graph)\n\n# Run annealing\nresults_annealing = annealing(param, graph, results[:Ijk])\n\n# Comparison\nplot_graph(graph, results[:Ijk])\nplot_graph(graph, results_annealing[:Ijk])\n\n\n\n\n\n","category":"module"},{"location":"api/#Functions-Index","page":"API","title":"Functions Index","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"Modules = [OptimalTransportNetworks]\nOrder   = [:function]","category":"page"},{"location":"api/#Exported-Functions","page":"API","title":"Exported Functions","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"init_parameters\ncreate_graph\napply_geography\noptimal_network\nannealing\nplot_graph\nfind_node\nadd_node\nremove_node","category":"page"},{"location":"api/#OptimalTransportNetworks.init_parameters","page":"API","title":"OptimalTransportNetworks.init_parameters","text":"init_parameters(; kwargs...) -> Dict\n\nReturns a param dict with the model parameters. These are independent of the graph structure and dimensions.\n\nKeyword Arguments\n\nalpha::Float64=0.5: Cobb-Douglas coefficient on final good c^alpha * h^(1-alpha)\nbeta::Float64=1: Parameter governing congestion in transport cost\ngamma::Float64=1: Elasticity of transport cost relative to infrastructure\nK::Float64=1: Amount of concrete/asphalt (infrastructure budget)\nsigma::Float64=5: Elasticity of substitution across goods (CES)\nrho::Float64=2: Curvature in utility (c^alpha * h^(1-alpha))^(1-rho)/(1-rho)\na::Float64=0.8: Curvature of the production function L^alpha\nN::Int64=1: Number of goods traded in the economy (used for checks in create_graph())\nlabor_mobility::Any=false: Switch for labor mobility (true/false or 'partial')\ncross_good_congestion::Bool=false: Switch for cross-good congestion\nnu::Float64=1: Elasticity of substitution b/w goods in transport costs if cross-good congestion\nm::Vector{Float64}=ones(N): Vector of weights Nx1 in the cross congestion cost function\nannealing::Bool=true: Switch for the use of annealing at the end of iterations (only if gamma > beta)\nverbose::Bool=true: Switch to turn on/off text output (from Ipopt or other optimizers)\nduality::Bool=false: Switch to turn on/off duality whenever available\nwarm_start::Bool=true: Use the previous solution as a warm start for the next iteration\nkappa_min::Float64=1e-5: Minimum value for road capacities K\nmin_iter::Int64=20: Minimum number of iterations\nmax_iter::Int64=200: Maximum number of iterations\ntol::Float64=1e-5: Tolerance for convergence of road capacities K\n\nOptional Parameters\n\noptimizer = Ipopt.Optimizer: Optimizer to be used\noptimizer_attr::Dict: Dict of attributes passed to the optimizer (e.g. Dict(:tol => 1e-5))\nmodel_attr::Dict: Dict of tuples (length 2) passed to the model (e.g. Dict(:backend => (MOI.AutomaticDifferentiationBackend(), MathOptSymbolicAD.DefaultBackend())) to use Symbolic AD)\nmodel::Function: For custom models => a function that taks an optimizer and an 'auxdata' structure as created by create_auxdata() as input and returns a fully parameterized JuMP model\nrecover_allocation::Function: For custom models => a function that takes a solution and 'auxdata' structure as input and returns the allocation variables. In particular, it should return a dict with symbol keys returning at least objects :welfare => scalar welfare measure, :Pjn => prices, :PCj => aggregate condumption, and :Qjkn => flows. \n\nExamples\n\nparam = init_parameters(K = 10, labor_mobility = true)\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.create_graph","page":"API","title":"OptimalTransportNetworks.create_graph","text":"create_graph(param, w = 11, h = 11; type = \"map\", N = 1, kwargs...) -> Dict\n\nInitialize the underlying graph, population and productivity parameters.\n\nArguments\n\nparam::Dict: Dict that contains the model parameters (only needed for checks)\nw::Int64=11: Number of nodes along the width of the underlying graph if type != \"custom\" (integer)  \nh::Int64=11: Number of nodes along the height of the underlying graph if type != \"custom\" (integer, odd if triangle)\n\nKeyword Arguments\n\ntype::String=\"map\": Either \"map\", \"square\", \"triangle\", or \"custom\" \nadjacency::BitMatrix: J x J Adjacency matrix (only used for custom network)\nx::Vector{Float64}: x coordinate (longitude) of each node (only used for custom network)\ny::Vector{Float64}: y coordinate (latitude) of each node (only used for custom network)\nomega::Vector{Float64}: Vector of Pareto weights for each node or region in partial mobility case (default ones(J or nregions))\nZjn::Matrix{Float64}: J x N matrix of producties per node (j = 1:J) and good (n = 1:N) (default ones(J, N))\nLj::Vector{Float64}: Vector of populations in each node (j = 1:J) (only for fixed labour case)\nHj::Vector{Float64}: Vector of immobile good in each node (j = 1:J) (e.g. housing, default ones(J))\nLr::Vector{Float64}: Vector of populations in each region (r = 1:nregions) (only for partial mobility)\nregion::Vector{Int64}: Vector indicating region of each location (only for partial mobility)\n\nExamples\n\ngraph = create_graph(init_parameters())\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.apply_geography","page":"API","title":"OptimalTransportNetworks.apply_geography","text":"apply_geography(graph, geography; kwargs...) -> Dict\n\nUpdate the network building costs of a graph based on geographical features and remove edges impeded by geographical barriers.  Aversion to altitude changes rescales building infrastructure costs delta_i by (see also user manual to MATLAB toolbox):\n\n1 + alpha_up * max(0, Z2-Z1)^beta_up + alpha_down * max(0, Z1-Z2)^beta_down\n\nand similarly for graph traversal costs delta_tau.\n\nArguments\n\ngraph: Dict or NamedTuple that contains the network graph to which the geographical features will be applied.\ngeography: Dict or NamedTuple representing the geographical features, with the following fields:\nz::Vector{Float64}: (Optional) J x 1 vector containing the z-coordinate (elevation) for each node, or nothing if no elevation data.\nz_is_friction::Bool: (Optional) logical value indicate that z represents friction rather than elevation. In that case, the measure of building cost is the average friction of the two nodes mean(Z1,Z2) rather than the difference Z2-Z1.\nobstacles::Matrix{Int64}: (Optional) Nobs x 2 matrix specifying (i, j) pairs of nodes that are connected by obstacles, where Nobs is the number of obstacles, or nothing if no obstacles.\n\nKeyword Arguments\n\nacross_obstacle_delta_i::Float64=Inf: Rescaling parameter for building cost that crosses an obstacle.\nalong_obstacle_delta_i::Float64=Inf: Rescaling parameter for building cost that goes along an obstacle.\nacross_obstacle_delta_tau::Float64=Inf: Rescaling parameter for transport cost that crosses an obstacle.\nalong_obstacle_delta_tau::Float64=Inf: Rescaling parameter for transport cost that goes along an obstacle.\nalpha_up_i::Float64=0: Building cost scale parameter for roads that go up in elevation.\nbeta_up_i::Float64=1: Building cost elasticity parameter for roads that go up in elevation.\nalpha_up_tau::Float64=0: Transport cost scale parameter for roads that go up in elevation.\nbeta_up_tau::Float64=1: Transport cost elasticity parameter for roads that go up in elevation.\nalpha_down_i::Float64=0: Building cost scale parameter for roads that go down in elevation.\nbeta_down_i::Float64=1: Building cost elasticity parameter for roads that go down in elevation.\nalpha_down_tau::Float64=0: Transport cost scale parameter for roads that go down in elevation.\nbeta_down_tau::Float64=1: Transport cost elasticity parameter for roads that go down in elevation.\n\nExamples\n\ngraph = create_graph(init_parameters())\ngeography = (z = 10*(rand(graph[:J]) .> 0.95), obstacles = [1 15; 70 72])\nupdated_graph = apply_geography(graph, geography)\n\nplot_graph(updated_graph, geography = geography, obstacles = true)\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.optimal_network","page":"API","title":"OptimalTransportNetworks.optimal_network","text":"optimal_network(param, graph; I0=nothing, Il=nothing, Iu=nothing, \n                verbose=false, return_model=0, solve_allocation = false) -> Dict\n\nSolve for the optimal network by solving the inner problem and the outer problem by iterating over the FOCs.\n\nArguments\n\nparam: Dict or NamedTuple that contains the model's parameters\ngraph: Dict or NamedTuple that contains the underlying graph (created by create_graph() function)\nI0::Matrix{Float64}=nothing: (Optional) J x J matrix providing the initial guess for the iterations \nIl::Matrix{Float64}=nothing: (Optional) J x J matrix providing exogenous lower bound on infrastructure levels\nIu::Matrix{Float64}=nothing: (Optional) J x J matrix providing exogenous upper bound on infrastructure levels\nverbose::Bool=false: (Optional) tell IPOPT to display results\nreturn_model::Int=0: (Optional) return the JuMP model and corresponding recover_allocation() function: 1 just returns these before solving the model, while 2 solves the model + optimal network and returns the two alongside the results. \nsolve_allocation::Bool=false: (Optional) just solve the model with existing infrastructure I0 and return the results. \n\nExamples\n\nparam = init_parameters(K = 10)\ngraph = create_graph(param)\ngraph[:Zjn][61] = 10.0\nresults = optimal_network(param, graph)\nplot_graph(graph, results[:Ijk])\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.annealing","page":"API","title":"OptimalTransportNetworks.annealing","text":"annealing(param, graph, I0; kwargs...)\n\nRuns the simulated annealing method starting from network I0. Only sensible if param.gamma > param.beta.\n\nArguments\n\nparam: Dict or NamedTuple that contains the model's parameters\ngraph: Dict or NamedTuple that contains the underlying graph \nI0: (optional) provides the initial guess for the iterations\n\nKeyword Arguments\n\nverbose::Bool=false: (Optional) tell IPOPT to display results\nperturbation_method::String=\"random rebranching\": Method to be used to perturbate the network    (\"random\" is purely random, works horribly; \"shake\" applies a gaussian blur    along a random direction, works alright; \"rebranching\" (deterministic) and \"random rebranching\" (default) is the algorithm    described in Appendix A.4 in the paper, works nicely)\npreserve_central_symmetry::Bool=false: Only applies to \"shake\" method\npreserve_vertical_symmetry::Bool=false: Only applies to \"shake\" method\npreserve_horizontal_symmetry::Bool=false: Only applies to \"shake\" method\nsmooth_network::Bool=true: Whether to smooth the network after each perturbation if perturbation_method is \"random\"\nsmoothing_radius::Float64=0.25: Parameters of the Gaussian blur if perturbation_method is \"random\" or \"shake\"\nmu_perturbation::Float64=log(0.3): Parameters of the Gaussian blur if perturbation_method is \"shake\"\nsigma_perturbation::Float64=0.05: Parameters of the Gaussian blur if perturbation_method is \"shake\"\nnum_random_perturbations::Int64=1: Number of links to be randomly affected (\"random\" and \"random rebranching\" only)\ndisplay::Bool: Display the graph in each iteration as we go\nt_start::Float64=100: Initial temperature\nt_end::Float64=1: Final temperature\nt_step::Float64=0.9: Speed of cooling\nnum_deepening::Int64=4: Number of FOC iterations between candidate draws\nIu::Matrix{Float64}=Inf * ones(J, J): J x J matrix of upper bounds on network infrastructure Ijk\nIl::Matrix{Float64}=zeros(J, J): J x J matrix of lower bounds on network infrastructure Ijk\nfinal_model::JuMPModel: (Optionally) a readily parameterized JuMP model to be used (from optimal_network())\nrecover_allocation::Function: The recover_allocation() function corresponding to final_model\nallocation::Dict: The result from recover_allocation() from a previous solution of the model: to skip an initial resolve without perturbations. \n\nExamples\n\n# Nonconvex case, disabling automatic annealing\nparam = init_parameters(K = 10, gamma = 2, annealing = false)\ngraph = create_graph(param)\ngraph[:Zjn][61] = 10.0\nresults = optimal_network(param, graph)\n\n# Run annealing\nresults_annealing = annealing(param, graph, results[:Ijk])\n\n# Comparison\nplot_graph(graph, results[:Ijk])\nplot_graph(graph, results_annealing[:Ijk])\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.plot_graph","page":"API","title":"OptimalTransportNetworks.plot_graph","text":"plot_graph(graph, edges = nothing; kwargs...) -> Plots.Plot\n\nPlot a graph visualization with various styling options.\n\nArguments\n\ngraph::Dict: The network graph (created with create_graph())\nedges::Matrix{Float64}=nothing: Matrix of edge weights (J x J)\n\nKeyword Arguments\n\ngrid::Bool=false: Show gridlines \naxis::Tuple=([], false): Axis ticks and labels (see Plots.jl docs, default disable axis)\nmargin::Real=0mm: Margin around plot \naspect_ratio::Symbol=:equal: Plot aspect ratio (set to a real number (h/w) if not :equal)\nheight::Int=600: Plot height in pixels (width is proportional to height / aspect_ratio, but also depends on the relative ranges of the x and y coordinates of the graph)\nmap::Vector=nothing: Values mapped to graph for background heatmap\nmap_color::Symbol=:YlOrBr_4: Colorscale for background heatmap\nmesh::Bool=false: Show mesh lines between nodes\nmesh_color::Symbol=:grey90: Color for mesh lines \nmesh_style::Symbol=:dash: Linestyle for mesh lines\nmesh_transparency::Real=1: Opacity for mesh lines\nedges::Bool=true: Show edges between nodes\nedge_color::Symbol=:blue: Edge color or color gradient\nedge_scaling::Bool=false: Size edges based on raw values\nedge_transparency::Union{Bool,Real}=true: Transparency for edges\nedge_min::Real: Minimum edge value for scaling\nedge_max::Real: Maximum edge value for scaling  \nedge_min_thickness::Real=0.1: Minimum thickness for edges\nedge_max_thickness::Real=2: Maximum thickness for edges\narrows::Bool=false: Show arrowheads on edges \narrow_scale::Real=1: Scaling factor for arrowheads\narrow_style::String=\"long\": Style of arrowheads (\"long\" or \"thin\")\nnodes::Bool=true: Show nodes\nnode_sizes::Vector=ones(J): Sizes for nodes\nnode_sizes_scale::Real=75: Overall scaling for node sizes\nnode_shades::Vector=nothing: Shades mapped to nodes\nnode_color::Symbol=:purple: Node color or color gradient \nnode_stroke_width::Real=0: Stroke width for node outlines\nnode_stroke_color::Symbol=nothing: Stroke color for node outlines \ngeography=nothing: Dict or NamedTuple with geography data, see also apply_geography()\nobstacles::Bool=false: Show obstacles from geography\nobstacle_color::Symbol=:black: Color for obstacles\nobstacle_thickness::Real=3: Thickness for obstacles\n\nExamples\n\nparam = init_parameters(K = 10)\ngraph = create_graph(param)\ngraph[:Zjn][51] = 10.0\nresults = optimal_network(param, graph)\nplot_graph(graph, results[:Ijk])\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.find_node","page":"API","title":"OptimalTransportNetworks.find_node","text":"find_node(graph, x, y) -> Int64\n\nReturns the index of the node closest to the coordinates (x,y) on the graph.\n\nArguments\n\ngraph::Dict: Dict that contains the underlying graph (created by create_graph())\nx::Float64: x coordinate on the graph (between 1 and w)\ny::Float64: y coordinate on the graph (between 1 and h)\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.add_node","page":"API","title":"OptimalTransportNetworks.add_node","text":"add_node(graph, x, y, neighbors) -> Dict\n\nAdd a node in position (x,y) and list of neighbors. The new node is given an index J+1. Returns an updated graph object.\n\nArguments\n\ngraph::Dict: Dict that contains the underlying graph (created by create_graph())\nx::Float64: x coordinate of the new node (any real number)\ny::Float64: y coordinate of the new node (any real number)\nneighbors::Vector{Int64}: Vector of nodes to which it is connected (1 x n list of node indices between 1 and J, where n is an arbitrary # of neighbors) \n\nNotes\n\nThe cost matrices delta_tau and delta_i are parametrized as a function of Euclidean distance between nodes.  The new node is given population 1e-6 and productivity equal to the minimum productivity in the graph.\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.remove_node","page":"API","title":"OptimalTransportNetworks.remove_node","text":"remove_node(graph, i) -> Dict\n\nRemoves node i from the graph, returning an updated graph object.\n\nArguments\n\ngraph::Dict: Dict that contains the underlying graph (created by create_graph())\ni::Int64: index of the mode to be removed (integer between 1 and graph[:J])\n\n\n\n\n\n","category":"function"},{"location":"api/#Documented-Internal-Functions","page":"API","title":"Documented Internal Functions","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"OptimalTransportNetworks.dict_to_namedtuple\nOptimalTransportNetworks.namedtuple_to_dict\nOptimalTransportNetworks.create_map\nOptimalTransportNetworks.create_square\nOptimalTransportNetworks.create_triangle\nOptimalTransportNetworks.create_custom\nOptimalTransportNetworks.represent_edges\nOptimalTransportNetworks.create_auxdata\nOptimalTransportNetworks.get_model","category":"page"},{"location":"api/#OptimalTransportNetworks.dict_to_namedtuple","page":"API","title":"OptimalTransportNetworks.dict_to_namedtuple","text":"dict_to_namedtuple(dict)\n\nConvert a dictionary to a NamedTuple.\n\nIf the input is already a NamedTuple, it is returned unchanged. Otherwise, it creates a new NamedTuple from the dictionary's keys and values.\n\nArguments\n\ndict: A dictionary or NamedTuple to be converted.\n\nReturns\n\nA NamedTuple equivalent to the input dictionary.\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.namedtuple_to_dict","page":"API","title":"OptimalTransportNetworks.namedtuple_to_dict","text":"namedtuple_to_dict(namedtuple)\n\nConvert a NamedTuple to a dictionary.\n\nIf the input is already a dictionary, it is returned unchanged. Otherwise, it creates a new dictionary from the NamedTuple's pairs.\n\nArguments\n\nnamedtuple: A NamedTuple or dictionary to be converted.\n\nReturns\n\nA dictionary equivalent to the input NamedTuple.\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.create_map","page":"API","title":"OptimalTransportNetworks.create_map","text":"create_map(w, h) -> Dict\n\nCreates a square graph structure with width w and height h  (nodes have 8 neighbors in total, along horizontal and vertical  dimensions and diagonals)\n\nArguments\n\nw: Width of graph (i.e. the number of nodes along horizontal dimension), must be an integer\nh: Height of graph (i.e. the number of nodes along vertical dimension), must be an integer\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.create_square","page":"API","title":"OptimalTransportNetworks.create_square","text":"create_square(w, h) -> Dict\n\nCreates a square graph structure with width w and height h (nodes have 4 neighbors in total, along horizontal and vertical dimensions, NOT diagonals)\n\nArguments\n\nw: width of graph (ie. the number of nodes along horizontal dimension), must be an integer \nh: height of graph (ie. the number of nodes along vertical dimension), must be an integer\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.create_triangle","page":"API","title":"OptimalTransportNetworks.create_triangle","text":"create_triangle(w, h) -> Dict\n\nCreates a triangular graph structure with width w and height h  (each node is the center of a hexagon and each node has 6 neighbors,  horizontal and along the two diagonals)\n\nArguments\n\nw: Width of graph (i.e. the max number of nodes along horizontal dimension), must be an integer\nh: Height of graph (i.e. the max number of nodes along vertical dimension), must be an odd integer\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.create_custom","page":"API","title":"OptimalTransportNetworks.create_custom","text":"create_custom(adjacency, x, y) -> Dict\n\nCreates a custom graph structure with given adjacency matrix, x and y vectors  of coordinates.\n\nArguments\n\nadjacency: Adjacency matrix \nx: Vector of x coordinates of locations\ny: Vector of y coordinates of locations\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.represent_edges","page":"API","title":"OptimalTransportNetworks.represent_edges","text":"represent_edges(graph)\n\nCreates a NamedTuple providing detailed representation of the graph edges. \n\nArguments\n\ngraph: NamedTuple that contains the underlying graph (created by dict_to_namedtuple(create_graph()))\n\nReturns\n\nA NamedTuple with the following fields:\nA: J x ndeg matrix where each column represents an edge. The value is 1 if the edge starts at node J, -1 if it ends at node J, and 0 otherwise.\nApos: J x ndeg matrix where each column represents an edge. The value is the positive part of the edge flow.\nAneg: J x ndeg matrix where each column represents an edge. The value is the negative part of the edge flow.\nedge_start: J x ndeg matrix where each column represents an edge. The value is the starting node of the edge.\nedge_end: J x ndeg matrix where each column represents an edge. The value is the ending node of the edge.\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.create_auxdata","page":"API","title":"OptimalTransportNetworks.create_auxdata","text":"create_auxdata(param, graph, edges, I)\n\nCreates the auxdata structure that contains all the auxiliary parameters for estimation\n\nArguments\n\nparam: NamedTuple that contains the model's parameters (created by dict_to_namedtuple(init_parameters()))\ngraph: NamedTuple that contains the underlying graph (created by dict_to_namedtuple(create_graph()))\nedges: NamedTuple that contains the edges of the graph (created by represent_edges())\nI: J x J symmetric matrix of current infrastructure (investments)\n\nReturns\n\nA NamedTuple with the following fields:\nparam: The input parameter NamedTuple.\ngraph: The input graph NamedTuple.\nedges: The edges of the graph.\nkappa: The kappa matrix: I^gamma / delta_tau\nkappa_ex: The extracted kappa values (ndeg x 1)\n\n\n\n\n\n","category":"function"},{"location":"api/#OptimalTransportNetworks.get_model","page":"API","title":"OptimalTransportNetworks.get_model","text":"get_model(auxdata)\n\nConstruct the appropriate JuMP model based on the parameters and auxiliary data.\n\nArguments\n\nauxdata: Auxiliary data required for constructing the model (created by create_auxdata()).\n\nReturns\n\nmodel: The constructed JuMP model.\nrecover_allocation: A function to recover the allocation from the model solution.\n\n\n\n\n\n","category":"function"},{"location":"#OptimalTransportNetworks.jl","page":"Home","title":"OptimalTransportNetworks.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Optimal Transport Networks in Spatial Equilibrium - in Julia","category":"page"},{"location":"","page":"Home","title":"Home","text":"Modern Julia (JuMP) translation of the MATLAB OptimalTransportNetworkToolbox (v1.0.4b) implementing the quantitative spatial economic model of:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Fajgelbaum, P. D., & Schaal, E. (2020). Optimal transport networks in spatial equilibrium. Econometrica, 88(4), 1411-1452.","category":"page"},{"location":"","page":"Home","title":"Home","text":"The model/software uses duality principles to optimize over the space of networks, nesting an optimal flows problem and a neoclasical general-equilibrium trade model into a global network design problem to derive the optimal (welfare maximizing) transport network (extension) from any primitive set of economic fundamantals [population per location, productivity per location for each of N traded goods, endowment of a non-traded good, and (optionally) a pre-existing transport network]. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"For more information about the model see this folder and the MATLAB User Guide. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"The model is the first of its kind and a pathbreaking contribution towards the welfare maximizing planning of transport infrastructure. Its creation has been funded by the European Union through an ERC Research Grant. The author of this Julia library has no personal connections to the authors, but has used their Matlab library for research purposes and belives that it deserves an accessible open-source implementation. Community efforts to further improve the code are welcome. In particular, there is a probabilistic extenstion to solving the model using MCMC methods which may be more suitable for large networks, implemented in:","category":"page"},{"location":"","page":"Home","title":"Home","text":"Kreindler, G., Gaduh, A., Graff, T., Hanna, R., & Olken, B. A. (2023). Optimal Public Transportation Networks: Evidence from the World's Largest Bus Rapid Transit System in Jakarta (No. w31369). National Bureau of Economic Research.","category":"page"},{"location":"#Example","page":"Home","title":"Example","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The code for this example is in example04.jl. See the examples folder for more examples.","category":"page"},{"location":"","page":"Home","title":"Home","text":"This plot shows the endowments on a map-graph: circle size is population, circle colour is productivity (the central node is more productive), the black lines indicate geographic barriers, and the background is shaded according to the cost of network building (elevation), indicating a mountain in the upper right corner. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"(Image: )","category":"page"},{"location":"","page":"Home","title":"Home","text":"This plot shows the optimal network after 200 iterations, keeping population fixed and not allowing for cross-good congestion. The size of nodes indicates consumption in each node. ","category":"page"},{"location":"","page":"Home","title":"Home","text":"(Image: )","category":"page"},{"location":"#Performance-Notes","page":"Home","title":"Performance Notes","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The Julia implementation does not provide hard-coded Gradients, Jacobians, and Hessians as the MATLAB implementation does for some model cases, but relies solely on JuMP's automatic differentiation. This has proven ineffective for dual solutions to the model where the objective is quite complex. Thus, at present, duality does not help to speed up computations in Julia, and accordingly the default is duality = false. I expect this to change in when support for detecting nonlinear subexpressions will be added to JuMP.  \nSymbolic autodifferentiation via MathOptSymbolicAD.jl can provide significant performance improvements. The symbolic backend can be activated using:","category":"page"},{"location":"","page":"Home","title":"Home","text":"import MathOptInterface as MOI\nimport MathOptSymbolicAD\n\nparam[:model_attr] = Dict(:backend => (MOI.AutomaticDifferentiationBackend(), \n                                       MathOptSymbolicAD.DefaultBackend())) \n                                # Or:  MathOptSymbolicAD.ThreadedBackend()","category":"page"},{"location":"","page":"Home","title":"Home","text":"It is recommended to use Coin-HSL linear solvers for Ipopt to speed up computations. In my opinion the simplest way to use them is to get a (free for academics) license and download the binaries here, extract them somewhere, and then set the hsllib (place here the path to where you extracted libhsl.dylib, it may also be called libcoinhsl.dylib, in which case you may have to rename it to libhsl.dylib) and linear_solver options as follows:","category":"page"},{"location":"","page":"Home","title":"Home","text":"param[:optimizer_attr] = Dict(:hsllib => \"/usr/local/lib/libhsl.dylib\", # Adjust path\n                              :linear_solver => \"ma57\") # Use ma57, ma86 or ma97","category":"page"},{"location":"","page":"Home","title":"Home","text":"The Ipopt.jl README suggests to use the larger LibHSL package for which there exists a Julia module and proceed similarly. In addition, users may try an optimized BLAS and see if it yields significant performance gains (and let me know if it does). ","category":"page"}]
}
