"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { InlineSparkline } from "./InlineSparkline";
import type { RecessionIndicator, IndicatorCategory, IndicatorStatus } from "@/types";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "@/types";

const STATUS_DOT: Record<IndicatorStatus, string> = {
  safe: "bg-[#00CC66]",
  watch: "bg-[#F2C94C]",
  warning: "bg-[#F0913A]",
  danger: "bg-[#EB5757]",
};

const STATUS_RANK: Record<IndicatorStatus, number> = {
  danger: 0,
  warning: 1,
  watch: 2,
  safe: 3,
};

type SortKey = "status" | "name" | "value" | "change" | "category";
type SortDir = "asc" | "desc";

interface IndicatorTableProps {
  indicators: RecessionIndicator[];
  onSelect: (indicator: RecessionIndicator) => void;
}

function formatChange(pct: number | null | undefined): string {
  if (pct == null) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function changeColor(pct: number | null | undefined): string {
  if (pct == null) return "text-pulse-muted";
  if (pct <= -2) return "text-[#EB5757] font-semibold";
  if (pct < 0) return "text-[#F0913A]";
  if (pct >= 2) return "text-[#00CC66] font-semibold";
  if (pct > 0) return "text-[#00CC66]/70";
  return "text-pulse-muted";
}

function changeBg(pct: number | null | undefined): string {
  if (pct == null) return "";
  if (pct <= -5) return "bg-[#EB5757]/10";
  if (pct <= -2) return "bg-[#EB5757]/5";
  return "";
}

function ChangeIcon({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return <Minus className="h-3 w-3 text-pulse-border" />;
  if (pct < -0.01) return <TrendingDown className="h-3 w-3 text-[#EB5757]" />;
  if (pct > 0.01) return <TrendingUp className="h-3 w-3 text-[#00CC66]" />;
  return <Minus className="h-3 w-3 text-pulse-border" />;
}

export function IndicatorTable({ indicators, onSelect }: IndicatorTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("change");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "change" ? "asc" : "asc");
    }
  };

  const sorted = useMemo(() => {
    const copy = [...indicators];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      switch (sortKey) {
        case "status":
          return (STATUS_RANK[a.status] - STATUS_RANK[b.status]) * dir;
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "value":
          return ((a.numeric_value ?? 0) - (b.numeric_value ?? 0)) * dir;
        case "change": {
          const ac = a.daily_change_pct ?? 0;
          const bc = b.daily_change_pct ?? 0;
          return (ac - bc) * dir;
        }
        case "category": {
          const ai = CATEGORY_ORDER.indexOf(a.category);
          const bi = CATEGORY_ORDER.indexOf(b.category);
          return (ai - bi) * dir || a.name.localeCompare(b.name);
        }
        default:
          return 0;
      }
    });

    return copy;
  }, [indicators, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 text-pulse-border" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-white" />
    ) : (
      <ChevronDown className="h-3 w-3 text-white" />
    );
  };

  return (
    <div className="overflow-x-auto border border-pulse-border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 z-10 bg-pulse-dark border-b border-pulse-border">
          <tr>
            <th className="w-8 px-2 py-2">
              <button onClick={() => toggleSort("status")} className="flex items-center gap-0.5">
                <SortIcon col="status" />
              </button>
            </th>
            <th className="px-3 py-2 text-xs font-medium text-pulse-muted uppercase tracking-wider">
              <button onClick={() => toggleSort("name")} className="flex items-center gap-1">
                Name <SortIcon col="name" />
              </button>
            </th>
            <th className="px-3 py-2 text-xs font-medium text-pulse-muted uppercase tracking-wider text-right">
              <button onClick={() => toggleSort("value")} className="flex items-center gap-1 ml-auto">
                Value <SortIcon col="value" />
              </button>
            </th>
            <th className="px-3 py-2 text-xs font-medium text-pulse-muted uppercase tracking-wider text-right">
              <button onClick={() => toggleSort("change")} className="flex items-center gap-1 ml-auto">
                Chg <SortIcon col="change" />
              </button>
            </th>
            <th className="px-3 py-2 text-xs font-medium text-pulse-muted uppercase tracking-wider w-[90px]">
              Trend
            </th>
            <th className="px-3 py-2 text-xs font-medium text-pulse-muted uppercase tracking-wider hidden lg:table-cell">
              Signal
            </th>
            <th className="px-3 py-2 text-xs font-medium text-pulse-muted uppercase tracking-wider hidden xl:table-cell">
              Trigger
            </th>
            <th className="px-3 py-2 text-xs font-medium text-pulse-muted uppercase tracking-wider hidden md:table-cell">
              <button onClick={() => toggleSort("category")} className="flex items-center gap-1">
                Category <SortIcon col="category" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((indicator, i) => {
            const pct = indicator.daily_change_pct;
            const rowHighlight = changeBg(pct);
            return (
              <tr
                key={indicator.slug}
                onClick={() => onSelect(indicator)}
                className={`
                  cursor-pointer transition-colors duration-100
                  hover:bg-white/[0.04] border-b border-pulse-border/50
                  ${rowHighlight || (i % 2 === 0 ? "bg-pulse-card" : "bg-pulse-dark/50")}
                `}
              >
                <td className="px-2 py-2">
                  <div className={`w-2 h-2 rounded-full mx-auto ${STATUS_DOT[indicator.status]}`} />
                </td>
                <td className="px-3 py-2 font-medium text-white truncate max-w-[200px]">
                  {indicator.name}
                </td>
                <td className="px-3 py-2 text-right font-mono text-white whitespace-nowrap">
                  {indicator.latest_value}
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1">
                    <ChangeIcon pct={pct} />
                    <span className={`font-mono text-xs ${changeColor(pct)}`}>
                      {formatChange(pct)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <InlineSparkline slug={indicator.slug} status={indicator.status} />
                </td>
                <td className="px-3 py-2 text-pulse-muted text-xs truncate max-w-[220px] hidden lg:table-cell">
                  {indicator.signal}
                </td>
                <td className="px-3 py-2 text-pulse-muted text-xs truncate max-w-[160px] hidden xl:table-cell">
                  {indicator.trigger_level}
                </td>
                <td className="px-3 py-2 hidden md:table-cell">
                  <span className="text-[10px] text-pulse-muted px-1.5 py-0.5 border border-pulse-border rounded">
                    {CATEGORY_LABELS[indicator.category as IndicatorCategory]?.replace(" Indicators", "").replace("Real-Time / ", "") ?? indicator.category}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
