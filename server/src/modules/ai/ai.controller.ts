import { Response } from "express";
import { aiService } from "./ai.service";
import { leadsService } from "../leads/leads.service";
import { AuthenticatedRequest } from "../../types";
import { ResponseHandler } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";
import { Lead } from "../leads/leads.model";

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

  bulkAnalyze = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { leadIds } = req.body as { leadIds: string[] };

    if (!leadIds || leadIds.length === 0) {
      ResponseHandler.badRequest(res, "No lead IDs provided");
      return;
    }

    if (leadIds.length > 5) {
      ResponseHandler.badRequest(res, "Maximum 5 leads for bulk analysis");
      return;
    }

    const leads = await Lead.find({ _id: { $in: leadIds } });
    const results = await aiService.bulkAnalyze(leads);
    ResponseHandler.success(res, "Bulk analysis complete", { results });
  });
}

export const aiController = new AIController();