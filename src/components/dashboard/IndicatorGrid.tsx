"use client";

import { IndicatorCard } from "./IndicatorCard";
import type { RecessionIndicator } from "@/types";

interface IndicatorGridProps {
  indicators: RecessionIndicator[];
}

export function IndicatorGrid({ indicators }: IndicatorGridProps) {
  const dangerCount = indicators.filter((i) => i.status === "danger" || i.status === "warning").length;
  const watchCount = indicators.filter((i) => i.status === "watch").length;
  const safeCount = indicators.filter((i) => i.status === "safe").length;

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-6 mb-6 p-4 rounded-xl bg-pulse-card border border-pulse-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pulse-green" />
          <span className="text-sm text-pulse-text">
            <span className="font-bold text-white">{safeCount}</span> Safe
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pulse-yellow" />
          <span className="text-sm text-pulse-text">
            <span className="font-bold text-white">{watchCount}</span> Watch
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pulse-red" />
          <span className="text-sm text-pulse-text">
            <span className="font-bold text-white">{dangerCount}</span> Alert
          </span>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-pulse-muted">
            {indicators.length > 0 && `Last updated: ${new Date(indicators[0].updated_at).toLocaleDateString()}`}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((indicator) => (
          <IndicatorCard key={indicator.slug} indicator={indicator} />
        ))}
      </div>
    </div>
  );
}
