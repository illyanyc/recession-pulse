"use client";

import { Badge } from "@/components/ui/Badge";
import { TrendingDown, TrendingUp, Minus, ChevronRight } from "lucide-react";
import type { RecessionIndicator, IndicatorStatus } from "@/types";

interface IndicatorListRowProps {
  indicator: RecessionIndicator;
  onClick: () => void;
}

const STATUS_DOT: Record<IndicatorStatus, string> = {
  safe: "bg-pulse-safe",
  watch: "bg-pulse-yellow",
  warning: "bg-pulse-red",
  danger: "bg-red-500",
};

function TrendIcon({ status }: { status: IndicatorStatus }) {
  if (status === "safe") return <TrendingUp className="h-3.5 w-3.5 text-pulse-safe" />;
  if (status === "danger" || status === "warning") return <TrendingDown className="h-3.5 w-3.5 text-pulse-red" />;
  return <Minus className="h-3.5 w-3.5 text-pulse-yellow" />;
}

export function IndicatorListRow({ indicator, onClick }: IndicatorListRowProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-3 px-4 py-3 bg-pulse-card border border-pulse-border rounded-lg hover:border-pulse-green/30 hover:bg-pulse-card/80 transition-all duration-200 text-left"
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[indicator.status]}`} />

      {/* Name */}
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-white truncate block">{indicator.name}</span>
        <span className="text-xs text-pulse-muted truncate block md:hidden">{indicator.signal}</span>
      </div>

      {/* Signal - hidden on mobile */}
      <span className="hidden md:block text-xs text-pulse-muted truncate max-w-[200px] lg:max-w-[280px]">
        {indicator.signal}
      </span>

      {/* Value + trend */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-sm font-bold font-mono text-white">{indicator.latest_value}</span>
        <TrendIcon status={indicator.status} />
      </div>

      {/* Badge */}
      <Badge status={indicator.status} className="text-[10px] px-2 py-0.5 hidden sm:inline-flex flex-shrink-0">
        {indicator.status_text}
      </Badge>

      {/* See more - visible on hover desktop, always on mobile */}
      <ChevronRight className="h-4 w-4 text-pulse-muted md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}
