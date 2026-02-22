import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { setUserIndicators } from "@/lib/redis";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const secret = process.env.CRON_SECRET;

    const res = await fetch(`${appUrl}/api/cron/fetch-indicators?secret=${secret}`);

    let data;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json({ error: "Failed to parse response from data fetch" }, { status: 502 });
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error || "Data fetch failed", details: data },
        { status: res.status }
      );
    }

    // Cache the fresh data per-user in Redis
    try {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const service = createServiceClient();
      const today = new Date().toISOString().split("T")[0];

      const { data: indicators } = await service
        .from("indicator_readings")
        .select("*")
        .eq("reading_date", today);

      if (indicators && indicators.length > 0) {
        const bySlug = new Map<string, typeof indicators[0]>();
        for (const row of indicators) {
          if (!bySlug.has(row.slug)) bySlug.set(row.slug, row);
        }
        await setUserIndicators(user.id, Array.from(bySlug.values()));
      }
    } catch (cacheErr) {
      console.warn("Redis cache failed (non-critical):", cacheErr instanceof Error ? cacheErr.message : cacheErr);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Refresh route error:", err);
    return NextResponse.json(
      { error: "Failed to refresh data. Please try again." },
      { status: 500 }
    );
  }
}
