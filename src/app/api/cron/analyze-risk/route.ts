import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateRecessionRiskAssessment } from "@/lib/content-generator";
import { setRiskAssessment } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const historyStart = sevenDaysAgo.toISOString().split("T")[0];

    const { data: historyData } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, status, signal, reading_date")
      .gte("reading_date", historyStart)
      .order("reading_date", { ascending: true });

    const result = await generateRecessionRiskAssessment(
      currentIndicators,
      historyData || []
    );

    const { error: insertError } = await supabase
      .from("recession_risk_assessments")
      .insert({
        score: result.score,
        risk_level: result.risk_level,
        summary: result.summary,
        key_factors: result.key_factors,
        outlook: result.outlook,
        indicators_snapshot: currentIndicators,
        model: "gpt-4o",
        assessment_date: today,
      });

    if (insertError) {
      console.error("Failed to insert risk assessment:", insertError);
    }

    const assessmentRecord = {
      id: "generated",
      score: result.score,
      risk_level: result.risk_level,
      summary: result.summary,
      key_factors: result.key_factors,
      outlook: result.outlook,
      model: "gpt-4o",
      assessment_date: today,
      created_at: new Date().toISOString(),
    };
    await setRiskAssessment(assessmentRecord).catch(() => {});

    const dateSlug = result.blog_article.slug;
    const { data: existingPost } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", dateSlug)
      .single();

    let blogPublished = false;
    if (!existingPost) {
      const { error: blogError } = await supabase.from("blog_posts").insert({
        slug: result.blog_article.slug,
        title: result.blog_article.title,
        excerpt: result.blog_article.excerpt,
        content: result.blog_article.content,
        meta_description: result.blog_article.meta_description,
        keywords: result.blog_article.keywords,
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

    return NextResponse.json({
      message: "Recession risk assessment complete",
      score: result.score,
      risk_level: result.risk_level,
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
