"use client";
import { useState, useEffect } from "react";
import { fetchStrategiesWithFilters } from "@/services/strategy-service";
import { SearchBar } from "@/components/shared/search-bar";
import { StrategyCard } from "./strategy-card";
import { Button } from "@/components/ui/button";
import { AlertCircle, SearchX } from "lucide-react";

export function StrategyList() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: any = {
        keyword: searchQuery || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };
      if (statusFilter !== "All") filters.status = statusFilter;

      const data = await fetchStrategiesWithFilters(filters);
      setStrategies(data);
    } catch (err) {
      // A failed request previously rendered the same "No strategies found"
      // empty state as a successful-but-empty one, so users retried filters
      // to fix what was actually a network error.
      setStrategies([]);
      setError("We couldn't reach the strategy service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedTags, statusFilter]);

  const hasFilters =
    Boolean(searchQuery) || selectedTags.length > 0 || statusFilter !== "All";

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

      {/* Skeletons mirror the card layout so the list doesn't jump on load. */}
      {loading && (
        <div className="grid gap-4" aria-busy="true" aria-live="polite">
          <span className="sr-only">Loading strategies</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="skeleton h-5 w-16 rounded-md" />
                    <div className="skeleton h-5 w-20 rounded-md" />
                  </div>
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-7 w-40 rounded-full" />
                </div>
                <div className="w-32 space-y-3 border-l border-border pl-4">
                  <div className="skeleton h-3 w-10 ml-auto" />
                  <div className="skeleton h-9 w-24 ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 py-14 px-4 text-center"
        >
          <AlertCircle className="w-7 h-7 text-destructive" aria-hidden />
          <div>
            <h3 className="text-base font-semibold text-foreground">Couldn&apos;t load strategies</h3>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            Try again
          </Button>
        </div>
      )}

      {!loading && !error && strategies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 mb-5 rounded-full bg-accent/10 flex items-center justify-center">
            <SearchX className="w-7 h-7 text-accent" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1.5">
            {hasFilters ? "No strategies match those filters" : "No strategies yet"}
          </h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            {hasFilters
              ? "Try removing a tag or broadening your search."
              : "Published strategies will appear here once they go live."}
          </p>
          {/* An empty state with no way out is a dead end — offer the undo. */}
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => {
                setSearchQuery("");
                setSelectedTags([]);
                setStatusFilter("All");
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {!loading && !error && strategies.length > 0 && (
        <div className="grid gap-4">
          {strategies.map((s) => (
            <StrategyCard key={s.id} strategy={s} />
          ))}
        </div>
      )}
    </div>
  );
}
