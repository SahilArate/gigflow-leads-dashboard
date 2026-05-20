import Groq from "groq-sdk";
import { env } from "../../config/env";
import { ILead } from "../../types";

const groq = new Groq({ apiKey: env.groq.apiKey });

const MODEL = "llama-3.3-70b-versatile";

export class AIService {
  async analyzeLead(lead: ILead): Promise<{
    summary: string;
    score: number;
    suggestion: string;
  }> {
    const prompt = `
You are a CRM AI assistant. Analyze this sales lead and respond ONLY in JSON format.

Lead Data:
- Name: ${lead.name}
- Email: ${lead.email}
- Status: ${lead.status}
- Source: ${lead.source}
- Notes: ${lead.notes || "No notes"}
- Created: ${new Date(lead.createdAt).toLocaleDateString()}

Respond with ONLY this JSON (no markdown, no explanation):
{
  "summary": "2 sentence summary of this lead",
  "score": <number 1-10>,
  "suggestion": "one specific next action to take with this lead"
}`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content || "";

    try {
      const parsed = JSON.parse(content.trim());
      return {
        summary: parsed.summary || "Unable to generate summary",
        score: Math.min(10, Math.max(1, Number(parsed.score) || 5)),
        suggestion: parsed.suggestion || "Follow up with the lead",
      };
    } catch {
      return {
        summary: "AI analysis unavailable at the moment",
        score: 5,
        suggestion: "Follow up with the lead soon",
      };
    }
  }
  async bulkAnalyze(leads: any[]): Promise<{ leadId: string; name: string; score: number; suggestion: string }[]> {
    const results = await Promise.all(
      leads.map(async (lead) => {
        const analysis = await this.analyzeLead(lead);
        return {
          leadId: lead._id.toString(),
          name: lead.name,
          score: analysis.score,
          suggestion: analysis.suggestion,
        };
      })
    );
    return results;
  }

  async getDashboardInsights(stats: Record<string, number>): Promise<string> {
    const prompt = `
You are a CRM AI assistant. Based on these lead pipeline stats, give ONE short actionable insight in 2 sentences max.

Stats:
- Total Leads: ${stats.total}
- New: ${stats.New}
- Contacted: ${stats.Contacted}
- Qualified: ${stats.Qualified}
- Lost: ${stats.Lost}

Respond with plain text only, no JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content?.trim() ||
      "Keep engaging with your leads to improve conversion rates.";
  }
}

export const aiService = new AIService();