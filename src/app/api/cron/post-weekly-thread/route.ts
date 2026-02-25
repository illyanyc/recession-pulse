import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { postWeeklyThreadFromIndicators } from "@/lib/social-poster";
import { verifyCronAuth } from "@/lib/cron-auth";

// Runs Sunday at 22:00 UTC (5:00 PM ET).
// Generates an AI Twitter thread and SMSes it to OWNER_PHONE_NUMBER for manual posting.
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
      return NextResponse.json({ message: "No indicator data for thread" });
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

    const sent = await postWeeklyThreadFromIndicators(indicators);

    return NextResponse.json({
      message: sent ? "Weekly thread SMS sent to owner" : "Thread SMS failed",
      sent,
      indicatorCount: indicators.length,
    });
  } catch (error) {
    console.error("Weekly thread cron error:", error);
    return NextResponse.json(
      { error: "Weekly thread cron failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
