"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Lead } from "@/types";
import { aiService, LeadAnalysis } from "@/services/ai.service";
import { Button } from "@/components/ui/Button";

interface AILeadAnalysisProps {
  lead: Lead;
}

export function AILeadAnalysis({ lead }: AILeadAnalysisProps) {
  const [analysis, setAnalysis] = useState<LeadAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyze = async () => {
    try {
      setIsLoading(true);
      const result = await aiService.analyzeLead(lead._id);
      setAnalysis(result);
    } catch {
      setAnalysis({
        summary: "Unable to analyze this lead at the moment.",
        score: 0,
        suggestion: "Try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return "text-white";
    if (score >= 4) return "text-zinc-400";
    return "text-zinc-600";
  };

  return (
    <div className="mt-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">AI Analysis</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={analyze}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            analysis ? "Re-analyze" : "Analyze"
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing lead...
        </div>
      )}

      {analysis && !isLoading && (
        <div className="space-y-3">
          {/* Score */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">Lead Score</span>
            <div className="flex items-center gap-1">
              <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}
              </span>
              <span className="text-xs text-zinc-600">/10</span>
            </div>
            <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
              <div
                className="bg-white rounded-full h-1.5 transition-all duration-500"
                style={{ width: `${analysis.score * 10}%` }}
              />
            </div>
          </div>

          {/* Summary */}
          <div>
            <p className="text-xs text-zinc-500 mb-1">Summary</p>
            <p className="text-sm text-zinc-300">{analysis.summary}</p>
          </div>

          {/* Suggestion */}
          <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
            <p className="text-xs text-zinc-500 mb-1">Suggested Action</p>
            <p className="text-sm text-white">{analysis.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}