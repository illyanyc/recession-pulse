"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { LayoutGrid, List, BarChart2, CreditCard, Lock, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StockListRow } from "./StockListRow";
import { StockModal } from "./StockModal";
import type { StockSignal } from "@/types";
import type { ViewMode, CardDisplayMode } from "@/types";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
} from "recharts";

interface StockScreenerProps {
  signals: StockSignal[];
  isPro: boolean;
}

function savePref(key: string, value: string) {
  fetch("/api/dashboard/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [key]: value }),
  }).catch(() => {});
}

export function StockScreener({ signals, isPro }: StockScreenerProps) {
  const [selectedStock, setSelectedStock] = useState<StockSignal | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [cardDisplayMode, setCardDisplayMode] = useState<CardDisplayMode>("card");


  if (!isPro) {
    return (
      <Card className="text-center py-12">
        <Lock className="h-12 w-12 text-pulse-muted mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Long-Term Buy Candidates — Pro Only</h3>
        <p className="text-sm text-pulse-muted max-w-md mx-auto mb-6">
          Get daily stock picks optimized for long-term investing during uncertain markets.
          We screen for undervalued large-caps trading below their 200-day EMA with low P/E, strong dividends,
          and oversold growth stocks with RSI &lt; 30.
        </p>
        <Link href="/pricing">
          <Button>Upgrade to Pulse Pro — $9.99/mo</Button>
        </Link>
      </Card>
    );
  }

  const valuePicks = signals.filter((s) => s.signal_type === "value_dividend");
  const oversoldPicks = signals.filter((s) => s.signal_type === "oversold_growth");
  const defensivePicks = signals.filter((s) => s.signal_type === "defensive");

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const toggleCardDisplay = (mode: CardDisplayMode) => {
    setCardDisplayMode(mode);
  };

  return (
    <>
      <div>
        {/* Summary bar + toggles */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 p-4 bg-pulse-card border border-pulse-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-1 min-w-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2" title="P/E ≤ 12 · Div Yield ≥ 2.5% · Mkt Cap ≥ $10B · Below 200 EMA">
                <span className="w-2.5 h-2.5 rounded-full bg-pulse-yellow" />
                <span className="text-sm text-pulse-text">
                  <span className="font-bold text-white">{valuePicks.length}</span> Value &amp; Dividend
                </span>
              </div>
              <div className="flex items-center gap-2" title="P/E ≤ 15 · RSI < 30 · Mkt Cap ≥ $5B · Below 200 EMA">
                <span className="w-2.5 h-2.5 rounded-full bg-pulse-red" />
                <span className="text-sm text-pulse-text">
                  <span className="font-bold text-white">{oversoldPicks.length}</span> Oversold Growth
                </span>
              </div>
              {defensivePicks.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className="text-sm text-pulse-text">
                    <span className="font-bold text-white">{defensivePicks.length}</span> Defensive
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] text-pulse-muted">
              <span>All below 200-day EMA</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{signals.length} stocks · {signals.length > 0 && `Screened ${new Date(signals[0].screened_at).toLocaleDateString()}`}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
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

        {/* Strategy explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="px-4 py-3 rounded-lg bg-pulse-yellow/5 border border-pulse-yellow/15">
            <h4 className="text-xs font-semibold text-pulse-yellow mb-1">Value &amp; Dividend</h4>
            <p className="text-[11px] text-pulse-muted leading-relaxed">
              Large-cap stocks (≥$10B) with P/E ≤ 12, dividend yield ≥ 2.5%, and price below 200-day EMA. Cheap, income-generating, recession-resilient.
            </p>
          </div>
          <div className="px-4 py-3 rounded-lg bg-pulse-red/5 border border-pulse-red/15">
            <h4 className="text-xs font-semibold text-pulse-red mb-1">Oversold Growth</h4>
            <p className="text-[11px] text-pulse-muted leading-relaxed">
              Mid-to-large cap stocks (≥$5B) with P/E ≤ 15, RSI below 30 (oversold), and price below 200-day EMA. Beaten-down growth at discount prices.
            </p>
          </div>
        </div>

        {/* Grid view */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {signals.map((signal) => (
              <StockCard
                key={signal.ticker}
                signal={signal}
                displayMode={cardDisplayMode}
                onClick={() => setSelectedStock(signal)}
              />
            ))}
          </div>
        )}

        {/* List view */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {signals.map((signal) => (
              <StockListRow
                key={signal.ticker}
                signal={signal}
                onClick={() => setSelectedStock(signal)}
              />
            ))}
          </div>
        )}

        {signals.length === 0 && (
          <Card className="text-center py-8">
            <p className="text-sm text-pulse-muted">No stocks passing strict filters today. Patience is alpha.</p>
          </Card>
        )}
      </div>

      {selectedStock && (
        <StockModal signal={selectedStock} onClose={() => setSelectedStock(null)} />
      )}
    </>
  );
}

interface HistoryPoint {
  date: string;
  value: number;
}

const SIGNAL_BORDER: Record<string, string> = {
  value_dividend: "hover:border-pulse-yellow/40 hover:shadow-[0_0_20px_rgba(242,201,76,0.06)]",
  oversold_growth: "hover:border-pulse-red/40 hover:shadow-[0_0_20px_rgba(235,87,87,0.06)]",
  defensive: "hover:border-pulse-safe/40 hover:shadow-[0_0_20px_rgba(0,204,102,0.06)]",
};

