"use client";
import { useState, useEffect } from "react";
import { fetchStrategiesWithFilters } from "@/services/strategy-service";
import { SearchBar } from "@/components/shared/search-bar";
import { StrategyCard } from "./strategy-card";

export function StrategyList() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: any = {
        keyword: searchQuery || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };
      if (statusFilter !== "All") filters.status = statusFilter;

      const data = await fetchStrategiesWithFilters(filters);
      setStrategies(data);
    } catch (err) {
      console.error(err);
      setStrategies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedTags, statusFilter]);

  return (
    <div className="space-y-4">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {loading &&
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      }
      {!loading && strategies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-24 h-24 mb-6 rounded-full bg-accent/10 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-accent/50" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Strategies Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            We couldn't find any strategies matching your filters. Try adjusting your search criteria.
          </p>
        </div>
      )}

      {!loading && strategies.length > 0 && (
        <div className="grid gap-4">
          {strategies.map((s) => (
            <StrategyCard key={s.id} strategy={s} />
          ))}
        </div>
      )}
    </div>
  );
}
