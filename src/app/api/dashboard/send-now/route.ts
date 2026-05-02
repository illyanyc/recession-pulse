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

    // Fetch today's blog post if available; fall back to latest daily post
    // so the email always includes the blog card even if today's cron skipped.
    let todaysBlogPost: BlogPostPreview | undefined;
    try {
      let { data: blogPost } = await service
        .from("blog_posts")
        .select("slug, title, excerpt, published_at")
        .eq("content_type", "daily_risk_assessment")
        .eq("status", "published")
        .gte("published_at", `${today}T00:00:00`)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!blogPost) {
        const { data: latestPost } = await service
          .from("blog_posts")
          .select("slug, title, excerpt, published_at")
          .eq("content_type", "daily_risk_assessment")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        blogPost = latestPost;
      }

      if (blogPost) {
        todaysBlogPost = {
          slug: blogPost.slug,
          title: blogPost.title,
          excerpt: blogPost.excerpt,
        };
      }
    } catch {
      // Blog post may not exist yet
    }

    // Fetch today's AI risk assessment + 30d delta; fall back to the latest
    // assessment on record if today's row is missing.
    let todaysRiskAssessment: RiskAssessmentPreview | undefined;
    try {
      let { data: assessmentRow } = await service
        .from("recession_risk_assessments")
        .select("score, risk_level, summary, assessment_date")
        .eq("assessment_date", today)
        .maybeSingle();

      if (!assessmentRow) {
        const { data: latestRow } = await service
          .from("recession_risk_assessments")
          .select("score, risk_level, summary, assessment_date")
          .order("assessment_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        assessmentRow = latestRow;
      }

      if (assessmentRow) {
        const anchor = new Date(`${assessmentRow.assessment_date}T00:00:00Z`);
        anchor.setUTCDate(anchor.getUTCDate() - 30);
        const thirtyDaysAgoIso = anchor.toISOString().split("T")[0];
        const { data: priorRow } = await service
          .from("recession_risk_assessments")
          .select("score")
          .lte("assessment_date", thirtyDaysAgoIso)
          .order("assessment_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: yesterdayRow } = await service
          .from("recession_risk_assessments")
          .select("score")
          .lt("assessment_date", assessmentRow.assessment_date)
          .order("assessment_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        todaysRiskAssessment = {
          score: assessmentRow.score,
          risk_level: assessmentRow.risk_level,
          summary: assessmentRow.summary,
          assessment_date: assessmentRow.assessment_date,
          delta30d: priorRow?.score != null ? assessmentRow.score - priorRow.score : null,
          deltaYesterday:
            yesterdayRow?.score != null ? assessmentRow.score - yesterdayRow.score : null,
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
