
"""
    create_auxdata(param, graph, I)

Creates the auxdata structure that contains all the auxiliary parameters for ADiGator and solve_allocation_...()

# Arguments
- `param`: structure that contains the model's parameters
- `graph`: structure that contains the underlying graph (created by create_graph function)
- `I`: provides the current JxJ symmetric matrix of infrastructure investment

# Output
- `auxdata`: structure auxdata to be used by the IPOPT/ADiGator bundle.
"""
function create_auxdata(param, graph, I)
    # Initialize kappa
    kappa = max.(I.^param.gamma ./ graph.delta_tau, param.MIN_KAPPA)
    kappa[.!graph.adjacency] = 0
    kappa_ex = kappa_extract(graph, kappa)  # extract the ndeg free values of matrix kappa (due to symmetry)

    # Create matrix A
    A = zeros(graph.J, graph.ndeg)
    id = 1
    for j in 1:graph.J
        for k in 1:length(graph.nodes[j].neighbors)
            if graph.nodes[j].neighbors[k] > j
                A[j, id] = 1
                A[graph.nodes[j].neighbors[k], id] = -1
                id += 1
            end
        end
    end

    # Store in auxdata
    auxdata = Dict(
        "param" => param,
        "graph" => graph,
        "kappa" => kappa,
        "kappa_ex" => kappa_ex,
        "Iex" => kappa_extract(graph, I),
        "delta_tau_ex" => kappa_extract(graph, graph.delta_tau),
        "A" => A,
        "Apos" => max.(A, 0),
        "Aneg" => max.(-A, 0)
    )

    return auxdata
end

"""
    kappa_extract(graph, kappa)

Auxiliary function that converts kappa_jk into kappa_i
"""
function kappa_extract(graph, kappa)
    kappa_ex = zeros(graph.ndeg)
    id = 1
    for i in 1:graph.J
        for j in 1:length(graph.nodes[i].neighbors)
            if graph.nodes[i].neighbors[j] > i
                kappa_ex[id] = kappa[i, graph.nodes[i].neighbors[j]]
                id += 1
            end
        end
    end
    return kappa_ex
end


# Please note that the translation assumes that `param`, `graph`, and `I` are dictionaries or custom types with the appropriate fields. The `graph.nodes` field is assumed to be an array of custom types or dictionaries with a `neighbors` field. The `!` operator in Julia is equivalent to the `~` operator in Matlab, and the `.` operator is used for element-wise operations. The `max` function is used with the `.` operator for element-wise comparison. The `+=` operator is used for incrementing `id`. The `Dict` function is used to create a dictionary for `auxdata`.