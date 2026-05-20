import { api } from "./api";
import { ApiResponse, Lead, LeadFilters, LeadStats, PaginationMeta } from "@/types";

export interface LeadsResponse {
  leads: Lead[];
  meta: PaginationMeta;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  status?: string;
  source: string;
  notes?: string;
}

export const leadsService = {
  async getLeads(filters: LeadFilters): Promise<LeadsResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
    );
    const { data } = await api.get<ApiResponse<{ leads: Lead[] }>>("/leads", { params });
    return {
      leads: data.data?.leads || [],
      meta: data.meta!,
    };
  },

  async getLeadById(id: string): Promise<Lead> {
    const { data } = await api.get<ApiResponse<{ lead: Lead }>>(`/leads/${id}`);
    return data.data!.lead;
  },

  async createLead(payload: CreateLeadPayload): Promise<Lead> {
    const { data } = await api.post<ApiResponse<{ lead: Lead }>>("/leads", payload);
    return data.data!.lead;
  },

  async updateLead(id: string, payload: Partial<CreateLeadPayload>): Promise<Lead> {
    const { data } = await api.patch<ApiResponse<{ lead: Lead }>>(`/leads/${id}`, payload);
    return data.data!.lead;
  },

  async deleteLead(id: string): Promise<void> {
    await api.delete(`/leads/${id}`);
  },

  async getStats(): Promise<LeadStats> {
    const { data } = await api.get<ApiResponse<{ stats: LeadStats }>>("/leads/stats");
    return data.data!.stats;
  },

  async exportCSV(filters: Omit<LeadFilters, "page" | "limit">): Promise<void> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
    );
    const response = await api.get("/leads/export", {
      params,
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};