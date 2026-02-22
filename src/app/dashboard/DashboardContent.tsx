"use client";

import { IndicatorGrid } from "@/components/dashboard/IndicatorGrid";
import { StockScreener } from "@/components/dashboard/StockScreener";
import { MessageHistory } from "@/components/dashboard/MessageHistory";
import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";
import type { RecessionIndicator, StockSignal, Subscription, UserProfile, MessageQueueItem } from "@/types";

interface DashboardContentProps {
  profile: UserProfile;
  indicators: RecessionIndicator[];
  subscription: Subscription | null;
  stockSignals: StockSignal[];
  messages: MessageQueueItem[];
}

export function DashboardContent({
  profile,
  indicators,
  subscription,
  stockSignals,
  messages,
}: DashboardContentProps) {
  const isPro = profile?.subscription_tier === "pulse_pro";

  // If no live data yet, show sample data
  const displayIndicators = indicators.length > 0 ? indicators : SAMPLE_INDICATORS;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good {getTimeOfDay()}, {profile?.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-pulse-muted mt-1">
          Here&apos;s your recession pulse for {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Subscription */}
      <SubscriptionStatus profile={profile} subscription={subscription} />

      {/* Indicators */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Recession Indicators</h2>
        <IndicatorGrid indicators={displayIndicators} />
      </section>

      {/* Stock Screener */}
      <section id="stocks">
        <h2 className="text-lg font-bold text-white mb-4">Stock Screener</h2>
        <StockScreener signals={stockSignals} isPro={isPro} />
      </section>

      {/* Message History */}
      <section id="messages">
        <h2 className="text-lg font-bold text-white mb-4">Recent Alerts</h2>
        <MessageHistory messages={messages} />
      </section>
    </div>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

const SAMPLE_INDICATORS: RecessionIndicator[] = [
  {
    id: "1", slug: "sahm-rule", name: "Sahm Rule",
    latest_value: "0.30", trigger_level: ">=0.50 triggers",
    status: "safe", status_text: "NOT triggered",
    signal: "Declining from 0.57 peak (Aug 2024)", signal_emoji: "🟢",
    category: "primary", updated_at: new Date().toISOString(),
  },
  {
    id: "2", slug: "yield-curve-2s10s", name: "Yield Curve (2s10s)",
    latest_value: "+70 bps", trigger_level: "Inversion (<0)",
    status: "watch", status_text: "Un-inverted",
    signal: "Steepest since 2021 — 6-18mo lag typical", signal_emoji: "🟡",
    category: "primary", updated_at: new Date().toISOString(),
  },
  {
    id: "3", slug: "yield-curve-2s30s", name: "Yield Curve (2s30s)",
    latest_value: "+139 bps", trigger_level: "Inversion (<0)",
    status: "watch", status_text: "Steepening",
    signal: "Steepest since Nov 2021", signal_emoji: "🟡",
    category: "primary", updated_at: new Date().toISOString(),
  },
  {
    id: "4", slug: "conference-board-lei", name: "Conference Board LEI",
    latest_value: "-0.3% (Dec 2025)", trigger_level: "3Ds Rule: diffusion <50 & growth <-4.3%",
    status: "danger", status_text: "TRIGGERED",
    signal: "Recession signal active since Aug 2025", signal_emoji: "⚠️",
    category: "primary", updated_at: new Date().toISOString(),
  },
  {
    id: "5", slug: "on-rrp-facility", name: "ON RRP Facility",
    latest_value: "~$80B", trigger_level: "Near zero = no buffer",
    status: "warning", status_text: "97% depleted",
    signal: "Systemic safety valve gone — from $2.5T peak", signal_emoji: "⚠️",
    category: "liquidity", updated_at: new Date().toISOString(),
  },
  {
    id: "6", slug: "dxy-dollar-index", name: "DXY (Dollar Index)",
    latest_value: "~96-97", trigger_level: "Rapid decline = capital flight",
    status: "warning", status_text: "5-year lows",
    signal: "14-year record bear positioning", signal_emoji: "⚠️",
    category: "market", updated_at: new Date().toISOString(),
  },
  {
    id: "7", slug: "emerging-markets", name: "Emerging Markets",
    latest_value: "+33.6% (2025)", trigger_level: "EM outperformance = late-cycle rotation",
    status: "safe", status_text: "Bullish EM",
    signal: "Best year vs DM since 2017 — IEMG +44% YoY", signal_emoji: "🟢",
    category: "market", updated_at: new Date().toISOString(),
  },
  {
    id: "8", slug: "jpm-recession-prob", name: "JPM Recession Probability",
    latest_value: "35%", trigger_level: ">50% = high probability",
    status: "watch", status_text: "Moderate",
    signal: "Risen from ~25% mid-2025", signal_emoji: "🟡",
    category: "primary", updated_at: new Date().toISOString(),
  },
  {
    id: "9", slug: "gdp-growth-forecast", name: "GDP Growth Forecast",
    latest_value: "2.1%", trigger_level: "<0% = recession",
    status: "watch", status_text: "Slowing",
    signal: "Down from 2.8% in 2024", signal_emoji: "🟡",
    category: "primary", updated_at: new Date().toISOString(),
  },
  {
    id: "10", slug: "credit-spreads-hy", name: "Credit Spreads (HY OAS)",
    latest_value: "~320 bps", trigger_level: ">500 bps = stress",
    status: "watch", status_text: "Elevated",
    signal: "Widening — monitor for rapid expansion", signal_emoji: "🟡",
    category: "liquidity", updated_at: new Date().toISOString(),
  },
  {
    id: "11", slug: "ism-manufacturing-pmi", name: "ISM Manufacturing PMI",
    latest_value: "49.3", trigger_level: "<50 = contraction",
    status: "warning", status_text: "Contraction",
    signal: "Below 50 — manufacturing contracting", signal_emoji: "⚠️",
    category: "primary", updated_at: new Date().toISOString(),
  },
  {
    id: "12", slug: "bank-unrealized-losses", name: "Bank Unrealized Losses",
    latest_value: "~$500B HTM", trigger_level: "Forced selling risk",
    status: "warning", status_text: "Exposed",
    signal: "With ON RRP depleted, banks vulnerable to liquidity shock", signal_emoji: "⚠️",
    category: "liquidity", updated_at: new Date().toISOString(),
  },
  {
    id: "13", slug: "us-interest-expense", name: "US Interest Expense",
    latest_value: "~$950B/yr", trigger_level: "Fiscal doom loop",
    status: "warning", status_text: "Approaching $1T",
    signal: "Fastest-growing budget item — higher rates = more debt", signal_emoji: "⚠️",
    category: "market", updated_at: new Date().toISOString(),
  },
  {
    id: "14", slug: "m2-money-supply", name: "M2 Money Supply",
    latest_value: "Stagnant", trigger_level: "Declining = deflationary",
    status: "watch", status_text: "Stagnant",
    signal: "Liquidity absorbed by Treasury issuance", signal_emoji: "🟡",
    category: "liquidity", updated_at: new Date().toISOString(),
  },
];
