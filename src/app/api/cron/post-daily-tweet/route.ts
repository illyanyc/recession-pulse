import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { postDailyBriefing } from "@/lib/social-poster";
import { verifyCronAuth } from "@/lib/cron-auth";

// Runs at 14:00 UTC (9:00 AM ET) — 1 hour after email/SMS alerts,
// 30 minutes before NYSE market open at 9:30 AM ET.
// Generates an AI tweet and SMSes it to OWNER_PHONE_NUMBER for manual posting.
export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  try {
    const supabase = createServiceClient();

    const { data: readings } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, status, signal, signal_emoji, reading_date")
      .order("reading_date", { ascending: false });

    if (!readings || readings.length === 0) {
      return NextResponse.json({ message: "No indicator data for tweet" });
    }

    const latestBySlug = new Map<string, typeof readings[0]>();
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

    const sent = await postDailyBriefing(indicators);

    return NextResponse.json({
      message: sent ? "Daily tweet SMS sent to owner" : "Tweet SMS failed",
      sent,
      indicatorCount: indicators.length,
    });
  } catch (error) {
    console.error("Daily tweet cron error:", error);
    return NextResponse.json(
      { error: "Daily tweet cron failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
