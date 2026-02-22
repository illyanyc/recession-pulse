import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateWeeklyReport } from "@/lib/content-generator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const stats = { generated: 0, published: 0, errors: 0 };

  try {
    const today = new Date();
    const weekDate = today.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // Fetch latest indicator readings
    const { data: readings } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, status, signal, signal_emoji, reading_date")
      .order("reading_date", { ascending: false });

    if (!readings || readings.length === 0) {
      return NextResponse.json({
        message: "No indicator data available for content generation",
        stats,
      });
    }

    // Deduplicate to latest per slug
    const latestBySlug = new Map<string, typeof readings[0]>();
    for (const r of readings) {
      if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
    }
    const indicators = Array.from(latestBySlug.values());

    // Check if weekly report already exists for this week
    const dateSlug = weekDate.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const expectedSlug = `weekly-recession-report-${dateSlug}`;

    const { data: existing } = await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", expectedSlug)
      .single();

    if (existing) {
      return NextResponse.json({
        message: "Weekly report already generated",
        slug: expectedSlug,
        stats,
      });
    }

    // Generate weekly report
    const article = await generateWeeklyReport(indicators, weekDate);
    stats.generated++;

    // Store in database and publish
    const { error: insertError } = await supabase.from("blog_posts").insert({
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      meta_description: article.meta_description,
      keywords: article.keywords,
      content_type: "weekly_report",
      status: "published",
      published_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("Failed to insert blog post:", insertError);
      stats.errors++;
    } else {
      stats.published++;
    }

    return NextResponse.json({
      message: "Content generation complete",
      stats,
      slug: article.slug,
    });
  } catch (error) {
    console.error("Content generation error:", error);
    return NextResponse.json(
      {
        error: "Content generation failed",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
