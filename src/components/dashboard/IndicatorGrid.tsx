"use client";

import { useState, useCallback } from "react";
import { LayoutGrid, Table2, BarChart2 } from "lucide-react";
import { IndicatorHeatMap } from "./IndicatorHeatMap";
import { IndicatorTable } from "./IndicatorTable";
import { IndicatorChartsGrid } from "./IndicatorChartsGrid";
import { IndicatorModal } from "./IndicatorModal";
import type { RecessionIndicator, ViewMode } from "@/types";

interface IndicatorGridProps {
  indicators: RecessionIndicator[];
  initialViewMode?: ViewMode;
}

function savePref(key: string, value: string) {
  fetch("/api/dashboard/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [key]: value }),
  }).catch(() => {});
}

const VIEW_MODES: { mode: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { mode: "heatmap", icon: LayoutGrid, label: "Heat Map" },
  { mode: "table", icon: Table2, label: "Table" },
  { mode: "charts", icon: BarChart2, label: "Charts" },
];

export function IndicatorGrid({
  indicators,
  initialViewMode = "table",
}: IndicatorGridProps) {
  const [selected, setSelected] = useState<RecessionIndicator | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  const dangerCount = indicators.filter((i) => i.status === "danger" || i.status === "warning").length;
  const watchCount = indicators.filter((i) => i.status === "watch").length;
  const safeCount = indicators.filter((i) => i.status === "safe").length;

  const toggleViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    savePref("dashboard_view_mode", mode);
  }, []);

  return (
    <div>
      {/* Summary bar + view toggle */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4 p-3 bg-pulse-card border border-pulse-border">
        <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-pulse-safe" />
            <span className="text-xs text-pulse-text">
              <span className="font-bold text-white">{safeCount}</span> Safe
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-pulse-yellow" />
            <span className="text-xs text-pulse-text">
              <span className="font-bold text-white">{watchCount}</span> Watch
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-pulse-red" />
            <span className="text-xs text-pulse-text">
              <span className="font-bold text-white">{dangerCount}</span> Alert
            </span>
          </div>
          <div className="ml-auto hidden sm:block">
            <span className="text-[10px] text-pulse-muted">
              {indicators.length} indicators
              {indicators.length > 0 && indicators[0].reading_date &&
                ` · ${new Date(indicators[0].reading_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              }
            </span>
          </div>
        </div>

        <div className="flex items-center border border-pulse-border overflow-hidden flex-shrink-0">
          {VIEW_MODES.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => toggleViewMode(mode)}
              className={`p-2 transition-colors ${
                viewMode === mode
                  ? "bg-pulse-green/10 text-pulse-green"
                  : "text-pulse-muted hover:text-white hover:bg-pulse-dark"
              }`}
              aria-label={label}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      {viewMode === "heatmap" && (
        <IndicatorHeatMap indicators={indicators} onSelect={setSelected} />
      )}
      {viewMode === "table" && (
        <IndicatorTable indicators={indicators} onSelect={setSelected} />
      )}
      {viewMode === "charts" && (
        <IndicatorChartsGrid indicators={indicators} onSelect={setSelected} />
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
