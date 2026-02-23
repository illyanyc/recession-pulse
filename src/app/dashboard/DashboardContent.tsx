"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Send, Loader2, CheckCircle, XCircle, AlertTriangle, Phone, Mail, ArrowRight } from "lucide-react";
import { IndicatorGrid } from "@/components/dashboard/IndicatorGrid";
import { StockScreener } from "@/components/dashboard/StockScreener";
import { MessageHistory } from "@/components/dashboard/MessageHistory";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { RecessionRiskBanner } from "@/components/dashboard/RecessionRiskBanner";
import type { RecessionIndicator, RecessionRiskAssessment, StockSignal, Subscription, UserProfile, MessageQueueItem } from "@/types";

type ActionStatus = "idle" | "loading" | "success" | "error";

interface DashboardContentProps {
  profile: UserProfile;
  indicators: RecessionIndicator[];
  subscription: Subscription | null;
  stockSignals: StockSignal[];
  messages: MessageQueueItem[];
  riskAssessment: RecessionRiskAssessment | null;
}

export function DashboardContent({
  profile,
  indicators,
  subscription,
  stockSignals,
  messages,
  riskAssessment,
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
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/7e11db6f-d41c-493a-83e3-c08fecaa79d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardContent.tsx:56',message:'Refresh success - calling router.refresh()',data:{responseData:data},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      router.refresh();
    } catch (err) {
      setRefreshStatus("error");
      setRefreshResult(err instanceof Error ? err.message : "Refresh failed");
    } finally {
      setTimeout(() => setRefreshStatus("idle"), 4000);
    }
  }, [router]);

  const handleSendNow = useCallback(async () => {
    if (missingEmail) {
      setSendStatus("error");
      setSendResult("Add an email in Settings first");
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
          if (ch.status === "sent") return `[OK] ${ch.name}`;
          if (ch.status === "skipped") return `[SKIP] ${ch.name}: ${ch.error}`;
          return `[FAIL] ${ch.name}: ${ch.error}`;
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

      {/* Overall Recession Risk */}
      <section>
        <RecessionRiskBanner assessment={riskAssessment} />
      </section>

      {/* Indicators */}
      <section>
        <h2 className="text-lg font-bold text-white mb-4">Recession Indicators</h2>
        <IndicatorGrid
          indicators={displayIndicators}
          initialViewMode={profile?.dashboard_view_mode || "grid"}
          initialCardDisplayMode={profile?.card_display_mode || "card"}
        />
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
  // Primary
  { id: "1", slug: "sahm-rule", name: "Sahm Rule", latest_value: "0.30", trigger_level: ">=0.50 triggers", status: "safe", status_text: "NOT triggered", signal: "Declining from 0.57 peak (Aug 2024)", signal_emoji: "SAFE", category: "primary", updated_at: new Date().toISOString() },
  { id: "2", slug: "yield-curve-2s10s", name: "Yield Curve (2s10s)", latest_value: "+70 bps", trigger_level: "Inversion (<0)", status: "watch", status_text: "Un-inverted", signal: "Steepest since 2021 — 6-18mo lag typical", signal_emoji: "WATCH", category: "primary", updated_at: new Date().toISOString() },
  { id: "3", slug: "yield-curve-2s30s", name: "Yield Curve (2s30s)", latest_value: "+139 bps", trigger_level: "Inversion (<0)", status: "watch", status_text: "Steepening", signal: "Steepest since Nov 2021", signal_emoji: "WATCH", category: "primary", updated_at: new Date().toISOString() },
  { id: "4", slug: "conference-board-lei", name: "Conference Board LEI", latest_value: "-0.3%", trigger_level: "3Ds Rule", status: "danger", status_text: "TRIGGERED", signal: "Recession signal active since Aug 2025", signal_emoji: "WARNING", category: "primary", updated_at: new Date().toISOString() },
  { id: "5", slug: "ism-manufacturing", name: "ISM Manufacturing PMI", latest_value: "49.3", trigger_level: "<50 = contraction", status: "warning", status_text: "Contraction", signal: "Below 50 — manufacturing contracting", signal_emoji: "WARNING", category: "primary", updated_at: new Date().toISOString() },
  { id: "6", slug: "unemployment-rate", name: "Unemployment Rate", latest_value: "4.1%", trigger_level: "Rising >0.5% from cycle low", status: "watch", status_text: "Ticking up", signal: "Approaching Sahm Rule trigger", signal_emoji: "WATCH", category: "primary", updated_at: new Date().toISOString() },
  { id: "7", slug: "real-personal-income", name: "Real Personal Income (ex Transfers)", latest_value: "$15.8T", trigger_level: "Declining = organic income contraction", status: "watch", status_text: "Monitor trend", signal: "Organic income stagnating", signal_emoji: "WATCH", category: "primary", updated_at: new Date().toISOString() },
  { id: "8", slug: "industrial-production", name: "Industrial Production Index", latest_value: "102.1", trigger_level: "Declining = weakness", status: "watch", status_text: "Stagnant", signal: "Flat output — no growth", signal_emoji: "WATCH", category: "primary", updated_at: new Date().toISOString() },
  { id: "9", slug: "jolts-quits-rate", name: "JOLTS Quits Rate", latest_value: "2.0%", trigger_level: "<2.0% = workers afraid", status: "warning", status_text: "Below pre-pandemic", signal: "Workers frozen — at pre-pandemic floor", signal_emoji: "WARNING", category: "primary", updated_at: new Date().toISOString() },
  { id: "10", slug: "temp-help-services", name: "Temporary Help Services", latest_value: "2,750K", trigger_level: "Declining = earliest labor signal", status: "warning", status_text: "Declining", signal: "Temp jobs falling — employers cutting flex labor", signal_emoji: "WARNING", category: "primary", updated_at: new Date().toISOString() },
  { id: "11", slug: "ny-fed-recession-prob", name: "NY Fed Recession Probability", latest_value: "18.8%", trigger_level: ">50% preceded every recession", status: "watch", status_text: "Moderate", signal: "Below trigger but rising", signal_emoji: "WATCH", category: "primary", updated_at: new Date().toISOString() },
  { id: "12", slug: "sos-recession", name: "SOS Recession Indicator", latest_value: "0.12", trigger_level: "Triggered = recession signal", status: "watch", status_text: "Elevated", signal: "Near trigger — watch weekly claims", signal_emoji: "WATCH", category: "primary", updated_at: new Date().toISOString() },
  // Secondary
  { id: "13", slug: "initial-claims", name: "Initial Jobless Claims", latest_value: "230K", trigger_level: ">300K sustained", status: "safe", status_text: "Healthy", signal: "Claims stable", signal_emoji: "SAFE", category: "secondary", updated_at: new Date().toISOString() },
  { id: "14", slug: "consumer-sentiment", name: "Consumer Sentiment (UMich)", latest_value: "64.7", trigger_level: "<60 = recessionary", status: "warning", status_text: "Weak", signal: "Below average — consumers pessimistic", signal_emoji: "WARNING", category: "secondary", updated_at: new Date().toISOString() },
  { id: "15", slug: "fed-funds-rate", name: "Fed Funds Rate", latest_value: "4.50%", trigger_level: "Cuts after hikes = late cycle", status: "watch", status_text: "Elevated", signal: "Restrictive — monitoring", signal_emoji: "WATCH", category: "secondary", updated_at: new Date().toISOString() },
  { id: "16", slug: "gdp-growth", name: "GDP Growth Forecast", latest_value: "2.1%", trigger_level: "<0% = recession", status: "watch", status_text: "Slowing", signal: "Down from 2.8% in 2024", signal_emoji: "WATCH", category: "secondary", updated_at: new Date().toISOString() },
  { id: "17", slug: "jpm-recession-probability", name: "JPM Recession Probability", latest_value: "35%", trigger_level: ">50% = high probability", status: "watch", status_text: "Moderate", signal: "Risen from ~25% mid-2025", signal_emoji: "WATCH", category: "secondary", updated_at: new Date().toISOString() },
  // Housing
  { id: "18", slug: "building-permits", name: "Building Permits", latest_value: "1,483K", trigger_level: "Declining = housing-led slowdown", status: "warning", status_text: "Below trend", signal: "At lowest since pandemic shutdowns", signal_emoji: "WARNING", category: "housing", updated_at: new Date().toISOString() },
  { id: "19", slug: "housing-starts", name: "Housing Starts", latest_value: "1,366K", trigger_level: "Declining leads cycle 3-5 quarters", status: "watch", status_text: "Moderate", signal: "Down 9.8% from prior month", signal_emoji: "WATCH", category: "housing", updated_at: new Date().toISOString() },
  // Business
  { id: "20", slug: "corporate-profits", name: "Corporate Profits (After Tax)", latest_value: "$3.1T", trigger_level: "Declining preceded 81% of recessions", status: "watch", status_text: "Monitor", signal: "Profits flattening — watch trend", signal_emoji: "WATCH", category: "business_activity", updated_at: new Date().toISOString() },
  { id: "21", slug: "nfib-optimism", name: "NFIB Small Business Optimism", latest_value: "97.4", trigger_level: "<95 = pessimistic", status: "watch", status_text: "Near average", signal: "Job openings at lowest since COVID", signal_emoji: "WATCH", category: "business_activity", updated_at: new Date().toISOString() },
  { id: "22", slug: "inventory-sales-ratio", name: "Inventory-to-Sales Ratio", latest_value: "1.37", trigger_level: "Rising = goods piling up", status: "watch", status_text: "Slightly elevated", signal: "Above pre-pandemic trend", signal_emoji: "WATCH", category: "business_activity", updated_at: new Date().toISOString() },
  { id: "23", slug: "sloos-lending", name: "SLOOS Lending Standards", latest_value: "Net 10% tightening", trigger_level: ">20% = credit crunch", status: "watch", status_text: "Tightening", signal: "Standards at tightest since 2005", signal_emoji: "WATCH", category: "business_activity", updated_at: new Date().toISOString() },
  // Credit Stress
  { id: "24", slug: "personal-savings-rate", name: "Personal Savings Rate", latest_value: "3.9%", trigger_level: "<4% = no buffer", status: "warning", status_text: "Very low", signal: "Consumers tapped out — no cushion", signal_emoji: "WARNING", category: "credit_stress", updated_at: new Date().toISOString() },
  { id: "25", slug: "credit-card-delinquency", name: "Credit Card Delinquency Rate", latest_value: "4.1%", trigger_level: ">4% = GFC-level stress", status: "warning", status_text: "GFC territory", signal: "Highest since 2008 — broad-based", signal_emoji: "WARNING", category: "credit_stress", updated_at: new Date().toISOString() },
  { id: "26", slug: "debt-service-ratio", name: "Household Debt Service Ratio", latest_value: "11.4%", trigger_level: ">13% = crowding out spending", status: "watch", status_text: "Rising", signal: "Climbing from pandemic lows", signal_emoji: "WATCH", category: "credit_stress", updated_at: new Date().toISOString() },
  // Market
  { id: "27", slug: "nfci", name: "Chicago Fed NFCI", latest_value: "-0.32", trigger_level: ">0 = tighter conditions", status: "safe", status_text: "Loose", signal: "Financial conditions still accommodative", signal_emoji: "SAFE", category: "market", updated_at: new Date().toISOString() },
  { id: "28", slug: "credit-spreads", name: "Credit Spreads (HY OAS)", latest_value: "~320 bps", trigger_level: ">500 bps = stress", status: "watch", status_text: "Elevated", signal: "Widening — monitor for expansion", signal_emoji: "WATCH", category: "market", updated_at: new Date().toISOString() },
  { id: "29", slug: "vix", name: "VIX Volatility Index", latest_value: "18.2", trigger_level: ">30 = high fear", status: "safe", status_text: "Normal", signal: "Low volatility — complacency", signal_emoji: "SAFE", category: "market", updated_at: new Date().toISOString() },
  { id: "30", slug: "dxy-dollar-index", name: "DXY (Dollar Index)", latest_value: "~96-97", trigger_level: "Rapid decline = capital flight", status: "warning", status_text: "5-year lows", signal: "14-year record bear positioning", signal_emoji: "WARNING", category: "market", updated_at: new Date().toISOString() },
  { id: "31", slug: "emerging-markets", name: "Emerging Markets", latest_value: "+33.6%", trigger_level: "EM outperformance = late-cycle", status: "safe", status_text: "Bullish EM", signal: "Best year vs DM since 2017", signal_emoji: "SAFE", category: "market", updated_at: new Date().toISOString() },
  // Liquidity
  { id: "32", slug: "m2-money-supply", name: "M2 Money Supply", latest_value: "Stagnant", trigger_level: "Declining = deflationary", status: "watch", status_text: "Stagnant", signal: "Liquidity absorbed by Treasury issuance", signal_emoji: "WATCH", category: "liquidity", updated_at: new Date().toISOString() },
  { id: "33", slug: "on-rrp-facility", name: "ON RRP Facility", latest_value: "~$80B", trigger_level: "Near zero = no buffer", status: "warning", status_text: "97% depleted", signal: "Systemic safety valve gone", signal_emoji: "WARNING", category: "liquidity", updated_at: new Date().toISOString() },
  { id: "34", slug: "bank-unrealized-losses", name: "Bank Unrealized Losses", latest_value: "~$500B", trigger_level: "Forced selling risk", status: "warning", status_text: "Exposed", signal: "Vulnerable to liquidity shock", signal_emoji: "WARNING", category: "liquidity", updated_at: new Date().toISOString() },
  { id: "35", slug: "us-interest-expense", name: "US Interest Expense", latest_value: "~$950B/yr", trigger_level: "Fiscal doom loop", status: "warning", status_text: "Approaching $1T", signal: "Fastest-growing budget item", signal_emoji: "WARNING", category: "liquidity", updated_at: new Date().toISOString() },
  // Real-Time
  { id: "36", slug: "gdpnow", name: "Atlanta Fed GDPNow", latest_value: "1.8%", trigger_level: "<0% = real-time recession", status: "watch", status_text: "Below trend", signal: "Tracking below consensus", signal_emoji: "WATCH", category: "realtime", updated_at: new Date().toISOString() },
  { id: "37", slug: "copper-gold-ratio", name: "Copper-to-Gold Ratio", latest_value: "0.00077", trigger_level: "<0.00100 = industrial weakness", status: "danger", status_text: "50-year low", signal: "Below 2008 crisis levels", signal_emoji: "DANGER", category: "realtime", updated_at: new Date().toISOString() },
  { id: "38", slug: "freight-index", name: "Freight Transportation Index", latest_value: "118.2", trigger_level: "Declining = slowing activity", status: "watch", status_text: "Moderate", signal: "Freight below peak — goods slowing", signal_emoji: "WATCH", category: "realtime", updated_at: new Date().toISOString() },
];
