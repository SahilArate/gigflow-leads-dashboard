"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLeads, useLeadStats, useCreateLead } from "@/hooks/useLeads";
import { useDebounce } from "@/hooks/useDebounce";
import { LeadFilters } from "@/types";
import { Navbar } from "@/components/layout/Navbar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { LeadsTable } from "@/components/leads/LeadsTable";
import { Pagination } from "@/components/leads/Pagination";
import { Modal } from "@/components/ui/Modal";
import { LeadForm } from "@/components/leads/LeadForm";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
    sort: "latest",
    status: "",
    source: "",
    search: "",
  });

  // Update search in filters when debounced value changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const { data, isLoading: leadsLoading } = useLeads(filters);
  const { data: stats, isLoading: statsLoading } = useLeadStats();
  const createLead = useCreateLead();

  const handleFilterChange = (newFilters: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleCreate = async (formData: any) => {
    await createLead.mutateAsync(formData);
    setIsCreateOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Leads Pipeline</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Manage and track your leads
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="md">
            <Plus className="w-4 h-4" />
            Add Lead
          </Button>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} isLoading={statsLoading} />

        {/* Filters */}
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearchChange={setSearchInput}
          searchValue={searchInput}
          totalResults={data?.meta?.total || 0}
        />

        {/* Table */}
        <LeadsTable
          leads={data?.leads || []}
          isLoading={leadsLoading}
        />

        {/* Pagination */}
        {data?.meta && data.meta.totalPages > 1 && (
          <Pagination
            meta={data.meta}
            onPageChange={handlePageChange}
          />
        )}
      </main>

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Lead"
      >
        <LeadForm
          onSubmit={handleCreate}
          isLoading={createLead.isPending}
        />
      </Modal>
    </div>
  );
}