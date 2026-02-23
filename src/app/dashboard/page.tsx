import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "./DashboardContent";

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

  // Fetch latest indicators
  const { data: indicators } = await supabase
    .from("indicator_readings")
    .select("*")
    .order("reading_date", { ascending: false })
    .limit(20);

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

  // Fetch stock signals (today)
  const { data: stockSignals } = await supabase
    .from("stock_signals")
    .select("*")
    .order("screened_at", { ascending: false })
    .limit(20);

  // Fetch recent messages
  const { data: messages } = await supabase
    .from("message_queue")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch latest recession risk assessment
  const { data: riskAssessment } = await supabase
    .from("recession_risk_assessments")
    .select("*")
    .order("assessment_date", { ascending: false })
    .limit(1)
    .single();

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
