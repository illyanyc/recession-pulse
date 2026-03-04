"use client";

import type { RecessionIndicator, IndicatorCategory } from "@/types";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "@/types";

const STATUS_BG: Record<string, string> = {
  safe: "bg-[#00CC66]/10 border-l-[#00CC66] hover:bg-[#00CC66]/20 hover:shadow-[0_0_12px_rgba(0,204,102,0.15)]",
  watch: "bg-[#F2C94C]/10 border-l-[#F2C94C] hover:bg-[#F2C94C]/20 hover:shadow-[0_0_12px_rgba(242,201,76,0.15)]",
  warning: "bg-[#F0913A]/10 border-l-[#F0913A] hover:bg-[#F0913A]/20 hover:shadow-[0_0_12px_rgba(240,145,58,0.15)]",
  danger: "bg-[#EB5757]/10 border-l-[#EB5757] hover:bg-[#EB5757]/20 hover:shadow-[0_0_12px_rgba(235,87,87,0.15)]",
};

const STATUS_TEXT: Record<string, string> = {
  safe: "text-[#00CC66]",
  watch: "text-[#F2C94C]",
  warning: "text-[#F0913A]",
  danger: "text-[#EB5757]",
};

interface IndicatorHeatMapProps {
  indicators: RecessionIndicator[];
  onSelect: (indicator: RecessionIndicator) => void;
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
    .map((cat) => [cat, grouped.get(cat)!.sort((a, b) => a.name.localeCompare(b.name))] as [string, RecessionIndicator[]]);
}

export function IndicatorHeatMap({ indicators, onSelect }: IndicatorHeatMapProps) {
  const groups = groupByCategory(indicators);

  return (
    <div className="space-y-6">
      {groups.map(([category, items]) => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-pulse-muted uppercase tracking-wider mb-2">
            {CATEGORY_LABELS[category as IndicatorCategory] ?? category}
            <span className="ml-2 text-pulse-border font-normal">({items.length})</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {items.map((indicator) => (
              <button
                key={indicator.slug}
                onClick={() => onSelect(indicator)}
                className={`
                  border-l-[3px] px-3 py-2 min-w-[150px] max-w-[200px] flex-1
                  cursor-pointer transition-all duration-200
                  ${STATUS_BG[indicator.status] ?? STATUS_BG.watch}
                `}
              >
                <div className="text-[11px] text-pulse-muted truncate leading-tight">
                  {indicator.name}
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-sm font-bold text-white truncate">
                    {indicator.latest_value}
                  </span>
                  <span className={`text-[10px] font-medium ${STATUS_TEXT[indicator.status] ?? "text-pulse-muted"}`}>
                    {indicator.status_text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
