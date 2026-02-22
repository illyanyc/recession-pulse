"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Sparkles, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { RecessionIndicator, IndicatorStatus } from "@/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface IndicatorModalProps {
  indicator: RecessionIndicator;
  onClose: () => void;
}

interface HistoryPoint {
  date: string;
  value: number;
}

const STATUS_COLORS: Record<IndicatorStatus, string> = {
  safe: "#00ff87",
  watch: "#ffa502",
  warning: "#ff4757",
  danger: "#ff4757",
};

export function IndicatorModal({ indicator, onClose }: IndicatorModalProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryStreaming, setSummaryStreaming] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const color = STATUS_COLORS[indicator.status];

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/indicators/${indicator.slug}/history`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      if (data.history?.length) {
        setHistory(data.history);
      } else {
        setHistoryError("No historical data available yet.");
      }
    } catch {
      setHistoryError("Could not load historical data. Try refreshing.");
    } finally {
      setHistoryLoading(false);
    }
  }, [indicator.slug]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/indicators/${indicator.slug}/summary`);
      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        setSummaryStreaming(true);
        setSummaryLoading(false);
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = decoder.decode(value, { stream: true });
            const lines = text.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const payload = JSON.parse(line.slice(6));
                  if (payload.text) {
                    accumulated += payload.text;
                    setSummary(accumulated);
                  }
                  if (payload.done) {
                    setSummaryStreaming(false);
                  }
                } catch {
                  // skip malformed
                }
              }
            }
          }
        }
      } else {
        const data = await res.json();
        setSummary(data.summary || "No summary available.");
        setSummaryLoading(false);
      }
    } catch {
      setSummary("Could not load AI analysis. The indicator data above is still accurate — check back shortly.");
      setSummaryLoading(false);
    }
  }, [indicator.slug]);

  useEffect(() => {
    fetchHistory();
    fetchSummary();
  }, [fetchHistory, fetchSummary]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function handleBackdropClick(e: React.MouseEvent) {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }

  const TrendIcon = indicator.status === "safe"
    ? TrendingUp
    : indicator.status === "danger" || indicator.status === "warning"
      ? TrendingDown
      : Minus;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-pulse-card border border-pulse-border rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-6 pb-4 bg-pulse-card border-b border-pulse-border rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-white">{indicator.name}</h2>
              <Badge status={indicator.status} pulse={indicator.status === "danger"}>
                {indicator.status_text}
              </Badge>
            </div>
            <p className="text-xs text-pulse-muted">{indicator.category} indicator</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-pulse-dark transition-colors text-pulse-muted hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current value */}
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold font-mono text-white">{indicator.latest_value}</span>
            <TrendIcon className="h-5 w-5 mb-1" style={{ color }} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg">{indicator.signal_emoji}</span>
            <span className="text-sm text-pulse-muted">{indicator.signal}</span>
          </div>
          <p className="text-xs text-pulse-muted mt-1">
            Trigger: {indicator.trigger_level}
          </p>
        </div>

        {/* Chart */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-white mb-3">Historical Trend</h3>
          <div className="h-48 bg-pulse-dark rounded-xl border border-pulse-border p-3">
            {historyLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-pulse-muted animate-spin" />
              </div>
            ) : historyError || history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-pulse-muted">
                {historyError || "No historical data available"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id={`grad-${indicator.slug}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    tickFormatter={(d) => {
                      const dt = new Date(d);
                      return `${dt.getMonth() + 1}/${dt.getDate()}`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6b7280" }}
                    domain={["auto", "auto"]}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#12121a",
                      border: "1px solid #1e1e2e",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#e5e7eb",
                    }}
                    labelFormatter={(d) => new Date(String(d)).toLocaleDateString()}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad-${indicator.slug})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Summary */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-pulse-green" />
            <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
          </div>
          <div className="p-4 rounded-xl bg-pulse-dark border border-pulse-border min-h-[60px]">
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-sm text-pulse-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating analysis...
              </div>
            ) : (
              <p className="text-sm text-pulse-text leading-relaxed">
                {summary}
                {summaryStreaming && (
                  <span className="inline-block w-1.5 h-4 bg-pulse-green ml-0.5 animate-pulse align-text-bottom" />
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
