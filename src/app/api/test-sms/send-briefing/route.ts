import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/sms";
import { formatRecessionSMS, formatStockAlertSMS } from "@/lib/message-formatter";
import { fetchIndicatorTrends, mergeWithTrends } from "@/lib/indicator-history";
import { verifyCronAuth } from "@/lib/cron-auth";
import type { RecessionIndicator, StockSignal } from "@/types";

export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const ownerPhone = process.env.OWNER_PHONE_NUMBER;
  if (!ownerPhone) {
    return NextResponse.json({ error: "OWNER_PHONE_NUMBER not configured" }, { status: 500 });
  }

  const supabase = createServiceClient();

  try {
    const { data: readings } = await supabase
      .from("indicator_readings")
      .select("*")
      .order("reading_date", { ascending: false });

    const latestBySlug = new Map<string, RecessionIndicator>();
    for (const r of (readings || []) as RecessionIndicator[]) {
      if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
    }
    const indicators = Array.from(latestBySlug.values());

    const trends = await fetchIndicatorTrends(indicators);
    const indicatorsWithTrends = mergeWithTrends(indicators, trends);

    const recessionSMS = formatRecessionSMS(indicatorsWithTrends);

    const result1 = await sendSMS(ownerPhone, recessionSMS);

    const { data: stockSignals } = await supabase
      .from("stock_signals")
      .select("*")
      .order("screened_at", { ascending: false })
      .limit(30);

    const seen = new Set<string>();
    const uniqueStocks = ((stockSignals || []) as StockSignal[]).filter((s) => {
      if (seen.has(s.ticker)) return false;
      seen.add(s.ticker);
      return true;
    });

    const stockSMS = formatStockAlertSMS(uniqueStocks);
    const result2 = await sendSMS(ownerPhone, stockSMS);

    return NextResponse.json({
      message: "Briefing SMS sent to owner",
      recession_sms: { success: result1.success, sid: result1.sid, error: result1.error, length: recessionSMS.length },
      stock_sms: { success: result2.success, sid: result2.sid, error: result2.error, length: stockSMS.length },
      indicators_count: indicators.length,
      stocks_count: uniqueStocks.length,
      to: ownerPhone,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
