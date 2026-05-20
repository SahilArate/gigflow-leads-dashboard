import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadsService, CreateLeadPayload } from "@/services/leads.service";
import { LeadFilters } from "@/types";
import { toast } from "react-hot-toast";

export const LEADS_KEY = "leads";
export const STATS_KEY = "lead-stats";

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: [LEADS_KEY, filters],
    queryFn: () => leadsService.getLeads(filters),
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: [STATS_KEY],
    queryFn: () => leadsService.getStats(),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLeadPayload) => leadsService.createLead(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      qc.invalidateQueries({ queryKey: [STATS_KEY] });
      toast.success("Lead created successfully!");
    },
    onError: () => toast.error("Failed to create lead"),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateLeadPayload> }) =>
      leadsService.updateLead(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      qc.invalidateQueries({ queryKey: [STATS_KEY] });
      toast.success("Lead updated successfully!");
    },
    onError: () => toast.error("Failed to update lead"),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      qc.invalidateQueries({ queryKey: [STATS_KEY] });
      toast.success("Lead deleted successfully!");
    },
    onError: () => toast.error("Failed to delete lead"),
  });
}