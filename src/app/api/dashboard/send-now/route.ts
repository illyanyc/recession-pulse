import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/sms";
import { sendEmail } from "@/lib/resend";
import { formatRecessionSMS, formatStockAlertSMS } from "@/lib/message-formatter";
import { buildDailyBriefingEmail } from "@/lib/email-templates";
import { fetchIndicatorTrends, mergeWithTrends } from "@/lib/indicator-history";
import { NextResponse } from "next/server";
import type { RecessionIndicator, StockSignal } from "@/types";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = createServiceClient();

  const { data: profile } = await service
    .from("profiles")
    .select("*, subscriptions!inner(plan, status)")
    .eq("id", user.id)
    .eq("subscriptions.status", "active")
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
  }

  const plan = profile.subscriptions?.[0]?.plan || "pulse";
  const channels: { name: string; status: "sent" | "failed" | "skipped"; error?: string }[] = [];

  try {
    const today = new Date().toISOString().split("T")[0];

    const { data: indicators } = await service
      .from("indicator_readings")
      .select("*")
      .eq("reading_date", today);

    const latestIndicators: RecessionIndicator[] = indicators
      ? Object.values(
          indicators.reduce(
            (acc: Record<string, RecessionIndicator>, ind: RecessionIndicator) => {
              if (!acc[ind.slug]) acc[ind.slug] = ind;
              return acc;
            },
            {}
          )
        )
      : [];

    const trends = await fetchIndicatorTrends(latestIndicators);
    const indicatorsWithTrends = mergeWithTrends(latestIndicators, trends);

    const { data: stockSignals } = await service
      .from("stock_signals")
      .select("*")
      .eq("screened_at", today);

    // SMS — coming soon (toll-free verification in progress)
    channels.push({ name: "SMS", status: "skipped", error: "Coming soon" });

    // Email
    if (profile.email && profile.email_alerts_enabled) {
      const emailPlan = plan === "pulse_pro" ? "pulse_pro" : "pulse";
      const { html } = buildDailyBriefingEmail(
        indicatorsWithTrends,
        (stockSignals as StockSignal[]) || [],
        emailPlan
      );
      const result = await sendEmail({
        to: profile.email,
        subject: `RecessionPulse Daily Briefing — ${new Date().toLocaleDateString()}`,
        html,
      });
      channels.push(result.success
        ? { name: "Email", status: "sent" }
        : { name: "Email", status: "failed", error: result.error });
    } else {
      channels.push({ name: "Email", status: "skipped", error: !profile.email ? "No email" : "Email disabled" });
    }

    return NextResponse.json({ message: "Alerts processed", channels });
  } catch (err) {
    console.error("Send-now error:", err);
    return NextResponse.json(
      { error: "Failed to send alerts", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
