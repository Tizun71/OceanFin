"use client"

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  statusFilter: "All" | "Active" | "Inactive"
  onStatusChange: (status: "All" | "Active" | "Inactive") => void
}

const availableTags = [
  { label: "Yield", value: "yield" },
  { label: "Airdrop", value: "airdrop" },
  { label: "Stablecoin", value: "stablecoin" },
  { label: "Looping", value: "looping" },
  { label: "Points", value: "points" },
  { label: "Nativecoin", value: "nativecoin" },
]

export function SearchBar({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  statusFilter,
  onStatusChange,
}: SearchBarProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [localSearchQuery, onSearchChange])

  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  const toggleTag = (value: string) => {
    if (selectedTags.includes(value)) {
      onTagsChange(selectedTags.filter((t) => t !== value))
    } else {
      onTagsChange([...selectedTags, value])
    }
  }

  const clearAll = () => {
    setLocalSearchQuery("")
    onSearchChange("")
    onTagsChange([])
    onStatusChange("All")
  }

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || statusFilter !== "All"

  const statuses: Array<"All" | "Active" | "Inactive"> = ["All", "Active", "Inactive"]

  return (
    <search className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <label htmlFor="strategy-search" className="sr-only">
            Search strategies
          </label>
          <Input
            id="strategy-search"
            type="search"
            placeholder="Search title, asset, agent or chain"
            className="pl-10 pr-10"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
          {/* Clearing the query needed a trip to a separate button before. */}
          {localSearchQuery && (
            <button
              type="button"
              onClick={() => setLocalSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-6 rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" aria-hidden />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          // Was `variant="default"` (solid accent) with destructive hover — a
          // secondary action styled louder than the page's primary CTA.
          <Button variant="ghost" onClick={clearAll} className="shrink-0">
            Clear all
          </Button>
        )}
      </div>

      {/* Status segmented control. Was buried in props with no visible UI, so
          the filter existed in state but users could never reach it. */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex items-center rounded-md border border-border bg-surface-1 p-0.5"
        >
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => onStatusChange(status)}
              aria-pressed={statusFilter === status}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${
                statusFilter === status
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* The dropdown duplicated this chip row exactly — same tags, same
            toggle — so it was two controls and an extra click for one job.
            Chips alone show state without opening anything. */}
        <div className="flex gap-1.5 flex-wrap" role="group" aria-label="Filter by tag">
          {availableTags.map((tag) => {
            const active = selectedTags.includes(tag.value)
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-accent/20 text-accent-light border-accent/50"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-border-strong"
                }`}
              >
                {tag.label}
                {active && <X className="w-3 h-3" aria-hidden />}
              </button>
            )
          })}
        </div>
      </div>
    </search>
  )
}
