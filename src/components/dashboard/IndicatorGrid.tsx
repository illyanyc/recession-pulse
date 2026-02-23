"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { IndicatorCard } from "./IndicatorCard";
import { IndicatorListRow } from "./IndicatorListRow";
import { IndicatorModal } from "./IndicatorModal";
import type { RecessionIndicator } from "@/types";

interface IndicatorGridProps {
  indicators: RecessionIndicator[];
}

type ViewMode = "grid" | "list";

export function IndicatorGrid({ indicators }: IndicatorGridProps) {
  const [selected, setSelected] = useState<RecessionIndicator | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const dangerCount = indicators.filter((i) => i.status === "danger" || i.status === "warning").length;
  const watchCount = indicators.filter((i) => i.status === "watch").length;
  const safeCount = indicators.filter((i) => i.status === "safe").length;

  return (
    <div>
      {/* Summary bar + view toggle */}
      <div className="flex items-center gap-4 sm:gap-6 mb-6 p-4 rounded-xl bg-pulse-card border border-pulse-border">
        <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pulse-safe" />
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
          <div className="ml-auto hidden sm:block">
            <span className="text-xs text-pulse-muted">
              {indicators.length > 0 && `Last updated: ${new Date(indicators[0].updated_at).toLocaleDateString()}`}
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-pulse-border rounded-lg overflow-hidden flex-shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-pulse-green/10 text-pulse-green"
                : "text-pulse-muted hover:text-white hover:bg-pulse-dark"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-pulse-green/10 text-pulse-green"
                : "text-pulse-muted hover:text-white hover:bg-pulse-dark"
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {indicators.map((indicator) => (
            <IndicatorCard
              key={indicator.slug}
              indicator={indicator}
              onClick={() => setSelected(indicator)}
            />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="space-y-2">
          {indicators.map((indicator) => (
            <IndicatorListRow
              key={indicator.slug}
              indicator={indicator}
              onClick={() => setSelected(indicator)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <IndicatorModal
          indicator={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
