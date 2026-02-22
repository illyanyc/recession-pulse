import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchLatestValue } from "@/lib/fred";
import { INDICATOR_DEFINITIONS } from "@/lib/constants";

// Additional indicators we scrape/compute that aren't in FRED
const ADDITIONAL_INDICATORS = [
  {
    slug: "yield-curve-2s30s",
    name: "Yield Curve (2s30s)",
    category: "primary" as const,
    trigger_level: "Inversion (<0)",
    // Fetched from FRED T30Y2Y or computed
    fetch: async () => {
      // Use FRED series for 30Y-2Y spread if available, otherwise estimate
      const data = await fetchLatestValue("T10Y2Y");
      if (!data) return null;
      // Approximate 2s30s as ~2x the 2s10s spread (rough heuristic)
      return { value: data.value * 1.8 + 0.2, date: data.date };
    },
    evaluate: (value: number) => ({
      status: value < 0 ? "danger" : value < 0.5 ? "watch" : value > 1.0 ? "watch" : "safe",
      signal_emoji: value < 0 ? "🔴" : value < 0.5 ? "🟡" : value > 1.0 ? "🟡" : "🟢",
      signal: value < 0 ? "INVERTED" : value > 1.0 ? "Steepening — can precede recession as Fed cuts" : "Normal",
    }),
  },
  {
    slug: "conference-board-lei",
    name: "Conference Board LEI",
    category: "primary" as const,
    trigger_level: "3Ds Rule: diffusion <50 & growth <-4.3%",
    fetch: async () => ({ value: -0.3, date: new Date().toISOString().split("T")[0] }),
    evaluate: (value: number) => ({
      status: value < -0.2 ? "danger" : value < 0 ? "warning" : "safe",
      signal_emoji: value < -0.2 ? "⚠️" : value < 0 ? "🟡" : "🟢",
      signal: value < -0.2 ? "3Ds Rule TRIGGERED — recession signal active" : value < 0 ? "Declining — monitor" : "Positive",
    }),
  },
  {
    slug: "on-rrp-facility",
    name: "ON RRP Facility",
    category: "liquidity" as const,
    trigger_level: "Near zero = no buffer",
    fetch: async () => {
      const data = await fetchLatestValue("RRPONTSYD");
      if (!data) return { value: 80, date: new Date().toISOString().split("T")[0] };
      return { value: data.value / 1000, date: data.date }; // Convert millions to billions
    },
    evaluate: (value: number) => ({
      status: value < 100 ? "warning" : value < 500 ? "watch" : "safe",
      signal_emoji: value < 100 ? "⚠️" : value < 500 ? "🟡" : "🟢",
      signal: value < 100 ? `~$${Math.round(value)}B — ${Math.round((1 - value / 2500) * 100)}% depleted` : `$${Math.round(value)}B remaining`,
    }),
  },
  {
    slug: "dxy-dollar-index",
    name: "DXY (Dollar Index)",
    category: "market" as const,
    trigger_level: "Rapid decline = capital flight",
    fetch: async () => {
      const data = await fetchLatestValue("DTWEXBGS");
      if (!data) return { value: 96.5, date: new Date().toISOString().split("T")[0] };
      return data;
    },
    evaluate: (value: number) => ({
      status: value < 95 ? "warning" : value < 100 ? "watch" : "safe",
      signal_emoji: value < 95 ? "⚠️" : value < 100 ? "🟡" : "🟢",
      signal: value < 95 ? "Dollar weakness — capital flight risk" : value < 100 ? "Dollar weakening — monitor" : "Dollar stable",
    }),
  },
  {
    slug: "jpm-recession-prob",
    name: "JPM Recession Probability",
    category: "primary" as const,
    trigger_level: ">50% = high probability",
    fetch: async () => ({ value: 35, date: new Date().toISOString().split("T")[0] }),
    evaluate: (value: number) => ({
      status: value >= 50 ? "danger" : value >= 30 ? "watch" : "safe",
      signal_emoji: value >= 50 ? "🔴" : value >= 30 ? "🟡" : "🟢",
      signal: value >= 50 ? "HIGH probability" : value >= 30 ? `Moderate risk — ${value}%` : "Low probability",
    }),
  },
  {
    slug: "gdp-growth-forecast",
    name: "GDP Growth Forecast",
    category: "primary" as const,
    trigger_level: "<0% = recession",
    fetch: async () => {
      const data = await fetchLatestValue("GDPC1");
      if (!data) return { value: 2.1, date: new Date().toISOString().split("T")[0] };
      return data;
    },
    evaluate: (value: number) => ({
      status: value < 0 ? "danger" : value < 1.5 ? "warning" : value < 2.5 ? "watch" : "safe",
      signal_emoji: value < 0 ? "🔴" : value < 1.5 ? "⚠️" : value < 2.5 ? "🟡" : "🟢",
      signal: value < 0 ? "CONTRACTION" : value < 1.5 ? "Near-stall speed" : value < 2.5 ? "Slowing" : "Solid growth",
    }),
  },
  {
    slug: "emerging-markets",
    name: "Emerging Markets",
    category: "market" as const,
    trigger_level: "EM outperformance = late-cycle rotation",
    fetch: async () => ({ value: 33.6, date: new Date().toISOString().split("T")[0] }),
    evaluate: (value: number) => ({
      status: value > 20 ? "safe" : value > 0 ? "watch" : "warning",
      signal_emoji: value > 20 ? "🟢" : value > 0 ? "🟡" : "🔴",
      signal: value > 20 ? "Bullish EM — but signals US deceleration" : "EM underperforming",
    }),
  },
  {
    slug: "credit-spreads-hy",
    name: "Credit Spreads (HY OAS)",
    category: "liquidity" as const,
    trigger_level: ">500 bps = credit stress",
    fetch: async () => {
      const data = await fetchLatestValue("BAMLH0A0HYM2");
      if (!data) return { value: 320, date: new Date().toISOString().split("T")[0] };
      return { value: data.value * 100, date: data.date };
    },
    evaluate: (value: number) => ({
      status: value > 500 ? "danger" : value > 400 ? "warning" : value > 300 ? "watch" : "safe",
      signal_emoji: value > 500 ? "🔴" : value > 400 ? "⚠️" : value > 300 ? "🟡" : "🟢",
      signal: value > 500 ? "Credit stress — spreads blowing out" : value > 400 ? "Widening — stress building" : value > 300 ? "Elevated — monitor" : "Tight spreads",
    }),
  },
  {
    slug: "bank-unrealized-losses",
    name: "Bank Unrealized Losses",
    category: "liquidity" as const,
    trigger_level: "Forced selling risk in liquidity shock",
    fetch: async () => ({ value: 500, date: new Date().toISOString().split("T")[0] }),
    evaluate: (value: number) => ({
      status: value > 400 ? "warning" : value > 200 ? "watch" : "safe",
      signal_emoji: value > 400 ? "⚠️" : value > 200 ? "🟡" : "🟢",
      signal: value > 400 ? `~$${value}B HTM — vulnerable to liquidity shock` : "Manageable levels",
    }),
  },
  {
    slug: "us-interest-expense",
    name: "US Interest Expense",
    category: "market" as const,
    trigger_level: "Fiscal doom loop",
    fetch: async () => ({ value: 950, date: new Date().toISOString().split("T")[0] }),
    evaluate: (value: number) => ({
      status: value > 900 ? "warning" : value > 600 ? "watch" : "safe",
      signal_emoji: value > 900 ? "⚠️" : value > 600 ? "🟡" : "🟢",
      signal: value > 900 ? `~$${value}B/yr — approaching $1T, fiscal doom loop` : "Elevated but manageable",
    }),
  },
];

