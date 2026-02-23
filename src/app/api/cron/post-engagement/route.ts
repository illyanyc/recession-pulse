import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateEngagementPost } from "@/lib/content-generator";
import { postMarketingTweet } from "@/lib/social-poster";

// Runs at 20:00 UTC (3:00 PM ET) — afternoon engagement tweet.
// Hot takes, questions, and contrarian views to drive replies and algo boost.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    const { data: readings } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, status, signal, signal_emoji, reading_date")
      .order("reading_date", { ascending: false });

    if (!readings || readings.length === 0) {
      return NextResponse.json({ message: "No indicator data" });
    }

    const latestBySlug = new Map<string, (typeof readings)[0]>();
    for (const r of readings) {
      if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
    }

    const indicators = Array.from(latestBySlug.values()).map((i) => ({
      name: i.name,
      slug: i.slug,
      latest_value: i.latest_value,
      status: i.status,
      signal: i.signal,
      signal_emoji: i.signal_emoji,
    }));

    const tweet = await generateEngagementPost(indicators);
    if (!tweet) {
      return NextResponse.json({ message: "Empty content generated" });
    }

    const posted = await postMarketingTweet(tweet, "engagement", "Engagement");

    return NextResponse.json({
      message: posted ? "Engagement tweet posted" : "Engagement tweet failed",
      posted,
    });
  } catch (error) {
    console.error("Engagement cron error:", error);
    return NextResponse.json(
      { error: "Engagement cron failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
