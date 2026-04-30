"use client";

import { useState } from "react";
import { Lock, ChevronDown, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
} from "recharts";
import { Button } from "@/components/ui/Button";
import type { RecessionRiskAssessment } from "@/types";
import { INDICATOR_COUNT } from "@/lib/indicators-metadata";

export interface RiskHistoryPoint {
  date: string;
  score: number;
  risk_level: RecessionRiskAssessment["risk_level"];
}

interface RecessionRiskBannerProps {
  assessment: RecessionRiskAssessment | null;
  history?: RiskHistoryPoint[];
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

function ScoreHistoryChart({ history, color }: { history: RiskHistoryPoint[]; color: string }) {
  if (history.length < 2) return null;

  const data = history.map((h) => ({
    date: h.date,
    score: h.score,
    label: new Date(h.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="h-48 sm:h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: 0 }}>
          <ReferenceArea y1={0} y2={20} fill="#00CC66" fillOpacity={0.05} />
          <ReferenceArea y1={20} y2={40} fill="#F2C94C" fillOpacity={0.05} />
          <ReferenceArea y1={40} y2={60} fill="#F0913A" fillOpacity={0.06} />
          <ReferenceArea y1={60} y2={80} fill="#EB5757" fillOpacity={0.06} />
          <ReferenceArea y1={80} y2={100} fill="#FF0000" fillOpacity={0.07} />
          <XAxis
            dataKey="label"
            stroke="#4b5563"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#4b5563"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={28}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0D0D0D",
              border: "1px solid #2A2A2A",
              borderRadius: 6,
              fontSize: 11,
              padding: "6px 8px",
            }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color: "#D4D4D4" }}
            formatter={(v) => [`${v}/100`, "Score"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: "#0D0D0D", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-pulse-muted">
        <Minus className="h-3 w-3" /> flat 30d
      </span>
    );
  }
  const up = delta > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const tone = up ? "text-pulse-red" : "text-pulse-safe";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${tone}`}>
      <Icon className="h-3 w-3" />
      {up ? "+" : ""}
      {delta} pts · 30d
    </span>
  );
}

export function RecessionRiskBanner({
  assessment: initialAssessment,
  history = [],
  hasSubscription = true,
}: RecessionRiskBannerProps) {
  const [assessment] = useState(initialAssessment);
  const [expanded, setExpanded] = useState(false);

  if (!assessment) return null;

  const config = RISK_CONFIG[assessment.risk_level];
  const delta30d =
    history.length > 1 ? assessment.score - history[0].score : 0;

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
            Get daily AI-powered macro analysis with risk scoring across all {INDICATOR_COUNT} indicators.
          </p>
          <Link href="/pricing">
            <Button size="sm">Upgrade to Pulse — $6.99/mo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasHistory = history.length > 1;

  return (
    <div className={`bg-gradient-to-r ${config.bg} bg-pulse-card border ${config.border} transition-all`}>
      <div className="p-6 flex flex-col gap-6">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-col sm:flex-row gap-6 text-left cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <RiskGauge score={assessment.score} color={config.color} />
            <span
              className="text-xs font-bold tracking-widest"
              style={{ color: config.color }}
            >
              {config.label} RISK
            </span>
          </div>

          <div className="flex-1 min-w-0 max-w-3xl">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-lg font-bold text-white">Overall Recession Risk</h2>
              <span className="text-xs text-pulse-muted">
                {new Date(assessment.assessment_date + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {hasHistory && <DeltaBadge delta={delta30d} />}
              <ChevronDown
                className={`h-4 w-4 text-pulse-muted ml-auto flex-shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
            </div>

            {!expanded && (
              <p className="text-sm text-pulse-text leading-relaxed line-clamp-3">
                {assessment.summary}
              </p>
            )}

            {expanded && (
              <div className="animate-in fade-in duration-200">
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
            )}
          </div>
        </button>

        {hasHistory && (
          <div
            className="w-full pt-4 border-t border-pulse-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-pulse-muted uppercase tracking-wider">
                Score history — last {history.length} days
              </span>
              <span className="text-[11px] text-pulse-muted">
                min {Math.min(...history.map((h) => h.score))} · max{" "}
                {Math.max(...history.map((h) => h.score))}
              </span>
            </div>
            <ScoreHistoryChart history={history} color={config.color} />
          </div>
        )}
      </div>
    </div>
  );
}
