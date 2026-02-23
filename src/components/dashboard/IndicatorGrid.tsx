"use client";

import { useState, useCallback } from "react";
import { LayoutGrid, List, BarChart2, CreditCard } from "lucide-react";
import { IndicatorCard } from "./IndicatorCard";
import { IndicatorListRow } from "./IndicatorListRow";
import { IndicatorModal } from "./IndicatorModal";
import type { RecessionIndicator, ViewMode, CardDisplayMode, IndicatorCategory } from "@/types";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types";

interface IndicatorGridProps {
  indicators: RecessionIndicator[];
  initialViewMode?: ViewMode;
  initialCardDisplayMode?: CardDisplayMode;
}

function groupByCategory(indicators: RecessionIndicator[]): [string, RecessionIndicator[]][] {
  const grouped = new Map<string, RecessionIndicator[]>();
  for (const ind of indicators) {
    const cat = ind.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(ind);
  }
  return CATEGORY_ORDER
    .filter((cat) => grouped.has(cat))
    .map((cat) => [cat, grouped.get(cat)!] as [string, RecessionIndicator[]]);
}

function savePref(key: string, value: string) {
  fetch("/api/dashboard/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [key]: value }),
  }).catch(() => {});
}

export function IndicatorGrid({
  indicators,
  initialViewMode = "grid",
  initialCardDisplayMode = "card",
}: IndicatorGridProps) {
  const [selected, setSelected] = useState<RecessionIndicator | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [cardDisplayMode, setCardDisplayMode] = useState<CardDisplayMode>(initialCardDisplayMode);

  const dangerCount = indicators.filter((i) => i.status === "danger" || i.status === "warning").length;
  const watchCount = indicators.filter((i) => i.status === "watch").length;
  const safeCount = indicators.filter((i) => i.status === "safe").length;

  const toggleViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    savePref("dashboard_view_mode", mode);
  }, []);

  const toggleCardDisplay = useCallback((mode: CardDisplayMode) => {
    setCardDisplayMode(mode);
    savePref("card_display_mode", mode);
  }, []);

  return (
    <div>
      {/* Summary bar + toggles */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 p-4 bg-pulse-card border border-pulse-border">
        <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pulse-safe" />
            <span className="text-sm text-pulse-text">
              <span className="font-bold text-white">{safeCount}</span> Safe
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pulse-yellow" />
            <span className="text-sm text-pulse-text">
              <span className="font-bold text-white">{watchCount}</span> Watch
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pulse-red" />
            <span className="text-sm text-pulse-text">
              <span className="font-bold text-white">{dangerCount}</span> Alert
            </span>
          </div>
          <div className="ml-auto hidden sm:block">
            <span className="text-xs text-pulse-muted">
              {indicators.length > 0 && indicators[0].reading_date && `Last updated: ${new Date(indicators[0].reading_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Card display mode toggle (only relevant in grid view) */}
          {viewMode === "grid" && (
            <div className="flex items-center border border-pulse-border overflow-hidden" title="Default display: card details or chart">
              <button
                onClick={() => toggleCardDisplay("card")}
                className={`p-2 transition-colors ${
                  cardDisplayMode === "card"
                    ? "bg-pulse-green/10 text-pulse-green"
                    : "text-pulse-muted hover:text-white hover:bg-pulse-dark"
                }`}
                aria-label="Card default (chart on hover)"
                title="Card details · chart on hover"
              >
                <CreditCard className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleCardDisplay("chart")}
                className={`p-2 transition-colors ${
                  cardDisplayMode === "chart"
                    ? "bg-pulse-green/10 text-pulse-green"
                    : "text-pulse-muted hover:text-white hover:bg-pulse-dark"
                }`}
                aria-label="Chart default (card on hover)"
                title="Chart · card details on hover"
              >
                <BarChart2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex items-center border border-pulse-border overflow-hidden">
            <button
              onClick={() => toggleViewMode("grid")}
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
              onClick={() => toggleViewMode("list")}
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
      </div>

      {/* Grid view — grouped by category */}
      {viewMode === "grid" && (
        <div className="space-y-8">
          {groupByCategory(indicators).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-pulse-muted uppercase tracking-wider mb-3">
                {CATEGORY_LABELS[category as IndicatorCategory] ?? category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((indicator) => (
                  <IndicatorCard
                    key={indicator.slug}
                    indicator={indicator}
                    displayMode={cardDisplayMode}
                    onClick={() => setSelected(indicator)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view — grouped by category */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {groupByCategory(indicators).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-pulse-muted uppercase tracking-wider mb-2">
                {CATEGORY_LABELS[category as IndicatorCategory] ?? category}
              </h3>
              <div className="space-y-2">
                {items.map((indicator) => (
                  <IndicatorListRow
                    key={indicator.slug}
                    indicator={indicator}
                    onClick={() => setSelected(indicator)}
                  />
                ))}
              </div>
            </div>
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
