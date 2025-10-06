"use client"

import { StrategyCard } from "@/app/strategy/[id]/components/strategy-card"
import { SearchBar } from "../../../../components/shared/search-bar"
import { useState } from "react"

const strategies = [
  {
    id: "1",
    title: "Polkadot Liquid Staking - Bifrost",
    tags: ["Staking", "Liquid"],
    apy: 42.5,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "15/03/2025",
    assets: ["DOT", "vDOT"],
    agents: ["Bifrost", "Acala"],
    chains: ["Polkadot", "Bifrost"],
    status: "Active" as const,
  },
  {
    id: "2",
    title: "Moonbeam DeFi Yield Optimizer",
    tags: ["Yield", "Stables"],
    apy: 28.75,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "12/03/2025",
    assets: ["GLMR", "USDC"],
    agents: ["StellaSwap", "Moonwell"],
    chains: ["Moonbeam"],
    status: "Active" as const,
  },
  {
    id: "3",
    title: "Astar zkEVM Liquidity Mining",
    tags: ["Liquidity", "zkEVM"],
    apy: 35.2,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "10/03/2025",
    assets: ["ASTR", "ETH"],
    agents: ["ArthSwap", "Starlay"],
    chains: ["Astar"],
    status: "Active" as const,
  },
  {
    id: "4",
    title: "Hydration Omnipool Strategy",
    tags: ["Omnipool", "Multi-Asset"],
    apy: 31.8,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "08/03/2025",
    assets: ["HDX", "DOT", "USDT"],
    agents: ["Hydration"],
    chains: ["Hydration"],
    status: "Active" as const,
  },
  {
    id: "5",
    title: "Parallel Finance Lending Boost",
    tags: ["Lending", "Leverage"],
    apy: 26.4,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "05/03/2025",
    assets: ["PARA", "DOT"],
    agents: ["Parallel"],
    chains: ["Parallel"],
    status: "Active" as const,
  },
  {
    id: "6",
    title: "Interlay BTC Yield Strategy",
    tags: ["Bitcoin", "Cross-chain"],
    apy: 18.9,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "01/03/2025",
    assets: ["iBTC", "INTR"],
    agents: ["Interlay"],
    chains: ["Interlay", "Bitcoin"],
    status: "Active" as const,
  },
  {
    id: "7",
    title: "Phala Network Privacy Staking",
    tags: ["Privacy", "Staking"],
    apy: 22.3,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "28/02/2025",
    assets: ["PHA"],
    agents: ["Phala"],
    chains: ["Phala"],
    status: "Active" as const,
  },
  {
    id: "8",
    title: "Centrifuge RWA Yield",
    tags: ["RWA", "Yield"],
    apy: 15.6,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "25/02/2025",
    assets: ["CFG", "USDC"],
    agents: ["Centrifuge"],
    chains: ["Centrifuge"],
    status: "Active" as const,
  },
  {
    id: "9",
    title: "Composable Finance Cross-Chain",
    tags: ["Cross-chain", "IBC"],
    apy: 29.1,
    strategist: "POLKADOT LABS",
    handle: "@Polkadot_Labs",
    date: "20/02/2025",
    assets: ["PICA", "DOT"],
    agents: ["Composable"],
    chains: ["Composable", "Polkadot"],
    status: "Active" as const,
  },
]

export function StrategyList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("Active")

  const filteredStrategies = strategies.filter((strategy) => {
    const matchesSearch =
      searchQuery === "" ||
      strategy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strategy.assets.some((asset) => asset.toLowerCase().includes(searchQuery.toLowerCase())) ||
      strategy.agents.some((agent) => agent.toLowerCase().includes(searchQuery.toLowerCase())) ||
      strategy.chains.some((chain) => chain.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => strategy.tags.includes(tag))

    const matchesStatus = statusFilter === "All" || strategy.status === statusFilter

    return matchesSearch && matchesTags && matchesStatus
  })

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Explore DeFi Strategies Powered by</h2>
        <h3 className="text-3xl font-bold text-primary">Polkadot AI Agent Swarm</h3>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold">
            {statusFilter === "All" ? "All Strategies" : "Featured Strategies"}
            <span className="text-muted-foreground ml-2">({filteredStrategies.length})</span>
          </h4>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <button className="hover:text-foreground">Grid View</button>
            <span>|</span>
            <button className="hover:text-foreground">List View</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStrategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
        {filteredStrategies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No strategies found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
