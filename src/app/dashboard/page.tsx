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

  // Fetch latest indicators (need enough rows to cover all slugs with history)
  const { data: indicators } = await supabase
    .from("indicator_readings")
    .select("*")
    .order("reading_date", { ascending: false })
    .limit(200);

  // Deduplicate by slug (get latest per indicator)
  const latestIndicators = indicators
    ? Object.values(
        indicators.reduce(
          (acc: Record<string, typeof indicators[0]>, ind) => {
            if (!acc[ind.slug]) acc[ind.slug] = ind;
            return acc;
          },
          {}
        )
      )
    : [];

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

  return (
    <DashboardContent
      profile={profile}
      indicators={latestIndicators}
      subscription={subscription}
      stockSignals={stockSignals || []}
      messages={messages || []}
      riskAssessment={riskAssessment}
    />
  );
}
