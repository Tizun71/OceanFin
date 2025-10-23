"use client"

import { useState, useEffect } from "react"
import { StrategyCard } from "@/app/strategy/[id]/components/strategy-card"
import { SearchBar } from "../../../../components/shared/search-bar"
import { fetchStrategies } from "@/services/strategy-service"
import { FeaturedStrategies } from "./strategy-featured"

export function StrategyList() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("Active")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        const data = await fetchStrategies()
        setStrategies(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadStrategies()
  }, [])

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
      {/*  Header section */}
      <div className="flex items-center justify-between mb-8">

        <FeaturedStrategies />
      </div>
      {/* Search & Filter */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Strategy Cards */}
      <div className="mt-8">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading strategies...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Failed to load: {error}
          </div>
        ) : filteredStrategies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No strategies found matching your criteria.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold">
                {statusFilter === "All" ? "Featured Strategies" : "All Strategies"}
                <span className="text-muted-foreground ml-2">
                  ({filteredStrategies.length})
                </span>
              </h4>
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
                    className="border rounded-lg p-4 bg-card text-card-foreground shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold text-lg">{strategy.strategistName}</h3>
                      <p className="text-sm text-muted-foreground">{strategy.strategistHandle}</p>
                      <p className="text-sm">APY: {strategy.apy}%</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
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
