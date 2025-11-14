"use client";
import { useState, useEffect } from "react";
import { fetchStrategiesWithFilters } from "@/services/strategy-service";
import { SearchBar } from "@/components/shared/search-bar";
import { StrategyCard } from "./strategy-card";

export default function StrategiesList() {
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

      {loading && <p>Loading...</p>}
      {!loading && strategies.length === 0 && <p>No strategies found</p>}

      <div className="grid gap-4">
        {strategies.map((s) => (
          <StrategyCard key={s.id} strategy={s} />
        ))}
      </div>
    </div>
  );
}
