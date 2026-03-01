import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchFredSeries } from "@/lib/fred";
import { INDICATOR_DEFINITIONS } from "@/lib/constants";
import { researchIndicatorValue } from "@/lib/serper-research-agent";

export const maxDuration = 300;

const BACKFILL_LIMIT = 90;

// Slugs handled by ADDITIONAL_FRED_INDICATORS with custom transforms — skip in the main INDICATOR_DEFINITIONS loop
const SKIP_FROM_DEFINITIONS = new Set(["ny-fed-recession-prob"]);

const ADDITIONAL_FRED_INDICATORS: {
  slug: string;
  name: string;
  category: string;
  fred_series: string;
  transform?: (value: number) => number;
}[] = [
  { slug: "on-rrp-facility", name: "ON RRP Facility", category: "liquidity", fred_series: "RRPONTSYD" },
  { slug: "dxy-dollar-index", name: "DXY (Dollar Index)", category: "market", fred_series: "DTWEXBGS" },
  { slug: "gdp-growth", name: "GDP Growth (QoQ Annualized)", category: "secondary", fred_series: "A191RL1Q225SBEA" },
  { slug: "credit-spreads", name: "Credit Spreads (HY OAS)", category: "market", fred_series: "BAMLH0A0HYM2", transform: (v) => v * 100 },
  { slug: "vix", name: "VIX Volatility Index", category: "market", fred_series: "VIXCLS" },
  {
    slug: "ny-fed-recession-prob",
    name: "NY Fed Recession Probability",
    category: "primary",
    fred_series: "T10Y3M",
    transform: (spread) => {
      const prob = Math.min(100, Math.max(0, 100 / (1 + Math.exp(0.5 + 3.2 * spread))));
      return Math.round(prob * 10) / 10;
    },
  },
  { slug: "conference-board-lei", name: "Conference Board LEI", category: "primary", fred_series: "USSLIND" },
  { slug: "us-interest-expense", name: "US Interest Expense", category: "liquidity", fred_series: "A091RC1Q027SBEA" },
  { slug: "bank-unrealized-losses", name: "Bank Unrealized Losses", category: "liquidity", fred_series: "QBPBSTLKTEQKTBKEQKCMYAFS" },
];

// Computed FRED indicators that require multiple series joined by date
const COMPUTED_FRED_INDICATORS = [
  {
    slug: "yield-curve-2s30s",
    name: "Yield Curve (2s30s)",
    category: "primary",
    seriesA: "DGS30",
    seriesB: "DGS2",
    compute: (a: number, b: number) => a - b,
  },
];

// Indicators that only exist via agentic web search
const AGENTIC_BACKFILL_INDICATORS = [
  { slug: "nfib-optimism", name: "NFIB Small Business Optimism Index", category: "business_activity", months: 24 },
  { slug: "gdpnow", name: "Atlanta Fed GDPNow", category: "realtime", months: 12 },
  { slug: "jpm-recession-probability", name: "JPMorgan Recession Probability", category: "secondary", months: 12 },
  { slug: "emerging-markets", name: "MSCI Emerging Markets Index (EEM)", category: "market", months: 12 },
  { slug: "copper-gold-ratio", name: "Copper to Gold Ratio", category: "realtime", months: 12 },
  { slug: "silver-gold-ratio", name: "Gold to Silver Ratio", category: "market", months: 12 },
];