function StockCardDetails({ signal }: { signal: StockSignal }) {
  const pctBelowEMA = ((signal.price - signal.ema_200) / signal.ema_200 * 100).toFixed(1);

  return (
    <>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold font-mono text-white">${signal.ticker}</span>
            <span className="text-xs text-pulse-muted">{signal.company_name}</span>
          </div>
          <p className="text-xs text-pulse-muted mt-0.5">{signal.sector}</p>
        </div>
        <Badge status={signal.signal_type === "value_dividend" ? "watch" : "warning"}>
          {signal.signal_type === "value_dividend" ? "Value Buy" : "Oversold Buy"}
        </Badge>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <span className="text-2xl font-bold font-mono text-white">${formatNumber(signal.price)}</span>
        <TrendingDown className="h-4 w-4 text-pulse-red" />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-pulse-muted block">200 EMA</span>
          <span className="font-mono text-pulse-muted">${formatNumber(signal.ema_200)}</span>
        </div>
        <div>
          <span className="text-pulse-muted block">Fwd P/E</span>
          <span className="font-mono text-white">{formatNumber(signal.forward_pe, 1)}</span>
        </div>
        <div>
          <span className="text-pulse-muted block">% Below EMA</span>
          <span className="font-mono text-pulse-red">{pctBelowEMA}%</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-pulse-border">
        <span className="text-xs text-pulse-muted">
          {signal.signal_type === "value_dividend"
            ? `P/E ${formatNumber(signal.forward_pe, 1)} · Yield ${formatNumber(signal.dividend_yield, 1)}% · RSI ${(signal.rsi_14 ?? 0).toFixed(0)}`
            : `RSI ${(signal.rsi_14 ?? 0).toFixed(0)} · P/E ${formatNumber(signal.forward_pe, 1)} · Below 200 DMA`}
        </span>
      </div>
    </>
  );
}

function StockChartView({
  signal,
  history,
  chartLoading,
  color,
}: {
  signal: StockSignal;
  history: HistoryPoint[] | null;
  chartLoading: boolean;
  color: string;
}) {
  const pctBelowEMA = ((signal.price - signal.ema_200) / signal.ema_200 * 100).toFixed(1);

  return (
    <>
      <div className="px-4 pt-3 pb-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono text-white">${signal.ticker}</span>
          <TrendingDown className="h-3.5 w-3.5 text-pulse-red" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold font-mono text-white">${formatNumber(signal.price)}</span>
          <span className="text-[10px] font-mono text-pulse-red">{pctBelowEMA}%</span>
          <Badge
            status={signal.rsi_14 < 30 ? "warning" : "watch"}
            className="text-[10px] px-1.5 py-0.5"
          >
            RSI {signal.rsi_14.toFixed(0)}
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
                <linearGradient id={`minigrad-${signal.ticker}`} x1="0" y1="0" x2="0" y2="1">
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
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "3 3" }}
              />
              <ReferenceLine
                y={signal.ema_200}
                stroke="#6366f1"
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#minigrad-${signal.ticker})`}
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
        <span className="text-[10px] text-pulse-muted truncate">{signal.sector} · {signal.company_name}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Sparkles className="h-3 w-3 text-pulse-green" />
          <span className="text-[10px] font-medium text-pulse-green">Full analysis</span>
        </div>
      </div>
    </>
  );
}

function StockCard({
  signal,
  displayMode = "card",
  onClick,
}: {
  signal: StockSignal;
  displayMode?: CardDisplayMode;
  onClick: () => void;
}) {
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const fetchedRef = useRef(false);

  const chartColor = signal.rsi_14 < 30 ? "#EB5757" : "#F2C94C";
  const isChartDefault = displayMode === "chart";
  const borderClass = SIGNAL_BORDER[signal.signal_type] || SIGNAL_BORDER.oversold_growth;

  const fetchHistory = useCallback(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setChartLoading(true);

    fetch(`/api/stocks/${encodeURIComponent(signal.ticker)}/history`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.history?.length) setHistory(data.history);
      })
      .catch(() => {})
      .finally(() => setChartLoading(false));
  }, [signal.ticker]);

  useEffect(() => {
    if (isChartDefault) fetchHistory();
  }, [isChartDefault, fetchHistory]);

  return (
    <div
      className={`group relative h-[200px] bg-pulse-card border border-pulse-border cursor-pointer transition-all duration-300 overflow-hidden ${borderClass}`}
      onClick={onClick}
      onMouseEnter={isChartDefault ? undefined : fetchHistory}
    >
      {/* Default layer */}
      <div className={`${isChartDefault ? "flex flex-col" : "p-5"} h-full transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none`}>
        {isChartDefault ? (
          <StockChartView signal={signal} history={history} chartLoading={chartLoading} color={chartColor} />
        ) : (
          <StockCardDetails signal={signal} />
        )}
      </div>

      {/* Hover layer */}
      <div className={`absolute inset-0 ${isChartDefault ? "p-5" : "flex flex-col"} opacity-0 group-hover:opacity-100 transition-all duration-300 bg-pulse-card`}>
        {isChartDefault ? (
          <StockCardDetails signal={signal} />
        ) : (
          <StockChartView signal={signal} history={history} chartLoading={chartLoading} color={chartColor} />
        )}
      </div>
    </div>
  );
}
