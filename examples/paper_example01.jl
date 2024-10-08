using OptimalTransportNetworks
using Plots

# 4.1.1 One Good on a Regular Geometry
# COMPARATIVE STATICS OVER K IN A SYMMETRIC NETWORK

# ==============
# INITIALIZATION
# ==============

K = [1, 100]
param = init_parameters()
graph = create_graph(param, 9, 9, type = "map")

#  Define fundamentals
graph[:Zjn] *= 0.1; # matrix of productivity
Ni = find_node(graph, 5, 5); # center
graph[:Zjn][Ni, :] .= 1; # more productive node

# Plot the mesh with population 
plot_graph(graph, edges = false, mesh = true, node_sizes = graph[:Lj])

# Plot the mesh with productivity
plot_graph(graph, edges = false, mesh = true, node_sizes = graph[:Zjn])

# Compute networks
results = [] 
for i in 1:length(K) 
    param[:K] = K[i]
    push!(results, optimal_network(param, graph))
end

# Plot networks

plots = [] # Initialize an empty array to hold the subplots
for i in 1:length(K) 
    shades = sizes = results[i][:Cj] / maximum(results[i][:Cj])
    p = plot_graph(graph, results[i][:Ijk], node_sizes = sizes, node_shades = shades, node_sizes_scale = 40)
    title!(p, "(a) Transport Network (I_{jk})")
    push!(plots, p) 
    p = plot_graph(graph, results[1][:Qjkn][:, :, 1], edge_color = :brown, arrows = true, node_sizes = sizes, node_shades = shades, node_sizes_scale = 40)
    title!(p, "(b) Shipping (Q_{jk})")
    push!(plots, p) 
    p = plot_graph(graph, results[i][:Ijk], map = results[i][:Pjn] / maximum(results[i][:Pjn]), node_sizes = sizes, node_shades = shades, node_sizes_scale = 40)
    title!(p, "(c) Prices (P_{j})")
    push!(plots, p) 
    p = plot_graph(graph, results[i][:Ijk], map = results[i][:cj] / maximum(results[i][:cj]), node_sizes = sizes, node_shades = shades, node_sizes_scale = 40)
    title!(p, "(d) Consumption (c_{j})")
    push!(plots, p) 
end

# Combine the plots into a single figure with a layout of 1 row and 3 columns
final_plot = plot(plots..., layout = (length(K), 4), size = (1600, 400*length(K)))

# Display the final plot
display(final_plot)
