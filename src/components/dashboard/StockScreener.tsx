"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { StockSignal } from "@/types";
import { formatLargeNumber, formatNumber } from "@/lib/utils";
import { Lock, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface StockScreenerProps {
  signals: StockSignal[];
  isPro: boolean;
}

export function StockScreener({ signals, isPro }: StockScreenerProps) {
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
              <StockCard key={signal.ticker} signal={signal} />
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
              <StockCard key={signal.ticker} signal={signal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StockCard({ signal }: { signal: StockSignal }) {
  const pctBelowEMA = ((signal.price - signal.ema_200) / signal.ema_200 * 100).toFixed(1);

  return (
    <Card hover className="flex flex-col">
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
        {signal.dividend_yield && signal.dividend_yield > 0 && (
          <div>
            <span className="text-xs text-pulse-muted">Div Yield</span>
            <div className="font-mono text-pulse-green">{formatNumber(signal.dividend_yield, 1)}%</div>
          </div>
        )}
        <div>
          <span className="text-xs text-pulse-muted">Mkt Cap</span>
          <div className="font-mono text-pulse-muted">{formatLargeNumber(signal.market_cap)}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-pulse-border">
        <span className="text-xs text-pulse-muted">{signal.sector} · {signal.notes}</span>
      </div>
    </Card>
  );
}
