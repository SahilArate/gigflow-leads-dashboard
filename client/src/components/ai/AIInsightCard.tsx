"use client";

import { useState } from "react";
import { Sparkles, Loader2, TrendingUp } from "lucide-react";
import { aiService } from "@/services/ai.service";
import { Button } from "@/components/ui/Button";

export function AIInsightCard() {
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadInsight = async () => {
    try {
      setIsLoading(true);
      const result = await aiService.getDashboardInsights();
      setInsight(result);
      setHasLoaded(true);
    } catch {
      setInsight("Unable to load AI insights at the moment.");
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-zinc-800 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-white">AI Pipeline Insight</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadInsight}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4" />
          )}
          {hasLoaded ? "Refresh" : "Analyze"}
        </Button>
      </div>

      {!hasLoaded && !isLoading && (
        <p className="text-sm text-zinc-600">
          Click analyze to get AI-powered insights about your pipeline.
        </p>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing your pipeline...
        </div>
      )}

      {hasLoaded && !isLoading && (
        <p className="text-sm text-zinc-300 leading-relaxed">{insight}</p>
      )}
    </div>
  );
}