function formatDisplayValue(slug: string, rawValue: number): string {
  switch (slug) {
    case "sahm-rule": return rawValue.toFixed(2);
    case "yield-curve-2s10s":
    case "yield-curve-2s30s": return rawValue.toFixed(2);
    case "ism-manufacturing": return `${(rawValue / 1000).toFixed(1)}M`;
    case "initial-claims": return `${(rawValue / 1000).toFixed(0)}K`;
    case "consumer-sentiment":
    case "nfib-optimism": return rawValue.toFixed(1);
    case "unemployment-rate":
    case "fed-funds-rate":
    case "personal-savings-rate":
    case "jolts-quits-rate":
    case "credit-card-delinquency":
    case "debt-service-ratio":
    case "sloos-lending": return `${rawValue.toFixed(1)}%`;
    case "m2-money-supply":
    case "real-personal-income": return `$${(rawValue / 1000).toFixed(1)}T`;
    case "corporate-profits": return `$${(rawValue / 1000).toFixed(1)}T`;
    case "building-permits":
    case "housing-starts":
    case "temp-help-services": return `${rawValue.toFixed(0)}K`;
    case "industrial-production":
    case "freight-index": return rawValue.toFixed(1);
    case "inventory-sales-ratio": return rawValue.toFixed(2);
    case "nfci": return rawValue.toFixed(2);
    case "vix":
    case "dxy-dollar-index": return rawValue.toFixed(1);
    case "on-rrp-facility":
      return rawValue >= 1 ? `$${rawValue.toFixed(0)}B` : `$${Math.round(rawValue * 1000)}M`;
    case "gdp-growth":
    case "gdpnow":
    case "ny-fed-recession-prob": return `${rawValue.toFixed(1)}%`;
    case "credit-spreads": return `${rawValue.toFixed(0)} bps`;
    case "copper-gold-ratio": return rawValue.toFixed(5);
    case "silver-gold-ratio": return rawValue.toFixed(1);
    case "sos-recession": return rawValue.toFixed(2);
    default:
      if (Math.abs(rawValue) >= 10000) return rawValue.toLocaleString("en-US", { maximumFractionDigits: 0 });
      if (Math.abs(rawValue) >= 100) return rawValue.toFixed(1);
      if (Math.abs(rawValue) >= 1) return rawValue.toFixed(2);
      return rawValue.toPrecision(3);
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expectedKey = process.env.CRON_SECRET;
  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const targetSlug = searchParams.get("slug");

  const supabase = createServiceClient();
  const results: { slug: string; series: string; inserted: number; error?: string }[] = [];

  // Backfill INDICATOR_DEFINITIONS (from constants.ts)
  for (const indicator of INDICATOR_DEFINITIONS) {
    if (!indicator.fred_series) continue;
    if (SKIP_FROM_DEFINITIONS.has(indicator.slug)) continue;
    if (targetSlug && indicator.slug !== targetSlug) continue;

    try {
      const observations = await fetchFredSeries(indicator.fred_series, BACKFILL_LIMIT);
      const valid = observations
        .filter((o) => o.value !== ".")
        .map((o) => ({ date: o.date, value: parseFloat(o.value) }))
        .filter((o) => !isNaN(o.value));

      let inserted = 0;
      for (const obs of valid) {
        const evaluation = indicator.evaluate(obs.value);
        const { error } = await supabase.from("indicator_readings").upsert(
          {
            slug: indicator.slug,
            name: indicator.name,
            latest_value: formatDisplayValue(indicator.slug, obs.value),
            numeric_value: obs.value,
            trigger_level: indicator.trigger_description,
            status: evaluation.status,
            status_text: evaluation.signal,
            signal: evaluation.signal,
            signal_emoji: evaluation.signal_emoji,
            category: indicator.category,
            reading_date: obs.date,
          },
          { onConflict: "slug,reading_date" }
        );
        if (!error) inserted++;
      }

      results.push({ slug: indicator.slug, series: indicator.fred_series, inserted });
    } catch (error) {
      results.push({
        slug: indicator.slug,
        series: indicator.fred_series,
        inserted: 0,
        error: error instanceof Error ? error.message : "Unknown",
      });
    }
  }

  // Backfill additional FRED-based indicators
  for (const indicator of ADDITIONAL_FRED_INDICATORS) {
    if (targetSlug && indicator.slug !== targetSlug) continue;
    try {
      const observations = await fetchFredSeries(indicator.fred_series, BACKFILL_LIMIT);
      const valid = observations
        .filter((o) => o.value !== ".")
        .map((o) => {
          let value = parseFloat(o.value);
          if (indicator.transform) value = indicator.transform(value);
          return { date: o.date, value };
        })
        .filter((o) => !isNaN(o.value));

      let inserted = 0;
      for (const obs of valid) {
        const { error } = await supabase.from("indicator_readings").upsert(
          {
            slug: indicator.slug,
            name: indicator.name,
            latest_value: formatDisplayValue(indicator.slug, obs.value),
            numeric_value: obs.value,
            status: "watch",
            status_text: "Historical backfill",
            signal: "Historical backfill",
            signal_emoji: "WATCH",
            category: indicator.category,
            reading_date: obs.date,
          },
          { onConflict: "slug,reading_date" }
        );
        if (!error) inserted++;
      }

      results.push({ slug: indicator.slug, series: indicator.fred_series, inserted });
    } catch (error) {
      results.push({
        slug: indicator.slug,
        series: indicator.fred_series,
        inserted: 0,
        error: error instanceof Error ? error.message : "Unknown",
      });
    }
  }

  // Backfill computed FRED indicators (two series joined by date)
  for (const indicator of COMPUTED_FRED_INDICATORS) {
    if (targetSlug && indicator.slug !== targetSlug) continue;
    try {
      const [seriesA, seriesB] = await Promise.all([
        fetchFredSeries(indicator.seriesA, BACKFILL_LIMIT),
        fetchFredSeries(indicator.seriesB, BACKFILL_LIMIT),
      ]);

      const mapB = new Map<string, number>();
      for (const obs of seriesB) {
        if (obs.value !== ".") mapB.set(obs.date, parseFloat(obs.value));
      }

      let inserted = 0;
      for (const obs of seriesA) {
        if (obs.value === ".") continue;
        const aVal = parseFloat(obs.value);
        const bVal = mapB.get(obs.date);
        if (isNaN(aVal) || bVal === undefined || isNaN(bVal)) continue;

        const computed = indicator.compute(aVal, bVal);
        if (isNaN(computed)) continue;

        const { error } = await supabase.from("indicator_readings").upsert(
          {
            slug: indicator.slug,
            name: indicator.name,
            latest_value: formatDisplayValue(indicator.slug, computed),
            numeric_value: computed,
            status: "watch",
            status_text: "Historical backfill",
            signal: "Historical backfill",
            signal_emoji: "WATCH",
            category: indicator.category,
            reading_date: obs.date,
          },
          { onConflict: "slug,reading_date" }
        );
        if (!error) inserted++;
      }

      results.push({ slug: indicator.slug, series: `${indicator.seriesA}/${indicator.seriesB}`, inserted });
    } catch (error) {
      results.push({
        slug: indicator.slug,
        series: `${indicator.seriesA}/${indicator.seriesB}`,
        inserted: 0,
        error: error instanceof Error ? error.message : "Unknown",
      });
    }
  }

  // Agentic backfill for indicators without FRED series
  for (const indicator of AGENTIC_BACKFILL_INDICATORS) {
    if (targetSlug && indicator.slug !== targetSlug) continue;
    let inserted = 0;
    const errors: string[] = [];

    const now = new Date();
    for (let i = 0; i < indicator.months; i++) {
      const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = target.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const dateStr = target.toISOString().split("T")[0];

      try {
        const result = await researchIndicatorValue(indicator.slug, indicator.name, monthLabel);
        if (!result) {
          errors.push(`${monthLabel}: no result`);
          continue;
        }

        const readingDate = result.date || dateStr;
        const { error } = await supabase.from("indicator_readings").upsert(
          {
            slug: indicator.slug,
            name: indicator.name,
            latest_value: formatDisplayValue(indicator.slug, result.value),
            numeric_value: result.value,
            status: "watch",
            status_text: `Backfill (${result.confidence})`,
            signal: `Backfill via Serper (${result.confidence})`,
            signal_emoji: "WATCH",
            category: indicator.category,
            reading_date: readingDate,
          },
          { onConflict: "slug,reading_date" }
        );
        if (!error) inserted++;
      } catch (err) {
        errors.push(`${monthLabel}: ${err instanceof Error ? err.message : "Unknown"}`);
      }
    }

    results.push({
      slug: indicator.slug,
      series: "serper-agent",
      inserted,
      error: errors.length > 0 ? `${errors.length} months failed` : undefined,
    });
  }

  const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
  const totalFailed = results.filter((r) => r.error).length;

  return NextResponse.json({
    message: `Backfill complete: ${totalInserted} readings inserted across ${results.length} indicators (${totalFailed} errors)`,
    results,
  });
}
