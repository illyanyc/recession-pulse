"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { RecessionIndicator, IndicatorStatus } from "@/types";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface IndicatorCardProps {
  indicator: RecessionIndicator;
}

function TrendIcon({ status }: { status: IndicatorStatus }) {
  if (status === "safe") return <TrendingUp className="h-4 w-4 text-pulse-green" />;
  if (status === "danger" || status === "warning") return <TrendingDown className="h-4 w-4 text-pulse-red" />;
  return <Minus className="h-4 w-4 text-pulse-yellow" />;
}

export function IndicatorCard({ indicator }: IndicatorCardProps) {
  return (
    <Card
      hover
      glow={indicator.status === "danger" ? "red" : indicator.status === "safe" ? "green" : "none"}
    >
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
    </Card>
  );
}
