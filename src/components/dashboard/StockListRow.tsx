"use client";

import { Badge } from "@/components/ui/Badge";
import { TrendingDown, ChevronRight } from "lucide-react";
import type { StockSignal } from "@/types";
import { formatNumber } from "@/lib/utils";

interface StockListRowProps {
  signal: StockSignal;
  onClick: () => void;
}

export function StockListRow({ signal, onClick }: StockListRowProps) {
  const pctBelowEMA = ((signal.price - signal.ema_200) / signal.ema_200 * 100).toFixed(1);
  const rsiStatus = signal.rsi_14 < 30 ? "warning" : "watch";

  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-4 py-3 bg-pulse-card border border-pulse-border rounded-lg hover:border-pulse-yellow/30 hover:bg-pulse-card/80 transition-all duration-200 text-left"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${signal.rsi_14 < 30 ? "bg-pulse-red" : "bg-pulse-yellow"}`} />

      <div className="min-w-0 flex-1">
        <span className="text-sm font-bold font-mono text-white truncate block">${signal.ticker}</span>
        <span className="text-xs text-pulse-muted truncate block md:hidden">{signal.company_name}</span>
      </div>

      <span className="hidden md:block text-xs text-pulse-muted truncate max-w-[160px] lg:max-w-[200px]">
        {signal.company_name}
      </span>

      <span className="hidden lg:block text-xs text-pulse-muted">{signal.sector}</span>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-sm font-bold font-mono text-white">${formatNumber(signal.price)}</span>
        <TrendingDown className="h-3.5 w-3.5 text-pulse-red" />
      </div>

      <span className="hidden sm:block text-xs font-mono text-pulse-red flex-shrink-0">{pctBelowEMA}%</span>

      <Badge status={rsiStatus} className="text-[10px] px-2 py-0.5 hidden sm:inline-flex flex-shrink-0">
        RSI {signal.rsi_14.toFixed(0)}
      </Badge>

      <Badge
        status={signal.signal_type === "value_dividend" ? "watch" : "warning"}
        className="text-[10px] px-2 py-0.5 hidden md:inline-flex flex-shrink-0"
      >
        {signal.signal_type === "value_dividend" ? "Value" : "Oversold"}
      </Badge>

      <ChevronRight className="h-4 w-4 text-pulse-muted md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}
