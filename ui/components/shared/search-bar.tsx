"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  statusFilter: "All" | "Active" | "Inactive"
  onStatusChange: (status: "All" | "Active" | "Inactive") => void
}

const availableTags = [
  "Staking",
  "Liquid",
  "Yield",
  "Liquidity",
  "zkEVM",
  "Omnipool",
  "Multi-Asset",
  "Lending",
  "Leverage",
  "Bitcoin",
  "Cross-chain",
  "Privacy",
  "RWA",
  "IBC",
]

export function SearchBar({
  searchQuery,
  onSearchChange,
  selectedTags,
  onTagsChange,
  statusFilter,
  onStatusChange,
}: SearchBarProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search title, asset, agent or chain"
            className="pl-10 bg-card border-border"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-card/50 border-border hover:bg-accent/10">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag}
                checked={selectedTags.includes(tag)}
                onCheckedChange={() => toggleTag(tag)}
              >
                {tag}
              </DropdownMenuCheckboxItem>
            ))}
            {selectedTags.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button variant="ghost" size="sm" className="w-full" onClick={() => onTagsChange([])}>
                  Clear All
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{statusFilter}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem checked={statusFilter === "All"} onCheckedChange={() => onStatusChange("All")}>
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "Active"}
              onCheckedChange={() => onStatusChange("Active")}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "Inactive"}
              onCheckedChange={() => onStatusChange("Inactive")}
            >
              Inactive
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex gap-2 flex-wrap">
        {availableTags.slice(0, 8).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className={`cursor-pointer transition-all duration-200 ${
              selectedTags.includes(tag)
                ? "bg-primary text-primary-foreground hover:bg-accent-light shadow-md scale-105"
                : "bg-card/80 border border-border text-foreground hover:bg-accent/10 hover:border-primary/30"
            }`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
            {selectedTags.includes(tag) && <span className="ml-1">✓</span>}
          </Badge>
        ))}
      </div>
    </div>
  )
}
