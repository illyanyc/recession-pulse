"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { StockSignal } from "@/types";
import { formatLargeNumber, formatNumber } from "@/lib/utils";
import { Lock, TrendingDown, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StockModal } from "./StockModal";
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

export function StockScreener({ signals, isPro }: StockScreenerProps) {
  const [selectedStock, setSelectedStock] = useState<StockSignal | null>(null);

  if (!isPro) {
    return (
      <Card className="text-center py-12">
        <Lock className="h-12 w-12 text-pulse-muted mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Stock Screener — Pro Only</h3>
        <p className="text-sm text-pulse-muted max-w-md mx-auto mb-6">
          Get daily stock picks filtered for recession defense. Stocks below 200 EMA, RSI &lt;30,
          P/E &lt;15. Value dividend plays and oversold growth opportunities.
        </p>
        <Link href="/pricing">
          <Button>Upgrade to Pulse Pro — $14.99/mo</Button>
        </Link>
      </Card>
    );
  }

  const valuePicks = signals.filter((s) => s.signal_type === "value_dividend");
  const oversoldPicks = signals.filter((s) => s.signal_type === "oversold_growth");

  return (
    <>
      <div className="space-y-6">
        {/* Value Dividend Picks */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-xl">💰</span> Value / Dividend Picks
            <span className="text-xs text-pulse-muted font-normal">P/E &lt;12, Yield &gt;2.5%, Below 200 EMA</span>
          </h3>

          {valuePicks.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-pulse-muted">No value/dividend stocks passing strict filters today.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {valuePicks.map((signal) => (
                <StockCard key={signal.ticker} signal={signal} onClick={() => setSelectedStock(signal)} />
              ))}
            </div>
          )}
        </div>

        {/* Oversold Growth */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-xl">📉</span> Oversold Growth
            <span className="text-xs text-pulse-muted font-normal">RSI &lt;30, P/E &lt;15, Below 200 EMA</span>
          </h3>

          {oversoldPicks.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm text-pulse-muted">No oversold growth stocks passing filters today. Patience is alpha.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {oversoldPicks.map((signal) => (
                <StockCard key={signal.ticker} signal={signal} onClick={() => setSelectedStock(signal)} />
              ))}
            </div>
          )}
        </div>
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

function StockCard({ signal, onClick }: { signal: StockSignal; onClick: () => void }) {
  const [history, setHistory] = useState<HistoryPoint[] | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const fetchedRef = useRef(false);
  const pctBelowEMA = ((signal.price - signal.ema_200) / signal.ema_200 * 100).toFixed(1);

  const handleMouseEnter = useCallback(() => {
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

  const chartColor = signal.rsi_14 < 30 ? "#ff4757" : "#ffa502";

  return (
    <div
      className="group relative bg-pulse-card border border-pulse-border rounded-xl cursor-pointer transition-all duration-300 overflow-hidden hover:border-pulse-yellow/40 hover:shadow-[0_0_20px_rgba(255,165,2,0.06)]"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* ---- DEFAULT STATE ---- */}
      <div className="p-5 transition-all duration-300 group-hover:opacity-0 group-hover:pointer-events-none">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-white">${signal.ticker}</span>
              <Badge status={signal.rsi_14 < 30 ? "warning" : "watch"}>
                RSI {signal.rsi_14.toFixed(0)}
              </Badge>
            </div>
            <p className="text-xs text-pulse-muted mt-0.5">{signal.company_name}</p>
          </div>
          <TrendingDown className="h-4 w-4 text-pulse-red" />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-pulse-muted">Price</span>
            <div className="font-mono font-bold text-white">${formatNumber(signal.price)}</div>
          </div>
          <div>
            <span className="text-xs text-pulse-muted">200 EMA</span>
            <div className="font-mono text-pulse-muted">${formatNumber(signal.ema_200)}</div>
          </div>
          <div>
            <span className="text-xs text-pulse-muted">Fwd P/E</span>
            <div className="font-mono text-white">{formatNumber(signal.forward_pe, 1)}</div>
          </div>
          <div>
            <span className="text-xs text-pulse-muted">% Below EMA</span>
            <div className="font-mono text-pulse-red">{pctBelowEMA}%</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-pulse-border">
          <span className="text-xs text-pulse-muted">{signal.sector} · {signal.notes}</span>
        </div>
      </div>

      {/* ---- HOVER STATE: metrics top + mini chart ---- */}
      <div className="absolute inset-0 flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 bg-pulse-card">
        {/* Compressed metrics row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold font-mono text-white">${signal.ticker}</span>
            <span className="text-sm font-bold font-mono text-white">${formatNumber(signal.price)}</span>
            <span className="text-[10px] font-mono text-pulse-red">{pctBelowEMA}%</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] font-mono text-pulse-muted">P/E {formatNumber(signal.forward_pe, 1)}</span>
            <Badge status={signal.rsi_14 < 30 ? "warning" : "watch"} className="text-[10px] px-1.5 py-0.5">
              RSI {signal.rsi_14.toFixed(0)}
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
                  <linearGradient id={`minigrad-${signal.ticker}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
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
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                  cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: "3 3" }}
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
                  stroke={chartColor}
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

        {/* Bottom row: sector + CTA */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-pulse-border/50">
          <span className="text-[10px] text-pulse-muted truncate">{signal.sector}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Sparkles className="h-3 w-3 text-pulse-green" />
            <span className="text-[10px] font-medium text-pulse-green">Full analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
