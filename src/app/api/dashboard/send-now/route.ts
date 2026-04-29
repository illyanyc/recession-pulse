import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/sms";
import { sendEmail } from "@/lib/resend";
import { formatRecessionSMS, formatStockAlertSMS } from "@/lib/message-formatter";
import { buildDailyBriefingEmail } from "@/lib/email-templates";
import type { BlogPostPreview, RiskAssessmentPreview } from "@/lib/email-templates";
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

    // Fetch today's blog post if available
    let todaysBlogPost: BlogPostPreview | undefined;
    try {
      const { data: blogPost } = await service
        .from("blog_posts")
        .select("slug, title, excerpt")
        .eq("content_type", "daily_risk_assessment")
        .eq("status", "published")
        .gte("published_at", `${today}T00:00:00`)
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

      if (blogPost) {
        todaysBlogPost = blogPost;
      }
    } catch {
      // Blog post may not exist yet
    }

    // Fetch today's AI risk assessment + 30d delta
    let todaysRiskAssessment: RiskAssessmentPreview | undefined;
    try {
      const { data: todaysRow } = await service
        .from("recession_risk_assessments")
        .select("score, risk_level, summary, assessment_date")
        .eq("assessment_date", today)
        .single();

      if (todaysRow) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { data: priorRow } = await service
          .from("recession_risk_assessments")
          .select("score")
          .lte("assessment_date", thirtyDaysAgo.toISOString().split("T")[0])
          .order("assessment_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        todaysRiskAssessment = {
          score: todaysRow.score,
          risk_level: todaysRow.risk_level,
          summary: todaysRow.summary,
          assessment_date: todaysRow.assessment_date,
          delta30d: priorRow?.score != null ? todaysRow.score - priorRow.score : null,
        };
      }
    } catch {
      // Risk assessment may not exist yet
    }

    // SMS — coming soon (toll-free verification in progress)
    channels.push({ name: "SMS", status: "skipped", error: "Coming soon" });

    // Email
    if (profile.email && profile.email_alerts_enabled) {
      const emailPlan = plan === "pulse_pro" ? "pulse_pro" : "pulse";
      const { subject, html } = buildDailyBriefingEmail(
        indicatorsWithTrends,
        (stockSignals as StockSignal[]) || [],
        emailPlan,
        todaysBlogPost,
        todaysRiskAssessment
      );
      const result = await sendEmail({
        to: profile.email,
        subject,
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
