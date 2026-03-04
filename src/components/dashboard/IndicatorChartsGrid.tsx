"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
} from "recharts";
import type { RecessionIndicator, IndicatorCategory, IndicatorStatus } from "@/types";
import { CATEGORY_ORDER, CATEGORY_LABELS } from "@/types";

const STATUS_COLORS: Record<IndicatorStatus, string> = {
  safe: "#00CC66",
  watch: "#F2C94C",
  warning: "#F0913A",
  danger: "#EB5757",
};

const STATUS_BADGE: Record<IndicatorStatus, string> = {
  safe: "bg-[#00CC66]/15 text-[#00CC66]",
  watch: "bg-[#F2C94C]/15 text-[#F2C94C]",
  warning: "bg-[#F0913A]/15 text-[#F0913A]",
  danger: "bg-[#EB5757]/15 text-[#EB5757]",
};

function groupByCategory(indicators: RecessionIndicator[]): [string, RecessionIndicator[]][] {
  const grouped = new Map<string, RecessionIndicator[]>();
  for (const ind of indicators) {
    if (!grouped.has(ind.category)) grouped.set(ind.category, []);
    grouped.get(ind.category)!.push(ind);
  }
  return CATEGORY_ORDER
    .filter((cat) => grouped.has(cat))
    .map((cat) => [cat, grouped.get(cat)!.sort((a, b) => a.name.localeCompare(b.name))] as [string, RecessionIndicator[]]);
}

function MiniChart({
  indicator,
  onClick,
}: {
  indicator: RecessionIndicator;
  onClick: () => void;
}) {
  const [history, setHistory] = useState<{ date: string; value: number }[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fetchedRef = useRef(false);

  const fetchHistory = useCallback(async () => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    try {
      const res = await fetch(`/api/indicators/${indicator.slug}/history`);
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.history ?? []);
    } catch {
      /* silent */
    }
  }, [indicator.slug]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchHistory();
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchHistory]);

  const color = STATUS_COLORS[indicator.status];
  const gradId = `cg-${indicator.slug}`;

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="h-[140px] bg-pulse-card border border-pulse-border cursor-pointer hover:border-pulse-muted/50 transition-colors overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 min-w-0">
        <div className="truncate text-[11px] text-pulse-muted leading-tight flex-1 mr-2">
          {indicator.name}
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 font-medium shrink-0 ${STATUS_BADGE[indicator.status]}`}>
          {indicator.status_text}
        </span>
      </div>
      <div className="px-3 pb-1">
        <span className="text-sm font-bold text-white">{indicator.latest_value}</span>
      </div>

      {/* Chart area */}
      <div className="flex-1 px-1 pb-1 min-h-0">
        {history && history.length >= 2 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={["auto", "auto"]} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D0D0D",
                  border: "1px solid #2A2A2A",
                  borderRadius: 4,
                  fontSize: 11,
                  padding: "4px 8px",
                }}
                labelStyle={{ color: "#808080", fontSize: 10 }}
                itemStyle={{ color: "#D4D4D4" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#${gradId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-pulse-border/10 animate-pulse" />
        )}
      </div>
    </div>
  );
}

interface IndicatorChartsGridProps {
  indicators: RecessionIndicator[];
  onSelect: (indicator: RecessionIndicator) => void;
}

export function IndicatorChartsGrid({ indicators, onSelect }: IndicatorChartsGridProps) {
  const groups = groupByCategory(indicators);

  return (
    <div className="space-y-6">
      {groups.map(([category, items]) => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-pulse-muted uppercase tracking-wider mb-2">
            {CATEGORY_LABELS[category as IndicatorCategory] ?? category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {items.map((indicator) => (
              <MiniChart
                key={indicator.slug}
                indicator={indicator}
                onClick={() => onSelect(indicator)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
