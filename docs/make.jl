using Documenter
using OptimalTransportNetworks

makedocs(
    sitename = "Optimal Transport Networks",
    modules = [OptimalTransportNetworks],
    checkdocs = :none,
    format = Documenter.HTML(),
    pages = [
        "Home" => "index.md",
        "API" => "api.md"
    ]
)

deploydocs(
    repo = "github.com/SebKrantz/OptimalTransportNetworks.jl.git",
    branch = "gh-pages",
    # deploy_config = Dict("DOCUMENTER_KEY" => ENV["DOCUMENTER_KEY"]), 
    # push_preview = true, ..
)