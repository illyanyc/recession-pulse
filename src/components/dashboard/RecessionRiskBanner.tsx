"use client";

import { useState, useEffect, useRef } from "react";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { RecessionRiskAssessment } from "@/types";

interface RecessionRiskBannerProps {
  assessment: RecessionRiskAssessment | null;
  hasSubscription?: boolean;
}

const RISK_CONFIG = {
  low:      { color: "#00CC66", bg: "from-pulse-safe/5 to-transparent",   border: "border-pulse-safe/20",   label: "LOW" },
  moderate: { color: "#F2C94C", bg: "from-pulse-yellow/5 to-transparent", border: "border-pulse-yellow/20", label: "MODERATE" },
  elevated: { color: "#F0913A", bg: "from-pulse-green/5 to-transparent",  border: "border-pulse-green/20",  label: "ELEVATED" },
  high:     { color: "#EB5757", bg: "from-pulse-red/5 to-transparent",    border: "border-pulse-red/20",    label: "HIGH" },
  critical: { color: "#FF0000", bg: "from-red-600/5 to-transparent",      border: "border-red-600/20",      label: "CRITICAL" },
} as const;

function RiskGauge({ score, color }: { score: number; color: string }) {
  const radius = 58;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const size = (radius + stroke) * 2;

  return (
    <div className="relative flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-pulse-border"
        />
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="square"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono text-white">{score}</span>
        <span className="text-[10px] text-pulse-muted uppercase tracking-wider">/ 100</span>
      </div>
    </div>
  );
}

export function RecessionRiskBanner({ assessment: initialAssessment, hasSubscription = true }: RecessionRiskBannerProps) {
  const [assessment] = useState(initialAssessment);

  if (!assessment) return null;

  const config = RISK_CONFIG[assessment.risk_level];

  if (!hasSubscription) {
    return (
      <div className="relative p-6 bg-pulse-card border border-pulse-border transition-all overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6 opacity-30 blur-[2px] pointer-events-none select-none" aria-hidden="true">
          <div className="flex flex-col items-center gap-2">
            <RiskGauge score={assessment.score} color={config.color} />
            <span className="text-xs font-bold tracking-widest" style={{ color: config.color }}>
              {config.label} RISK
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white mb-3">Overall Recession Risk</h2>
            <p className="text-sm text-pulse-text leading-relaxed">{assessment.summary?.slice(0, 120)}...</p>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-pulse-darker/60">
          <Lock className="h-8 w-8 text-pulse-muted mb-3" />
          <h3 className="text-base font-bold text-white mb-1">AI Recession Risk Assessment</h3>
          <p className="text-xs text-pulse-muted mb-4 max-w-sm text-center">
            Get daily AI-powered macro analysis with risk scoring across all 42 indicators.
          </p>
          <Link href="/pricing">
            <Button size="sm">Upgrade to Pulse — $6.99/mo</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-gradient-to-r ${config.bg} bg-pulse-card border ${config.border} transition-all`}>
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col items-center gap-2">
          <RiskGauge score={assessment.score} color={config.color} />
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: config.color }}
          >
            {config.label} RISK
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-bold text-white">Overall Recession Risk</h2>
            <span className="text-xs text-pulse-muted">
              {new Date(assessment.assessment_date + "T00:00:00").toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <p className="text-sm text-pulse-text leading-relaxed mb-4">
            {assessment.summary}
          </p>

          {assessment.key_factors.length > 0 && (
            <ul className="space-y-1.5 mb-4">
              {assessment.key_factors.map((factor, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-pulse-text">
                  <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0" style={{ backgroundColor: config.color }} />
                  {factor}
                </li>
              ))}
            </ul>
          )}

          {assessment.outlook && (
            <p className="text-xs text-pulse-muted italic">
              Outlook: {assessment.outlook}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-pulse-border/50 flex items-center gap-2">
            <span className="text-[10px] text-pulse-muted">
              AI-powered macro analysis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
