"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import type { RecessionIndicator, IndicatorStatus, CardDisplayMode } from "@/types";
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
  displayMode?: CardDisplayMode;
  onClick?: () => void;
}

interface HistoryPoint {
  date: string;
  value: number;
}

const STATUS_BORDER: Record<IndicatorStatus, string> = {
  safe: "hover:border-pulse-safe/40 hover:shadow-[0_0_20px_rgba(0,204,102,0.06)]",
  watch: "hover:border-pulse-yellow/40 hover:shadow-[0_0_20px_rgba(255,204,0,0.06)]",
  warning: "hover:border-pulse-red/40 hover:shadow-[0_0_20px_rgba(255,51,51,0.06)]",
  danger: "hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(255,51,51,0.08)]",
};

const STATUS_CHART_COLOR: Record<IndicatorStatus, string> = {
  safe: "#00CC66",
  watch: "#FFCC00",
  warning: "#FF3333",
  danger: "#FF3333",
};

function TrendIcon({ status }: { status: IndicatorStatus }) {
  if (status === "safe") return <TrendingUp className="h-3.5 w-3.5 text-pulse-safe" />;
  if (status === "danger" || status === "warning") return <TrendingDown className="h-3.5 w-3.5 text-pulse-red" />;
  return <Minus className="h-3.5 w-3.5 text-pulse-yellow" />;
}

function CardDetails({ indicator }: { indicator: RecessionIndicator }) {
  return (
    <>
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
      <div className="text-xs text-pulse-muted">
        Trigger: {indicator.trigger_level}
      </div>
      <div className="mt-3 pt-3 border-t border-pulse-border">
        <span className="text-xs text-pulse-muted">
          Updated {new Date(indicator.updated_at).toLocaleDateString()}
        </span>
      </div>
    </>
  );
}

function ChartView({
  indicator,
  history,
  chartLoading,
  color,
}: {
  indicator: RecessionIndicator;
  history: HistoryPoint[] | null;
  chartLoading: boolean;
  color: string;
}) {
  return (
    <>
      <div className="px-4 pt-3 pb-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">{indicator.name}</span>
          <TrendIcon status={indicator.status} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono text-white">{indicator.latest_value}</span>
          <Badge status={indicator.status} className="text-[10px] px-1.5 py-0.5">
            {indicator.status_text}
          </Badge>
        </div>
      </div>

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
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "#0D0D0D",
                  border: "1px solid #2A2A2A",
                  borderRadius: "0px",
                  padding: "4px 8px",
                  fontSize: "11px",
                  color: "#D4D4D4",
                }}
                labelFormatter={(d) => new Date(String(d) + "T00:00:00").toLocaleDateString()}
                formatter={(value) => [Number(value).toLocaleString(), "Value"]}
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

      <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-pulse-border/50">
        <span className="text-[10px] text-pulse-muted truncate">
          Trigger: {indicator.trigger_level}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Sparkles className="h-3 w-3 text-pulse-green" />
          <span className="text-[10px] font-medium text-pulse-green">AI analysis</span>
        </div>
      </div>
    </>
  );
}

export function IndicatorCard({ indicator, displayMode = "card", onClick }: IndicatorCardProps) {
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const fetchedRef = useRef(false);

  const color = STATUS_CHART_COLOR[indicator.status];
  const isChartDefault = displayMode === "chart";

  const fetchHistory = useCallback(() => {
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

  useEffect(() => {
    if (isChartDefault) fetchHistory();
  }, [isChartDefault, fetchHistory]);

  return (
    <div
      className={`group relative h-[200px] bg-pulse-card border border-pulse-border cursor-pointer transition-all duration-300 overflow-hidden ${STATUS_BORDER[indicator.status]}`}
      onClick={onClick}
      onMouseEnter={isChartDefault ? undefined : fetchHistory}
    >
      {/* Default layer */}
      <div className={`${isChartDefault ? "flex flex-col" : "p-5"} h-full transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none`}>
        {isChartDefault ? (
          <ChartView indicator={indicator} history={history} chartLoading={chartLoading} color={color} />
        ) : (
          <CardDetails indicator={indicator} />
        )}
      </div>

      {/* Hover layer */}
      <div className={`absolute inset-0 ${isChartDefault ? "p-5" : "flex flex-col"} opacity-0 group-hover:opacity-100 transition-all duration-300 bg-pulse-card`}>
        {isChartDefault ? (
          <CardDetails indicator={indicator} />
        ) : (
          <ChartView indicator={indicator} history={history} chartLoading={chartLoading} color={color} />
        )}
      </div>
    </div>
  );
}
