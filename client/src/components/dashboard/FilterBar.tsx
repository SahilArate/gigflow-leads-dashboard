"use client";

import { Search, Download, SlidersHorizontal } from "lucide-react";
import { LeadFilters, LeadStatus, LeadSource } from "@/types";
import { Button } from "@/components/ui/Button";
import { leadsService } from "@/services/leads.service";
import toast from "react-hot-toast";

interface FilterBarProps {
  filters: LeadFilters;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onSearchChange: (search: string) => void;
  searchValue: string;
  totalResults: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  onSearchChange,
  searchValue,
  totalResults,
}: FilterBarProps) {

  const handleExport = async () => {
    try {
      await leadsService.exportCSV({
        status: filters.status,
        source: filters.source,
        search: filters.search,
        sort: filters.sort,
      });
      toast.success("CSV exported successfully!");
    } catch {
      toast.error("Failed to export CSV");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500"
          />
        </div>

        {/* Export */}
        <Button
          variant="secondary"
          size="md"
          onClick={handleExport}
          className="shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0" />

        {/* Status filter */}
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange({ status: e.target.value as LeadStatus | "" })}
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="">All Status</option>
          {Object.values(LeadStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Source filter */}
        <select
          value={filters.source || ""}
          onChange={(e) => onFilterChange({ source: e.target.value as LeadSource | "" })}
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="">All Sources</option>
          {Object.values(LeadSource).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sort || "latest"}
          onChange={(e) => onFilterChange({ sort: e.target.value as "latest" | "oldest" })}
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Results count */}
        <span className="text-xs text-zinc-600 ml-auto">
          {totalResults} result{totalResults !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}