import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { buildDailyBriefingEmail } from "@/lib/email-templates";
import type { BlogPostPreview, RiskAssessmentPreview } from "@/lib/email-templates";
import { fetchIndicatorTrends, mergeWithTrends } from "@/lib/indicator-history";
import { verifyCronAuth } from "@/lib/cron-auth";
import { sendEmail } from "@/lib/resend";
import type { RecessionIndicator, StockSignal } from "@/types";

/**
 * Diagnostic route: renders the daily briefing email using the exact
 * same data pipeline as `/api/cron/send-alerts` but never queues or sends.
 *
 * Returns the rendered HTML directly (Content-Type: text/html) so we can
 * eyeball the risk-score section, blog snippet, and trend chart against
 * whatever today's DB state looks like.
 *
 * Guarded by the same cron auth (`?secret=...` or Authorization header).
 */
export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const supabase = createServiceClient();
  const today = new Date().toISOString().split("T")[0];
  const debug: Record<string, unknown> = { today };

  const { data: indicators } = await supabase
    .from("indicator_readings")
    .select("*")
    .eq("reading_date", today)
    .order("created_at", { ascending: false });

  const latestIndicators: RecessionIndicator[] = indicators
    ? (() => {
        const seenSlugs = new Set<string>();
        const seenNames = new Set<string>();
        const unique: RecessionIndicator[] = [];
        for (const ind of indicators as RecessionIndicator[]) {
          const slug = ind.slug?.trim();
          const name = ind.name?.trim();
          if (slug && seenSlugs.has(slug)) continue;
          if (name && seenNames.has(name)) continue;
          if (slug) seenSlugs.add(slug);
          if (name) seenNames.add(name);
          unique.push(ind);
        }
        return unique;
      })()
    : [];
  debug.indicatorCount = latestIndicators.length;

  const trends = await fetchIndicatorTrends(latestIndicators);
  const indicatorsWithTrends = mergeWithTrends(latestIndicators, trends);

  const { data: stockSignals } = await supabase
    .from("stock_signals")
    .select("*")
    .eq("screened_at", today);

  let todaysBlogPost: BlogPostPreview | undefined;
  try {
    let { data: blogPost } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, published_at")
      .eq("content_type", "daily_risk_assessment")
      .eq("status", "published")
      .gte("published_at", `${today}T00:00:00`)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    debug.blogPostTodayFound = !!blogPost;

    if (!blogPost) {
      const { data: latestPost } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, published_at")
        .eq("content_type", "daily_risk_assessment")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      blogPost = latestPost;
      debug.blogPostFallback = latestPost
        ? { slug: latestPost.slug, published_at: latestPost.published_at }
        : null;
    }

    if (blogPost) {
      todaysBlogPost = {
        slug: blogPost.slug,
        title: blogPost.title,
        excerpt: blogPost.excerpt,
      };
    }
  } catch (err) {
    debug.blogPostError = err instanceof Error ? err.message : String(err);
  }

  let todaysRiskAssessment: RiskAssessmentPreview | undefined;
  try {
    let { data: assessmentRow } = await supabase
      .from("recession_risk_assessments")
      .select("score, risk_level, summary, assessment_date")
      .eq("assessment_date", today)
      .maybeSingle();

    debug.assessmentTodayFound = !!assessmentRow;

    if (!assessmentRow) {
      const { data: latestRow } = await supabase
        .from("recession_risk_assessments")
        .select("score, risk_level, summary, assessment_date")
        .order("assessment_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      assessmentRow = latestRow;
      debug.assessmentFallback = latestRow
        ? { assessment_date: latestRow.assessment_date, score: latestRow.score }
        : null;
    }

    if (assessmentRow) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: priorRow } = await supabase
        .from("recession_risk_assessments")
        .select("score, assessment_date")
        .lte("assessment_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("assessment_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const delta30d = priorRow?.score != null ? assessmentRow.score - priorRow.score : null;
      todaysRiskAssessment = {
        score: assessmentRow.score,
        risk_level: assessmentRow.risk_level,
        summary: assessmentRow.summary,
        assessment_date: assessmentRow.assessment_date,
        delta30d,
      };
    }
  } catch (err) {
    debug.assessmentError = err instanceof Error ? err.message : String(err);
  }

  const { subject, html } = buildDailyBriefingEmail(
    indicatorsWithTrends,
    (stockSignals as StockSignal[]) || [],
    "free",
    todaysBlogPost,
    todaysRiskAssessment
  );

  const url = new URL(request.url);
  const sendTo = url.searchParams.get("sendTo");
  if (sendTo) {
    const result = await sendEmail({
      to: sendTo,
      subject: `[TEST] ${subject}`,
      html,
    });
    return NextResponse.json({
      sentTo: sendTo,
      subject,
      success: result.success,
      error: result.error ?? null,
      debug,
      riskAssessmentRendered: !!todaysRiskAssessment,
      blogPostRendered: !!todaysBlogPost,
    });
  }

  if (url.searchParams.get("format") === "json") {
    return NextResponse.json({
      debug,
      riskAssessmentRendered: !!todaysRiskAssessment,
      blogPostRendered: !!todaysBlogPost,
      htmlLength: html.length,
      subject,
    });
  }

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
