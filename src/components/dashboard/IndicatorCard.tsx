"use client";

import { useState, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import type { RecessionIndicator, IndicatorStatus } from "@/types";
import { TrendingDown, TrendingUp, Minus, Sparkles, Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface IndicatorCardProps {
  indicator: RecessionIndicator;
  onClick?: () => void;
}

interface HistoryPoint {
  date: string;
  value: number;
}

const STATUS_BORDER: Record<IndicatorStatus, string> = {
  safe: "hover:border-pulse-green/40 hover:shadow-[0_0_20px_rgba(0,255,135,0.06)]",
  watch: "hover:border-pulse-yellow/40 hover:shadow-[0_0_20px_rgba(255,165,2,0.06)]",
  warning: "hover:border-pulse-red/40 hover:shadow-[0_0_20px_rgba(255,71,87,0.06)]",
  danger: "hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(255,71,87,0.08)]",
};

const STATUS_CHART_COLOR: Record<IndicatorStatus, string> = {
  safe: "#00ff87",
  watch: "#ffa502",
  warning: "#ff4757",
  danger: "#ff4757",
};

function TrendIcon({ status }: { status: IndicatorStatus }) {
  if (status === "safe") return <TrendingUp className="h-3.5 w-3.5 text-pulse-green" />;
  if (status === "danger" || status === "warning") return <TrendingDown className="h-3.5 w-3.5 text-pulse-red" />;
  return <Minus className="h-3.5 w-3.5 text-pulse-yellow" />;
}

export function IndicatorCard({ indicator, onClick }: IndicatorCardProps) {
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const fetchedRef = useRef(false);

  const color = STATUS_CHART_COLOR[indicator.status];

  const handleMouseEnter = useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setChartLoading(true);

    fetch(`/api/indicators/${indicator.slug}/history`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.history?.length) setHistory(data.history);
      })
      .catch(() => {})
      .finally(() => setChartLoading(false));
  }, [indicator.slug]);

  return (
    <div
      className={`group relative bg-pulse-card border border-pulse-border rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${STATUS_BORDER[indicator.status]}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* ---- DEFAULT STATE ---- */}
      <div className="p-5 transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">{indicator.name}</h3>
            <p className="text-xs text-pulse-muted mt-0.5">{indicator.category}</p>
          </div>
          <Badge status={indicator.status} pulse={indicator.status === "danger"}>
            {indicator.status_text}
          </Badge>
        </div>

        <div className="flex items-end gap-3 mb-3">
          <span className="text-2xl font-bold font-mono text-white">
            {indicator.latest_value}
          </span>
          <TrendIcon status={indicator.status} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{indicator.signal_emoji}</span>
            <span className="text-xs text-pulse-muted">{indicator.signal}</span>
          </div>
          <div className="text-xs text-pulse-muted">
            Trigger: {indicator.trigger_level}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-pulse-border">
          <span className="text-xs text-pulse-muted">
            Updated {new Date(indicator.updated_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* ---- HOVER STATE: metrics top + mini chart ---- */}
      <div className="absolute inset-0 flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 bg-pulse-card">
        {/* Compressed metrics row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-white truncate">{indicator.name}</span>
            <TrendIcon status={indicator.status} />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-bold font-mono text-white">{indicator.latest_value}</span>
            <Badge status={indicator.status} className="text-[10px] px-1.5 py-0.5">
              {indicator.status_text}
            </Badge>
          </div>
        </div>

        {/* Mini chart area */}
        <div className="flex-1 px-2 pb-1">
          {chartLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-pulse-muted animate-spin" />
            </div>
          ) : history && history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id={`minigrad-${indicator.slug}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "#12121a",
                    border: "1px solid #1e1e2e",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    color: "#e5e7eb",
                  }}
                  labelFormatter={(d: string) => new Date(d + "T00:00:00").toLocaleDateString()}
                  formatter={(value: number) => [value.toLocaleString(), "Value"]}
                  cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#minigrad-${indicator.slug})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-pulse-muted">
              No chart data
            </div>
          )}
        </div>

        {/* Bottom row: trigger + CTA */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-pulse-border/50">
          <span className="text-[10px] text-pulse-muted truncate">
            Trigger: {indicator.trigger_level}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Sparkles className="h-3 w-3 text-pulse-green" />
            <span className="text-[10px] font-medium text-pulse-green">AI analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
