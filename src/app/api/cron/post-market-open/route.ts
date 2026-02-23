import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateMarketOpenHook } from "@/lib/content-generator";
import { postMarketingTweet } from "@/lib/social-poster";

// Runs at 14:30 UTC (9:30 AM ET) — NYSE market open.
// Posts a punchy, data-driven tweet about the most interesting indicator.
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

    const tweet = await generateMarketOpenHook(indicators);
    if (!tweet) {
      return NextResponse.json({ message: "Empty content generated" });
    }

    const posted = await postMarketingTweet(tweet, "market_open_hook", "Market Open");

    return NextResponse.json({
      message: posted ? "Market open tweet posted" : "Market open tweet failed",
      posted,
    });
  } catch (error) {
    console.error("Market open cron error:", error);
    return NextResponse.json(
      { error: "Market open cron failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
