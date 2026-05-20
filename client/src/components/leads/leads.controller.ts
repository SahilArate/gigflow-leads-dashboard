import { Response } from "express";
import { leadsService } from "./leads.service";
import { AuthenticatedRequest, LeadSource, LeadStatus } from "../../types";
import { ResponseHandler } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";
import { leadQuerySchema } from "./leads.schema";

const getQueryString = (val: unknown): string | undefined => {
  if (Array.isArray(val)) return val[0] as string;
  if (typeof val === "string") return val;
  return undefined;
};

export class LeadsController {
  createLead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lead = await leadsService.createLead(req.body, req.user!.id, req.user!.name);
    ResponseHandler.created(res, "Lead created successfully", { lead });
  });

  getLeads = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = leadQuerySchema.parse(req.query);
    const { leads, meta } = await leadsService.getLeads(query);
    ResponseHandler.success(res, "Leads fetched successfully", { leads }, 200, meta);
  });

  getLeadById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lead = await leadsService.getLeadById(req.params.id as string);
    ResponseHandler.success(res, "Lead fetched successfully", { lead });
  });

  updateLead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const lead = await leadsService.updateLead(
      req.params.id as string,
      req.body,
      req.user!.id,
      req.user!.name
    );
    ResponseHandler.success(res, "Lead updated successfully", { lead });
  });

  deleteLead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await leadsService.deleteLead(req.params.id as string);
    ResponseHandler.success(res, "Lead deleted successfully");
  });

  getLeadStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await leadsService.getLeadStats();
    ResponseHandler.success(res, "Stats fetched successfully", { stats });
  });

  getChartData = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const data = await leadsService.getChartData();
    ResponseHandler.success(res, "Chart data fetched", { data });
  });

  getLeadActivity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const activity = await leadsService.getLeadActivity(req.params.id as string);
    ResponseHandler.success(res, "Activity fetched", { activity });
  });

  exportCSV = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const status = getQueryString(req.query.status) as LeadStatus | undefined;
    const source = getQueryString(req.query.source) as LeadSource | undefined;
    const search = getQueryString(req.query.search);

    const leads = await leadsService.exportLeadsCSV({ status, source, search, sort: "latest" });

    const fields = ["name", "email", "status", "source", "notes", "createdAt"];
    const csv = [
      fields.join(","),
      ...leads.map((lead: any) =>
        fields.map((f) => `"${(lead as any)[f] || ""}"`).join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.status(200).send(csv);
  });
}

export const leadsController = new LeadsController();