import { api } from "./api";
import { ApiResponse } from "@/types";

export interface LeadAnalysis {
  summary: string;
  score: number;
  suggestion: string;
}

export const aiService = {
  async analyzeLead(id: string): Promise<LeadAnalysis> {
    const { data } = await api.get<ApiResponse<{ analysis: LeadAnalysis }>>(
      `/ai/lead/${id}`
    );
    return data.data!.analysis;
  },

  async getDashboardInsights(): Promise<string> {
    const { data } = await api.get<ApiResponse<{ insight: string }>>(
      "/ai/insights"
    );
    return data.data!.insight;
  },
  async bulkAnalyze(leadIds: string[]): Promise<any[]> {
    const { data } = await api.post<ApiResponse<{ results: any[] }>>("/ai/bulk", { leadIds });
    return data.data!.results;
  },
};