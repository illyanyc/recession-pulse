import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./DashboardContent";
import { getRiskAssessment, getUserStockSignals } from "@/lib/redis";
import type { RecessionRiskAssessment, StockSignal } from "@/types";

export const metadata = {
  title: "Dashboard — RecessionPulse",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch enough rows to get at least 2 readings per slug for daily change
  const { data: indicators } = await supabase
    .from("indicator_readings")
    .select("*")
    .order("reading_date", { ascending: false })
    .limit(500);

  // Group by slug: latest + previous reading to compute daily change
  const slugMap: Record<string, (typeof indicators extends (infer T)[] | null ? T : never)[]> = {};
  for (const ind of indicators ?? []) {
    if (!slugMap[ind.slug]) slugMap[ind.slug] = [];
    if (slugMap[ind.slug].length < 2) slugMap[ind.slug].push(ind);
  }

  const MAX_REASONABLE_PCT_CHANGE = 200;
  const latestIndicators = Object.values(slugMap).map((readings) => {
    const latest = readings[0];
    const prev = readings[1];
    let daily_change_pct: number | null = null;
    if (prev && latest.numeric_value != null && prev.numeric_value != null && prev.numeric_value !== 0) {
      const raw = ((latest.numeric_value - prev.numeric_value) / Math.abs(prev.numeric_value)) * 100;
      daily_change_pct = Math.abs(raw) > MAX_REASONABLE_PCT_CHANGE ? null : raw;
    }
    return { ...latest, daily_change_pct };
  });

  // Fetch subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  // Fetch stock signals: Redis (user's latest refresh) first, fall back to Supabase
  let stockSignals: StockSignal[] = [];
  try {
    const cached = await getUserStockSignals(user.id);
    if (cached && cached.length > 0) {
      stockSignals = cached as StockSignal[];
    }
  } catch { /* Redis miss */ }

  if (stockSignals.length === 0) {
    const { data: rawStockSignals } = await supabase
      .from("stock_signals")
      .select("*")
      .order("screened_at", { ascending: false })
      .limit(50);

    if (rawStockSignals) {
      const seen = new Set<string>();
      stockSignals = rawStockSignals.filter((sig) => {
        if (seen.has(sig.ticker)) return false;
        seen.add(sig.ticker);
        return true;
      });
    }
  }


  // Fetch recent messages
  const { data: messages } = await supabase
    .from("message_queue")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch latest recession risk assessment (Redis first, then Supabase)
  let riskAssessment: RecessionRiskAssessment | null = null;
  try {
    const cached = await getRiskAssessment();
    if (cached) riskAssessment = cached as RecessionRiskAssessment;
  } catch { /* Redis miss */ }

  if (!riskAssessment) {
    const { data } = await supabase
      .from("recession_risk_assessments")
      .select("*")
      .order("assessment_date", { ascending: false })
      .limit(1)
      .single();
    riskAssessment = data;
  }

  // 30-day score history for the banner sparkline
  const { data: riskHistoryRaw } = await supabase
    .from("recession_risk_assessments")
    .select("assessment_date, score, risk_level")
    .order("assessment_date", { ascending: false })
    .limit(30);

  const riskHistory = (riskHistoryRaw ?? [])
    .map((r) => ({
      date: r.assessment_date as string,
      score: r.score as number,
      risk_level: r.risk_level as RecessionRiskAssessment["risk_level"],
    }))
    .reverse();

  return (
    <DashboardContent
      profile={profile}
      indicators={latestIndicators}
      subscription={subscription}
      stockSignals={stockSignals || []}
      messages={messages || []}
      riskAssessment={riskAssessment}
      riskHistory={riskHistory}
    />
  );
}
