import { Lead } from "./leads.model";
import { Activity } from "./activity.model";
import { AppError } from "../../middleware/error.middleware";
import { ILead, PaginationMeta } from "../../types";
import { CreateLeadInput, UpdateLeadInput, LeadQueryInput } from "./leads.schema";

export class LeadsService {
  async createLead(input: CreateLeadInput, userId: string, userName: string): Promise<ILead> {
    const lead = await Lead.create({ ...input, createdBy: userId });

    await Activity.create({
      leadId: lead._id,
      userId,
      userName,
      action: "Lead created",
      newValue: `Status: ${lead.status}, Source: ${lead.source}`,
    });

    return lead;
  }

  async getLeads(query: LeadQueryInput): Promise<{ leads: ILead[]; meta: PaginationMeta }> {
    const { status, source, search, sort, page, limit } = query;
    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const sortOrder = sort === "oldest" ? 1 : -1;
    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      leads,
      meta: {
        total, page, limit, totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getLeadById(id: string): Promise<ILead> {
    const lead = await Lead.findById(id).populate("createdBy", "name email");
    if (!lead) throw new AppError("Lead not found", 404);
    return lead;
  }

  async updateLead(id: string, input: UpdateLeadInput, userId: string, userName: string): Promise<ILead> {
    const existing = await Lead.findById(id);
    if (!existing) throw new AppError("Lead not found", 404);

    // Track status change
    if (input.status && input.status !== existing.status) {
      await Activity.create({
        leadId: id,
        userId,
        userName,
        action: "Status changed",
        oldValue: existing.status,
        newValue: input.status,
      });
    }

    // Track other changes
    const changes: string[] = [];
    if (input.name && input.name !== existing.name) changes.push(`Name: ${existing.name} → ${input.name}`);
    if (input.source && input.source !== existing.source) changes.push(`Source: ${existing.source} → ${input.source}`);

    if (changes.length > 0) {
      await Activity.create({
        leadId: id,
        userId,
        userName,
        action: "Lead updated",
        newValue: changes.join(", "),
      });
    }

    const lead = await Lead.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    if (!lead) throw new AppError("Lead not found", 404);
    return lead;
  }

  async deleteLead(id: string): Promise<void> {
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) throw new AppError("Lead not found", 404);
    await Activity.deleteMany({ leadId: id });
  }

  async getLeadActivity(leadId: string): Promise<IActivity[]> {
    return Activity.find({ leadId }).sort({ createdAt: -1 }).limit(20);
  }

  async getLeadStats(): Promise<Record<string, number>> {
    const stats = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const result: Record<string, number> = { total: 0, New: 0, Contacted: 0, Qualified: 0, Lost: 0 };
    stats.forEach(({ _id, count }) => {
      result[_id] = count;
      result.total += count;
    });
    return result;
  }

  async getChartData(): Promise<{ byStatus: any[]; bySource: any[] }> {
    const [byStatus, bySource] = await Promise.all([
      Lead.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: "$source", value: { $sum: 1 } } }]),
    ]);
    return {
      byStatus: byStatus.map(i => ({ name: i._id, value: i.value })),
      bySource: bySource.map(i => ({ name: i._id, value: i.value })),
    };
  }

  async exportLeadsCSV(query: Omit<LeadQueryInput, "page" | "limit">): Promise<ILead[]> {
    const filter: Record<string, any> = {};
    if (query.status) filter.status = query.status;
    if (query.source) filter.source = query.source;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }
    return Lead.find(filter).sort({ createdAt: -1 }).lean();
  }
}

export const leadsService = new LeadsService();

// re-export type
export type { IActivity } from "./activity.model";