"use client"

import { useState, useEffect } from "react"
import { StrategyCard } from "@/app/strategy/[id]/components/strategy-card"
import { SearchBar } from "../../../../components/shared/search-bar"

export function StrategyList() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("Active")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await fetch(`${API_URL}/strategies`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch strategies")
        const data = await res.json()
        setStrategies(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStrategies()
  }, [API_URL])

  const filteredStrategies = strategies.filter((strategy) => {
  const matchesSearch =
    searchQuery === "" ||
    strategy.strategistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    strategy.strategistHandle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    strategy.assets?.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
    strategy.agents?.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
    strategy.chains?.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTags =
      selectedTags.length === 0 || selectedTags.some((tag) => strategy.tags?.includes(tag))

    return matchesSearch && matchesTags
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
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading strategies...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Failed to load: {error}</div>
        ) : filteredStrategies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No strategies found matching your criteria.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold">
                {statusFilter === "All" ? "All Strategies" : "Featured Strategies"}
                <span className="text-muted-foreground ml-2">({filteredStrategies.length})</span>
              </h4>
              <div className="flex gap-2 text-sm text-muted-foreground">
                <button
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "text-foreground font-semibold" : "hover:text-foreground"}
                >
                  Grid View
                </button>
                <span>|</span>
                <button
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "text-foreground font-semibold" : "hover:text-foreground"}
                >
                  List View
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStrategies.map((strategy) => (
                  <StrategyCard key={strategy.id} strategy={strategy} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredStrategies.map((strategy) => (
                  <div
                    key={strategy.id}
                    className="border rounded-lg p-4 bg-white shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{strategy.strategistName}</h3>
                      <p className="text-sm text-gray-500">{strategy.strategistHandle}</p>
                      <p className="text-sm">APY: {strategy.apy}%</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Assets: {strategy.assets?.join(", ")}</p>
                      <p>Chains: {strategy.chains?.join(", ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
