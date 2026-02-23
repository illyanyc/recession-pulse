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

    // #region agent log
    const fs = await import("fs"); fs.appendFileSync("/Users/illya/dev/recession-tracker/.cursor/debug.log", JSON.stringify({id:"log_refresh_1",timestamp:Date.now(),location:"api/dashboard/refresh/route.ts:17",message:"Refresh route called - fetching indicators + stocks",data:{appUrl,hasSecret:!!secret},hypothesisId:"H1"})+"\n");
    // #endregion

    const [indicatorRes, stockRes] = await Promise.all([
      fetch(`${appUrl}/api/cron/fetch-indicators?secret=${secret}`),
      fetch(`${appUrl}/api/cron/screen-stocks?secret=${secret}`),
    ]);

    let indicatorData;
    try {
      indicatorData = await indicatorRes.json();
    } catch {
      return NextResponse.json({ error: "Failed to parse indicator response" }, { status: 502 });
    }

    if (!indicatorRes.ok) {
      return NextResponse.json(
        { error: indicatorData?.error || "Indicator fetch failed", details: indicatorData },
        { status: indicatorRes.status }
      );
    }

    let stockData;
    try {
      stockData = await stockRes.json();
    } catch {
      stockData = { message: "Stock screening response parse failed" };
    }

    // Cache the fresh indicator data per-user in Redis
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

    // #region agent log
    const fs2 = await import("fs"); fs2.appendFileSync("/Users/illya/dev/recession-tracker/.cursor/debug.log", JSON.stringify({id:"log_refresh_2",timestamp:Date.now(),location:"api/dashboard/refresh/route.ts:end",message:"Refresh completed - indicators + stocks",data:{indicatorOk:indicatorRes.ok,stockOk:stockRes.ok,indicatorMsg:indicatorData?.message,stockMsg:stockData?.message},hypothesisId:"H1"})+"\n");
    // #endregion

    return NextResponse.json({
      message: `${indicatorData.message || "Indicators refreshed"}. ${stockData.message || "Stocks screened"}.`,
      indicators: indicatorData,
      stocks: stockData,
    });
  } catch (err) {
    console.error("Refresh route error:", err);
    return NextResponse.json(
      { error: "Failed to refresh data. Please try again." },
      { status: 500 }
    );
  }
}
