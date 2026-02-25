import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { runStockScreener } from "@/lib/stock-screener";
import { verifyCronAuth } from "@/lib/cron-auth";

export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const supabase = createServiceClient();

  try {
    const signals = await runStockScreener();

    // Store results permanently in Supabase (cron adds daily, never deletes)
    if (signals.length > 0) {
      const today = new Date().toISOString().split("T")[0];

      const rows = signals.map((s) => ({
        ticker: s.ticker,
        company_name: s.company_name,
        price: s.price,
        ema_200: s.ema_200,
        rsi_14: s.rsi_14,
        forward_pe: s.forward_pe,
        market_cap: s.market_cap,
        avg_volume: s.avg_volume,
        dividend_yield: s.dividend_yield,
        sector: s.sector,
        signal_type: s.signal_type,
        passes_filter: s.passes_filter,
        notes: s.notes,
        screened_at: today,
      }));

      const { error } = await supabase.from("stock_signals").insert(rows);

      if (error) {
        console.error("Error storing stock signals:", error);
      }
    }

    return NextResponse.json({
      message: `Screened stocks, found ${signals.length} signals`,
      signals,
    });
  } catch (error) {
    console.error("Stock screener error:", error);
    return NextResponse.json(
      { error: "Stock screener failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
