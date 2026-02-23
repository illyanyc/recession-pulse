"use client";

import { useState, useEffect, useRef } from "react";
import type { RecessionRiskAssessment } from "@/types";

interface RecessionRiskBannerProps {
  assessment: RecessionRiskAssessment | null;
}

const RISK_CONFIG = {
  low:      { color: "#00CC66", bg: "from-pulse-safe/5 to-transparent",   border: "border-pulse-safe/20",   label: "LOW" },
  moderate: { color: "#FFCC00", bg: "from-pulse-yellow/5 to-transparent", border: "border-pulse-yellow/20", label: "MODERATE" },
  elevated: { color: "#FF6600", bg: "from-pulse-green/5 to-transparent",  border: "border-pulse-green/20",  label: "ELEVATED" },
  high:     { color: "#FF3333", bg: "from-pulse-red/5 to-transparent",    border: "border-pulse-red/20",    label: "HIGH" },
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

export function RecessionRiskBanner({ assessment: initialAssessment }: RecessionRiskBannerProps) {
  const [assessment, setAssessment] = useState(initialAssessment);
  const retried = useRef(false);

  useEffect(() => {
    if (assessment || retried.current) return;
    retried.current = true;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/dashboard/risk-assessment");
        if (res.ok) {
          const data = await res.json();
          if (data?.score != null) setAssessment(data);
        }
      } catch { /* silent */ }
    }, 5000);

    return () => clearTimeout(timer);
  }, [assessment]);

  if (!assessment) {
    return (
      <div className="p-6 bg-pulse-card border border-pulse-border">
        <div className="flex items-center gap-4">
          <div className="w-[132px] h-[132px] bg-pulse-dark animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 bg-pulse-dark animate-pulse" />
            <div className="h-4 w-full bg-pulse-dark animate-pulse" />
            <div className="h-4 w-3/4 bg-pulse-dark animate-pulse" />
            <p className="text-xs text-pulse-muted mt-2">Generating risk assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  const config = RISK_CONFIG[assessment.risk_level];

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
              Powered by {assessment.model.toUpperCase()} analysis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
