import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateCTAPost, generateStockScreenerHighlight } from "@/lib/content-generator";
import { postMarketingTweet } from "@/lib/social-poster";
import { verifyCronAuth } from "@/lib/cron-auth";

// Runs at 23:00 UTC (6:00 PM ET) — evening CTA / social proof tweet.
// On Thursdays, posts stock screener highlights instead.
export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  try {
    const isThursday = new Date().getUTCDay() === 4;

    if (isThursday) {
      return await postScreenerHighlight();
    }

    return await postCTA();
  } catch (error) {
    console.error("CTA cron error:", error);
    return NextResponse.json(
      { error: "CTA cron failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

async function postCTA() {
  const supabase = createServiceClient();

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const tweet = await generateCTAPost(count ?? undefined);
  if (!tweet) {
    return NextResponse.json({ message: "Empty content generated" });
  }

  const posted = await postMarketingTweet(tweet, "cta", "CTA");

  return NextResponse.json({
    message: posted ? "CTA tweet posted" : "CTA tweet failed",
    posted,
    type: "cta",
  });
}

async function postScreenerHighlight() {
  const supabase = createServiceClient();

  const { data: stocks } = await supabase
    .from("stock_screens")
    .select("ticker, name, pe_ratio, rsi, sector")
    .order("created_at", { ascending: false })
    .limit(10);

  if (!stocks || stocks.length === 0) {
    return await postCTA();
  }

  const formatted = stocks.slice(0, 5).map((s) => ({
    ticker: s.ticker,
    name: s.name || s.ticker,
    pe: s.pe_ratio ?? 0,
    rsi: s.rsi ?? 0,
    sector: s.sector || "Unknown",
  }));

  const tweet = await generateStockScreenerHighlight(formatted);
  if (!tweet) {
    return await postCTA();
  }

  const posted = await postMarketingTweet(tweet, "stock_screener", "Stock Screener");

  return NextResponse.json({
    message: posted ? "Stock screener tweet posted" : "Stock screener tweet failed",
    posted,
    type: "stock_screener",
  });
}
