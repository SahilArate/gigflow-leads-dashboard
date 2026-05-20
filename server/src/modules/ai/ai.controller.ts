import { Response } from "express";
import { aiService } from "./ai.service";
import { leadsService } from "../leads/leads.service";
import { AuthenticatedRequest } from "../../types";
import { ResponseHandler } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";

export class AIController {
  analyzeLead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lead = await leadsService.getLeadById(req.params.id as string);
    const analysis = await aiService.analyzeLead(lead);
    ResponseHandler.success(res, "AI analysis complete", { analysis });
  });

  getDashboardInsights = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await leadsService.getLeadStats();
    const insight = await aiService.getDashboardInsights(stats);
    ResponseHandler.success(res, "Insights generated", { insight });
  });
}

export const aiController = new AIController();