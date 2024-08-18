using OptimalTransportNetworks
using Random
using LinearAlgebra
using Plots

# Initialize parameters
param = init_parameters(K = 100, labor_mobility = false)
width, height = 13, 13

# Create graph
param, g = create_graph(param, width, height, type = "map")

# Set fundamentals
Random.seed!(5)
minpop = minimum(param[:Lj])
param[:Zjn] = fill(minpop, g[:J], 1) # matrix of productivity
param[:Lj] = fill(1e-6, g[:J]) # matrix of population

Ni = find_node(g, 5, 5) # center
param[:Zjn][Ni] = 1 # more productive node
param[:Lj][Ni] = 1 # more productive node

nb_cities = 20 # draw a number of random cities in space
for i in 1:nb_cities-1
    newdraw = false
    while newdraw == false
        j = round(Int, 1 + rand() * (g[:J] - 1))
        if param[:Lj][j] <= minpop
            newdraw = true
            param[:Lj][j] = 1
        end
    end
end

param[:hj] = param[:Hj] ./ param[:Lj]
param[:hj][param[:Lj] .== 1e-6] .= 1

# Draw geography
z = zeros(g[:J]) # altitude of each node

geographies = Dict()
geographies[:blank] = (z = z, obstacles = nothing)
g = apply_geography(g, geographies[:blank])

param0 = param # store initial params
g0 = g # store initial graph

# Blank geography
results = Dict(:blank => optimal_network(param, g))

# Mountain
mountain_size = 0.75
mountain_height = 1
mount_x = 10
mount_y = 10
geographies[:mountain] = (z = mountain_height * exp.(-((g[:x] .- mount_x).^2 .+ (g[:y] .- mount_y).^2) / (2 * mountain_size^2)),
                          obstacles = nothing)
g = apply_geography(g, geographies[:mountain], alpha_up_i = 10, alpha_down_i = 10)
results[:mountain] = optimal_network(param, g)

# Adding river and access by land
g = g0
geographies[:river] = (z = geographies[:mountain].z, 
                       obstacles = [6 + (1-1)*width 6 + (2-1)*width;
                          6 + (2-1)*width 6 + (3-1)*width;
                          6 + (3-1)*width 7 + (4-1)*width;
                          7 + (4-1)*width 8 + (5-1)*width;
                          8 + (5-1)*width 9 + (5-1)*width;
                          11 + (5-1)*width 12 + (5-1)*width;
                          12 + (5-1)*width 13 + (5-1)*width])

g = apply_geography(g, geographies[:river], across_abstacle_delta_i = Inf, 
                    alpha_up_i = 10, alpha_down_i = 10)
results[:river] = optimal_network(param, g)

# Reinit and put another river and bridges
g = g0
geographies[:bridges] = (z = mountain_height * exp.(-((g[:x] .- mount_x).^2 .+ (g[:y] .- mount_y).^2) / (2 * mountain_size^2)),
                         obstacles = [6 + (1-1)*width 6 + (2-1)*width;
                             6 + (2-1)*width 6 + (3-1)*width;
                             6 + (3-1)*width 7 + (4-1)*width;
                             7 + (4-1)*width 8 + (5-1)*width;
                             8 + (5-1)*width 9 + (5-1)*width;
                             9 + (5-1)*width 10 + (5-1)*width;
                             10 + (5-1)*width 11 + (5-1)*width;
                             11 + (5-1)*width 12 + (5-1)*width;
                             12 + (5-1)*width 13 + (5-1)*width])

g = apply_geography(g, geographies[:bridges], alpha_up_i = 10, alpha_down_i = 10, 
                    across_abstacle_delta_i = 2, along_obstacle_delta_i = Inf)
results[:bridges] = optimal_network(param, g)

# Allowing for water transport
g = g0
geographies[:water_transport] = (z = mountain_height * exp.(-((g[:x] .- mount_x).^2 .+ (g[:y] .- mount_y).^2) / (2 * mountain_size^2)),
                                 obstacles = [6 + (1-1)*width 6 + (2-1)*width;
                                              6 + (2-1)*width 6 + (3-1)*width;
                                              6 + (3-1)*width 7 + (4-1)*width;
                                              7 + (4-1)*width 8 + (5-1)*width;
                                              8 + (5-1)*width 9 + (5-1)*width;
                                              9 + (5-1)*width 10 + (5-1)*width;
                                              10 + (5-1)*width 11 + (5-1)*width;
                                              11 + (5-1)*width 12 + (5-1)*width;
                                              12 + (5-1)*width 13 + (5-1)*width])

g = apply_geography(g, geographies[:water_transport], alpha_up_i = 10, alpha_down_i = 10, 
                    across_abstacle_delta_i = 2, along_obstacle_delta_i = 0.5)
results[:water_transport] = optimal_network(param, g)

# Increasing returns to transport
param[:gamma] = 2
geographies[:increasing_returns] = geographies[:water_transport]
results[:increasing_returns] = optimal_network(param, g)

# Plot results
simulation = ["blank", "mountain", "river", "bridges", "water_transport", "increasing_returns"]
obstacles = ["off", "off", "on", "on", "on", "on"]
plots = Vector{Any}(undef, length(simulation)) 

i = 0
for s in simulation
    i += 1
    plots[i] = plot_graph(g, results[Symbol(s)][:Ijk], 
                          geography = geographies[Symbol(s)], obstacles = obstacles[i] == "on",
                          mesh = true, mesh_transparency = 0.2,
                          node_sizes = results[Symbol(s)][:cj] .* (param[:Lj] .> minpop), 
                          node_shades = param[:Zjn], 
                          edge_min_thickness = 1.5)
    title!(plots[i], "Geography $(s)")
end

# Combine plots
final_plot = plot(plots..., layout = (2, 3), size = (3*400, 2*400))
display(final_plot)