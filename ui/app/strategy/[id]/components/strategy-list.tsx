"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { StrategyCard } from "@/app/strategy/[id]/components/strategy-card"
import { SearchBar } from "../../../../components/shared/search-bar"
import { fetchStrategies } from "@/services/strategy-service"

export function StrategyList() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("Active")

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
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl px-6 py-16 relative">
        {/* vertical glow line */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500/40 via-cyan-400/10 to-transparent blur-sm" />

        {/* search */}
        <div className="relative z-10">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </div>

        <div className="mt-16 space-y-16 relative z-10">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading strategies...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">Failed to load: {error}</div>
          ) : filteredStrategies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No strategies found matching your criteria.
            </div>
          ) : (
            filteredStrategies.map((strategy, idx) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6, ease: "easeOut" }}
                className={`flex flex-col md:flex-row items-center gap-10 ${
                  idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* glowing marker */}
                <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-cyan-400/50 shadow-md" />

                {/* card */}
                <div className="relative w-full md:w-[75%] group rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/90 shadow-xl hover:border-cyan-400/40 transition-all duration-500 backdrop-blur-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <StrategyCard strategy={strategy} />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