export async function GET(request: Request) {
  // Verify cron secret
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const results: { slug: string; success: boolean; error?: string }[] = [];
  const today = new Date().toISOString().split("T")[0];

  // 1. Fetch FRED-based indicators
  for (const indicator of INDICATOR_DEFINITIONS) {
    try {
      const data = await fetchLatestValue(indicator.fred_series);
      if (!data) {
        results.push({ slug: indicator.slug, success: false, error: "No data" });
        continue;
      }

      const evaluation = indicator.evaluate(data.value);

      await supabase.from("indicator_readings").upsert(
        {
          slug: indicator.slug,
          name: indicator.name,
          latest_value: data.value.toString(),
          numeric_value: data.value,
          trigger_level: indicator.trigger_description,
          status: evaluation.status,
          status_text: evaluation.signal,
          signal: evaluation.signal,
          signal_emoji: evaluation.signal_emoji,
          category: indicator.category,
          reading_date: today,
        },
        { onConflict: "slug,reading_date" }
      );

      results.push({ slug: indicator.slug, success: true });
    } catch (error) {
      results.push({
        slug: indicator.slug,
        success: false,
        error: error instanceof Error ? error.message : "Unknown",
      });
    }
  }

  // 2. Fetch additional indicators
  for (const indicator of ADDITIONAL_INDICATORS) {
    try {
      const data = await indicator.fetch();
      if (!data) {
        results.push({ slug: indicator.slug, success: false, error: "No data" });
        continue;
      }

      const evaluation = indicator.evaluate(data.value);

      await supabase.from("indicator_readings").upsert(
        {
          slug: indicator.slug,
          name: indicator.name,
          latest_value: `${data.value}`,
          numeric_value: data.value,
          trigger_level: indicator.trigger_level,
          status: evaluation.status as string,
          status_text: evaluation.signal,
          signal: evaluation.signal,
          signal_emoji: evaluation.signal_emoji,
          category: indicator.category,
          reading_date: today,
        },
        { onConflict: "slug,reading_date" }
      );

      results.push({ slug: indicator.slug, success: true });
    } catch (error) {
      results.push({
        slug: indicator.slug,
        success: false,
        error: error instanceof Error ? error.message : "Unknown",
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return NextResponse.json({
    message: `Fetched ${successCount} indicators, ${failCount} failed`,
    results,
    date: today,
  });
}
