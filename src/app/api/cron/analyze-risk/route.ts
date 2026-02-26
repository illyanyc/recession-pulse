import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { runAgenticRiskAssessment } from "@/lib/risk-assessment-agent";
import { setRiskAssessment } from "@/lib/redis";
import { verifyCronAuth } from "@/lib/cron-auth";

export const maxDuration = 120;

export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const supabase = createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  try {
    const { data: existing } = await supabase
      .from("recession_risk_assessments")
      .select("id")
      .eq("assessment_date", today)
      .single();

    if (existing) {
      return NextResponse.json({ message: "Assessment already exists for today", date: today });
    }

    // Fetch latest indicator readings
    const { data: readings } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, status, signal, signal_emoji, reading_date")
      .order("reading_date", { ascending: false });

    if (!readings?.length) {
      return NextResponse.json({ error: "No indicator data available" }, { status: 400 });
    }

    const latestBySlug = new Map<string, (typeof readings)[0]>();
    for (const r of readings) {
      if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
    }
    const currentIndicators = Array.from(latestBySlug.values());

    // 7-day history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: historyData } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, status, signal, reading_date")
      .gte("reading_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("reading_date", { ascending: true });

    // Fetch latest stock signals (today's or most recent)
    const { data: stockSignals } = await supabase
      .from("stock_signals")
      .select("ticker, company_name, signal_type, pe_ratio, dividend_yield, rsi_14, market_cap")
      .order("screened_at", { ascending: false })
      .limit(30);

    const seen = new Set<string>();
    const uniqueStocks = (stockSignals || []).filter((s) => {
      if (seen.has(s.ticker)) return false;
      seen.add(s.ticker);
      return true;
    });

    // Run agentic assessment with web search
    const result = await runAgenticRiskAssessment(
      currentIndicators,
      historyData || [],
      uniqueStocks
    );

    // Persist to Supabase
    const { error: insertError } = await supabase
      .from("recession_risk_assessments")
      .insert({
        score: result.score,
        risk_level: result.risk_level,
        summary: result.summary,
        key_factors: result.key_factors,
        outlook: result.outlook,
        indicators_snapshot: currentIndicators,
        model: result.model,
        assessment_date: today,
      });

    if (insertError) {
      console.error("Failed to insert risk assessment:", insertError);
    }

    // Cache in Redis
    const assessmentRecord = {
      id: "generated",
      score: result.score,
      risk_level: result.risk_level,
      summary: result.summary,
      key_factors: result.key_factors,
      outlook: result.outlook,
      model: result.model,
      assessment_date: today,
      created_at: new Date().toISOString(),
    };
    await setRiskAssessment(assessmentRecord).catch(() => {});

    // Generate and publish blog post (with 7-day history for trend analysis)
    let blogPublished = false;
    try {
      const { generateRiskBlogPost } = await import("@/lib/content-generator");
      const todayLabel = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const blogArticle = await generateRiskBlogPost(currentIndicators, result, todayLabel, historyData || []);

      const dateSlug = blogArticle.slug;
      const { data: existingPost } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", dateSlug)
        .single();

      if (!existingPost) {
        const { error: blogError } = await supabase.from("blog_posts").insert({
          slug: blogArticle.slug,
          title: blogArticle.title,
          excerpt: blogArticle.excerpt,
          content: blogArticle.content,
          meta_description: blogArticle.meta_description,
          keywords: blogArticle.keywords,
          content_type: "daily_risk_assessment",
          status: "published",
          published_at: new Date().toISOString(),
        });

        if (blogError) {
          console.error("Failed to publish risk blog post:", blogError);
        } else {
          blogPublished = true;
        }
      }
    } catch (blogErr) {
      console.error("Blog generation failed (non-critical):", blogErr instanceof Error ? blogErr.message : blogErr);
    }

    return NextResponse.json({
      message: "Agentic recession risk assessment complete",
      score: result.score,
      risk_level: result.risk_level,
      sources_consulted: result.sources.length,
      blog_published: blogPublished,
      date: today,
    });
  } catch (error) {
    console.error("Risk assessment error:", error);
    return NextResponse.json(
      { error: "Assessment failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
