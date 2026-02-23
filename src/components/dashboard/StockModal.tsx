"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Sparkles,
  Loader2,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { StockSignal } from "@/types";
import { formatNumber, formatLargeNumber } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface StockModalProps {
  signal: StockSignal;
  onClose: () => void;
}

interface HistoryPoint {
  date: string;
  value: number;
}

export function StockModal({ signal, onClose }: StockModalProps) {
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryStreaming, setSummaryStreaming] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const pctBelowEMA = ((signal.price - signal.ema_200) / signal.ema_200 * 100).toFixed(1);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/stocks/${encodeURIComponent(signal.ticker)}/history`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      if (data.history?.length) {
        setHistory(data.history);
      } else {
        setHistoryError(data.error || "No price history available yet.");
      }
    } catch {
      setHistoryError("Could not load price history. Try refreshing.");
    } finally {
      setHistoryLoading(false);
    }
  }, [signal.ticker]);

  const fetchSummary = useCallback(async () => {
    const params = new URLSearchParams({
      price: signal.price.toString(),
      ema200: signal.ema_200.toString(),
      rsi: signal.rsi_14.toString(),
      pe: signal.forward_pe.toString(),
      yield: (signal.dividend_yield || 0).toString(),
      sector: signal.sector,
      signal: signal.signal_type,
      company: signal.company_name,
    });

    try {
      const res = await fetch(
        `/api/stocks/${encodeURIComponent(signal.ticker)}/summary?${params}`
      );
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
                  if (payload.error) {
                    setSummary(accumulated || "AI analysis temporarily unavailable.");
                    setSummaryStreaming(false);
                  }
                } catch {
                  // skip malformed SSE chunk
                }
              }
            }
          }
        }
      } else {
        const data = await res.json();
        setSummary(data.summary || "No analysis available.");
        setSummaryLoading(false);
      }
    } catch {
      setSummary(
        "Could not load AI analysis. The stock data above is still accurate — check back shortly."
      );
      setSummaryLoading(false);
    }
  }, [signal]);

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

  const chartColor = signal.rsi_14 < 30 ? "#EB5757" : "#F2C94C";

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
              <h2 className="text-xl font-bold font-mono text-white">${signal.ticker}</h2>
              <Badge
                status={signal.signal_type === "value_dividend" ? "watch" : "warning"}
              >
                {signal.signal_type === "value_dividend" ? "Value" : "Oversold"}
              </Badge>
            </div>
            <p className="text-sm text-pulse-muted">{signal.company_name}</p>
            <p className="text-xs text-pulse-muted mt-0.5">{signal.sector}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-pulse-dark transition-colors text-pulse-muted hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Key Metrics */}
        <div className="px-6 pt-5 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricBox
              icon={<DollarSign className="h-4 w-4" />}
              label="Price"
              value={`$${formatNumber(signal.price)}`}
              color="text-white"
            />
            <MetricBox
              icon={<TrendingDown className="h-4 w-4" />}
              label="200 EMA"
              value={`$${formatNumber(signal.ema_200)}`}
              sub={`${pctBelowEMA}%`}
              subColor="text-pulse-red"
              color="text-pulse-muted"
            />
            <MetricBox
              icon={<Activity className="h-4 w-4" />}
              label="RSI (14)"
              value={signal.rsi_14.toFixed(1)}
              color={signal.rsi_14 < 30 ? "text-pulse-red" : "text-pulse-yellow"}
            />
            <MetricBox
              icon={<BarChart3 className="h-4 w-4" />}
              label="Fwd P/E"
              value={formatNumber(signal.forward_pe, 1)}
              color="text-white"
            />
          </div>

          <div className="flex flex-wrap gap-3 mt-4 text-xs text-pulse-muted">
            {signal.dividend_yield && signal.dividend_yield > 0 && (
              <span>
                Div Yield:{" "}
                <span className="text-pulse-green font-mono">
                  {formatNumber(signal.dividend_yield, 1)}%
                </span>
              </span>
            )}
            <span>
              Mkt Cap: <span className="font-mono">{formatLargeNumber(signal.market_cap)}</span>
            </span>
          </div>
        </div>

        {/* Price Chart */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-white mb-3">6-Month Price History</h3>
          <div className="h-52 bg-pulse-dark rounded-xl border border-pulse-border p-3">
            {historyLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-pulse-muted animate-spin" />
              </div>
            ) : historyError || history.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-pulse-muted">
                {historyError || "No price history available"}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id={`grad-${signal.ticker}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
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
                    width={55}
                    tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0D0D0D",
                      border: "1px solid #2A2A2A",
                      borderRadius: "0px",
                      fontSize: "12px",
                      color: "#D4D4D4",
                    }}
                    labelFormatter={(d) => new Date(String(d)).toLocaleDateString()}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                  />
                  <ReferenceLine
                    y={signal.ema_200}
                    stroke="#6366f1"
                    strokeDasharray="6 3"
                    label={{
                      value: "200 EMA",
                      position: "right",
                      fill: "#6366f1",
                      fontSize: 10,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill={`url(#grad-${signal.ticker})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-pulse-green" />
            <h3 className="text-sm font-semibold text-white">AI Stock Analysis</h3>
            <span className="text-[10px] text-pulse-muted">(EMA · RSI · P/E considered)</span>
          </div>
          <div className="p-4 rounded-xl bg-pulse-dark border border-pulse-border min-h-[60px]">
            {summaryLoading ? (
              <div className="flex items-center gap-2 text-sm text-pulse-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing {signal.ticker}...
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

function MetricBox({
  icon,
  label,
  value,
  sub,
  subColor,
  color = "text-white",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  color?: string;
}) {
  return (
    <div className="bg-pulse-dark rounded-lg border border-pulse-border p-3">
      <div className="flex items-center gap-1.5 text-pulse-muted mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-mono font-bold text-lg ${color}`}>
        {value}
        {sub && (
          <span className={`text-xs ml-1 ${subColor || "text-pulse-muted"}`}>{sub}</span>
        )}
      </div>
    </div>
  );
}
