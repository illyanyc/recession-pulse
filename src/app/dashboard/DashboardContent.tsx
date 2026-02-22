"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Send, Loader2, CheckCircle, XCircle, AlertTriangle, Phone, Mail, ArrowRight } from "lucide-react";
import { IndicatorGrid } from "@/components/dashboard/IndicatorGrid";
import { StockScreener } from "@/components/dashboard/StockScreener";
import { MessageHistory } from "@/components/dashboard/MessageHistory";
import { SubscriptionStatus } from "@/components/dashboard/SubscriptionStatus";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { RecessionIndicator, StockSignal, Subscription, UserProfile, MessageQueueItem } from "@/types";

type ActionStatus = "idle" | "loading" | "success" | "error";

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
  const router = useRouter();
  const isPro = profile?.subscription_tier === "pulse_pro";
  const hasSubscription = profile?.subscription_tier !== "free";

  const missingPhone = !profile?.phone;
  const missingEmail = !profile?.email;
  const profileIncomplete = missingPhone || missingEmail;

  const [refreshStatus, setRefreshStatus] = useState<ActionStatus>("idle");
  const [sendStatus, setSendStatus] = useState<ActionStatus>("idle");
  const [refreshResult, setRefreshResult] = useState<string>("");
  const [sendResult, setSendResult] = useState<string>("");
  const [dismissedBanner, setDismissedBanner] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshStatus("loading");
    setRefreshResult("");
    try {
      const res = await fetch("/api/dashboard/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Refresh failed");
      setRefreshStatus("success");
      setRefreshResult(data.message || "Data refreshed");
      router.refresh();
    } catch (err) {
      setRefreshStatus("error");
      setRefreshResult(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setTimeout(() => setRefreshStatus("idle"), 4000);
    }
  }, [router]);

  const handleSendNow = useCallback(async () => {
    if (missingPhone && missingEmail) {
      setSendStatus("error");
      setSendResult("Add a phone number or email in Settings first");
      setTimeout(() => setSendStatus("idle"), 4000);
      return;
    }
    if (missingPhone) {
      setSendStatus("error");
      setSendResult("Add a phone number in Settings to receive SMS alerts");
      setTimeout(() => setSendStatus("idle"), 4000);
      return;
    }
    setSendStatus("loading");
    setSendResult("");
    try {
      const res = await fetch("/api/dashboard/send-now", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setSendStatus("success");
      if (data.channels) {
        const lines = (data.channels as { name: string; status: string; error?: string }[]).map((ch) => {
          if (ch.status === "sent") return `✓ ${ch.name}`;
          if (ch.status === "skipped") return `– ${ch.name}: ${ch.error}`;
          return `✗ ${ch.name}: ${ch.error}`;
        });
        const hasFail = data.channels.some((ch: { status: string }) => ch.status === "failed");
        if (hasFail) setSendStatus("error");
        setSendResult(lines.join("  |  "));
      } else {
        setSendResult("Alerts sent");
      }
      router.refresh();
    } catch (err) {
      setSendStatus("error");
      setSendResult(err instanceof Error ? err.message : "Send failed");
    } finally {
      setTimeout(() => setSendStatus("idle"), 4000);
    }
  }, [router, missingPhone, missingEmail]);

  const displayIndicators = indicators.length > 0 ? indicators : SAMPLE_INDICATORS;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {getTimeOfDay()}, {profile?.full_name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-sm text-pulse-muted mt-1">
            Here&apos;s your recession pulse for {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ActionButton
            onClick={handleRefresh}
            status={refreshStatus}
            result={refreshResult}
            idleIcon={<RefreshCw className="h-4 w-4" />}
            idleLabel="Refresh Data"
          />
          {hasSubscription && (
            <ActionButton
              onClick={handleSendNow}
              status={sendStatus}
              result={sendResult}
              idleIcon={<Send className="h-4 w-4" />}
              idleLabel="Send Now"
            />
          )}
        </div>
      </div>

      {/* Profile completeness banner */}
      {profileIncomplete && !dismissedBanner && (
        <div className="p-4 rounded-xl border border-pulse-yellow/30 bg-pulse-yellow/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-pulse-yellow shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-1">Complete your profile to receive alerts</p>
              <div className="flex flex-wrap gap-3 mb-3">
                {missingPhone && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-pulse-yellow">
                    <Phone className="h-3.5 w-3.5" /> Phone number missing
                  </span>
                )}
                {missingEmail && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-pulse-yellow">
                    <Mail className="h-3.5 w-3.5" /> Email missing
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link href="/settings">
                  <Button size="sm" className="gap-1.5">
                    Go to Settings
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <button
                  onClick={() => setDismissedBanner(true)}
                  className="text-xs text-pulse-muted hover:text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

function ActionButton({
  onClick,
  status,
  result,
  idleIcon,
  idleLabel,
}: {
  onClick: () => void;
  status: ActionStatus;
  result: string;
  idleIcon: React.ReactNode;
  idleLabel: string;
}) {
  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        disabled={status === "loading"}
        className="gap-2"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "success" ? (
          <CheckCircle className="h-4 w-4 text-pulse-green" />
        ) : status === "error" ? (
          <XCircle className="h-4 w-4 text-pulse-red" />
        ) : (
          idleIcon
        )}
        {status === "loading" ? "Working..." : status === "success" ? "Done" : status === "error" ? "Failed" : idleLabel}
      </Button>
      {result && status !== "idle" && (
        <div className={`absolute top-full mt-2 right-0 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap z-10 ${
          status === "success" ? "bg-pulse-green/10 text-pulse-green border border-pulse-green/20" :
          status === "error" ? "bg-pulse-red/10 text-pulse-red border border-pulse-red/20" :
          "bg-pulse-card text-pulse-muted border border-pulse-border"
        }`}>
          {result}
        </div>
      )}
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
