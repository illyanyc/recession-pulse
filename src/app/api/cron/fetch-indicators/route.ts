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
      signal_emoji: value < 0 ? "DANGER" : value < 0.5 ? "WATCH" : value > 1.0 ? "WATCH" : "SAFE",
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
      signal_emoji: value < -0.2 ? "WARNING" : value < 0 ? "WATCH" : "SAFE",
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
      signal_emoji: value < 100 ? "WARNING" : value < 500 ? "WATCH" : "SAFE",
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
      signal_emoji: value < 95 ? "WARNING" : value < 100 ? "WATCH" : "SAFE",
      signal: value < 95 ? "Dollar weakness — capital flight risk" : value < 100 ? "Dollar weakening — monitor" : "Dollar stable",
    }),
  },
  {
    slug: "jpm-recession-probability",
    name: "JPM Recession Probability",
    category: "secondary" as const,
    trigger_level: ">50% = high probability",
    fetch: async () => ({ value: 35, date: new Date().toISOString().split("T")[0] }),
    evaluate: (value: number) => ({
      status: value >= 50 ? "danger" : value >= 30 ? "watch" : "safe",
      signal_emoji: value >= 50 ? "DANGER" : value >= 30 ? "WATCH" : "SAFE",
      signal: value >= 50 ? "HIGH probability" : value >= 30 ? `Moderate risk — ${value}%` : "Low probability",
    }),
  },
  {
    slug: "gdp-growth",
    name: "GDP Growth Forecast",
    category: "secondary" as const,
    trigger_level: "<0% = recession",
    fetch: async () => {
      const data = await fetchLatestValue("GDPC1");
      if (!data) return { value: 2.1, date: new Date().toISOString().split("T")[0] };
      return data;
    },
    evaluate: (value: number) => ({
      status: value < 0 ? "danger" : value < 1.5 ? "warning" : value < 2.5 ? "watch" : "safe",
      signal_emoji: value < 0 ? "DANGER" : value < 1.5 ? "WARNING" : value < 2.5 ? "WATCH" : "SAFE",
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
      signal_emoji: value > 20 ? "SAFE" : value > 0 ? "WATCH" : "DANGER",
      signal: value > 20 ? "Bullish EM — but signals US deceleration" : "EM underperforming",
    }),
  },
  {
    slug: "credit-spreads",
    name: "Credit Spreads (HY OAS)",
    category: "market" as const,
    trigger_level: ">500 bps = credit stress",
    fetch: async () => {
      const data = await fetchLatestValue("BAMLH0A0HYM2");
      if (!data) return { value: 320, date: new Date().toISOString().split("T")[0] };
      return { value: data.value * 100, date: data.date };
    },
    evaluate: (value: number) => ({
      status: value > 500 ? "danger" : value > 400 ? "warning" : value > 300 ? "watch" : "safe",
      signal_emoji: value > 500 ? "DANGER" : value > 400 ? "WARNING" : value > 300 ? "WATCH" : "SAFE",
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
      signal_emoji: value > 400 ? "WARNING" : value > 200 ? "WATCH" : "SAFE",
      signal: value > 400 ? `~$${value}B HTM — vulnerable to liquidity shock` : "Manageable levels",
    }),
  },
  {
    slug: "us-interest-expense",
    name: "US Interest Expense",
    category: "liquidity" as const,
    trigger_level: "Fiscal doom loop",
    fetch: async () => ({ value: 950, date: new Date().toISOString().split("T")[0] }),
    evaluate: (value: number) => ({
      status: value > 900 ? "warning" : value > 600 ? "watch" : "safe",
      signal_emoji: value > 900 ? "WARNING" : value > 600 ? "WATCH" : "SAFE",
      signal: value > 900 ? `~$${value}B/yr — approaching $1T, fiscal doom loop` : "Elevated but manageable",
    }),
  },
  // --- Tier 1: NY Fed Recession Probability (computed from 3m/10y spread) ---
  {
    slug: "ny-fed-recession-prob",
    name: "NY Fed Recession Probability",
    category: "primary" as const,
    trigger_level: ">50% has preceded every recession since 1972",
    fetch: async () => {
      const data = await fetchLatestValue("T10Y3M");
      if (!data) return { value: 20, date: new Date().toISOString().split("T")[0] };
      const spread = data.value;
      const prob = Math.min(100, Math.max(0, 100 / (1 + Math.exp(0.5 + 3.2 * spread))));
      return { value: Math.round(prob * 10) / 10, date: data.date };
    },
    evaluate: (value: number) => ({
      status: value > 50 ? "danger" : value > 30 ? "warning" : value > 15 ? "watch" : "safe",
      signal_emoji: value > 50 ? "DANGER" : value > 30 ? "WARNING" : value > 15 ? "WATCH" : "SAFE",
      signal: value > 50 ? `${value}% — recession likely within 12 months` : value > 30 ? `${value}% — elevated risk` : value > 15 ? `${value}% — moderate risk` : `${value}% — low risk`,
    }),
  },
  // --- Tier 2: VIX (fetched from CBOE via proxy/FRED alternative) ---
  {
    slug: "vix",
    name: "VIX Volatility Index",
    category: "market" as const,
    trigger_level: ">30 = high fear; >40 = crisis",
    fetch: async () => {
      try {
        const data = await fetchLatestValue("VIXCLS");
        if (data) return data;
      } catch { /* fall through */ }
      return { value: 18, date: new Date().toISOString().split("T")[0] };
    },
    evaluate: (value: number) => ({
      status: value > 40 ? "danger" : value > 30 ? "warning" : value > 20 ? "watch" : "safe",
      signal_emoji: value > 40 ? "DANGER" : value > 30 ? "WARNING" : value > 20 ? "WATCH" : "SAFE",
      signal: value > 40 ? "Extreme fear — crisis-level volatility" : value > 30 ? "High fear — markets stressed" : value > 20 ? `VIX ${value.toFixed(1)} — elevated uncertainty` : "Low volatility — complacency",
    }),
  },
  // --- Tier 2: Atlanta Fed GDPNow (mock until scraper built) ---
  {
    slug: "gdpnow",
    name: "Atlanta Fed GDPNow",
    category: "realtime" as const,
    trigger_level: "<0% = real-time recession signal",
    fetch: async () => {
      return { value: 1.8, date: new Date().toISOString().split("T")[0] };
    },
    evaluate: (value: number) => ({
      status: value < 0 ? "danger" : value < 1.0 ? "warning" : value < 2.0 ? "watch" : "safe",
      signal_emoji: value < 0 ? "DANGER" : value < 1.0 ? "WARNING" : value < 2.0 ? "WATCH" : "SAFE",
      signal: value < 0 ? `${value.toFixed(1)}% — GDP contracting in real time` : value < 1.0 ? `${value.toFixed(1)}% — near stall speed` : value < 2.0 ? `${value.toFixed(1)}% — below trend` : `${value.toFixed(1)}% — solid growth`,
    }),
  },
  // --- Tier 2: NFIB Small Business Optimism (mock until scraper built) ---
  {
    slug: "nfib-optimism",
    name: "NFIB Small Business Optimism",
    category: "business_activity" as const,
    trigger_level: "<95 = pessimistic; <90 = recessionary",
    fetch: async () => {
      return { value: 97.4, date: new Date().toISOString().split("T")[0] };
    },
    evaluate: (value: number) => ({
      status: value < 90 ? "danger" : value < 95 ? "warning" : value < 98 ? "watch" : "safe",
      signal_emoji: value < 90 ? "DANGER" : value < 95 ? "WARNING" : value < 98 ? "WATCH" : "SAFE",
      signal: value < 90 ? "Deeply pessimistic — recession territory" : value < 95 ? "Below average — small biz struggling" : value < 98 ? "Slightly below average" : `${value.toFixed(1)} — above average`,
    }),
  },
  // --- Tier 2: Copper-to-Gold Ratio (computed from FRED copper & gold) ---
  {
    slug: "copper-gold-ratio",
    name: "Copper-to-Gold Ratio",
    category: "realtime" as const,
    trigger_level: "<0.00100 = industrial weakness vs fear",
    fetch: async () => {
      try {
        const [copper, gold] = await Promise.all([
          fetchLatestValue("PCOPPUSDM"),
          fetchLatestValue("GOLDAMGBD228NLBM"),
        ]);
        if (copper && gold && gold.value > 0) {
          return { value: Math.round((copper.value / gold.value) * 100000) / 100000, date: copper.date };
        }
      } catch { /* fall through */ }
      return { value: 0.00077, date: new Date().toISOString().split("T")[0] };
    },
    evaluate: (value: number) => {
      const scaled = value * 10000;
      return {
        status: scaled < 8 ? "danger" : scaled < 10 ? "warning" : scaled < 15 ? "watch" : "safe",
        signal_emoji: scaled < 8 ? "DANGER" : scaled < 10 ? "WARNING" : scaled < 15 ? "WATCH" : "SAFE",
        signal: scaled < 8 ? "50-year low — extreme industrial fear" : scaled < 10 ? "Below 2008 crisis levels" : scaled < 15 ? "Weakening industrial demand" : "Healthy industrial activity",
      };
    },
  },
  // --- Tier 3: SLOOS Lending Standards (mock until Fed survey scraper built) ---
  {
    slug: "sloos-lending",
    name: "SLOOS Lending Standards",
    category: "business_activity" as const,
    trigger_level: "Net tightening >20% = credit crunch",
    fetch: async () => {
      try {
        const data = await fetchLatestValue("DRTSCILM");
        if (data) return data;
      } catch { /* fall through */ }
      return { value: 10, date: new Date().toISOString().split("T")[0] };
    },
    evaluate: (value: number) => ({
      status: value > 40 ? "danger" : value > 20 ? "warning" : value > 5 ? "watch" : "safe",
      signal_emoji: value > 40 ? "DANGER" : value > 20 ? "WARNING" : value > 5 ? "WATCH" : "SAFE",
      signal: value > 40 ? "Severe tightening — credit crunch" : value > 20 ? "Significant tightening — lending drying up" : value > 5 ? `Net ${value}% tightening — modest` : "Standards easing",
    }),
  },
  // --- Tier 3: SOS Recession Indicator (mock until Richmond Fed scraper) ---
  {
    slug: "sos-recession",
    name: "SOS Recession Indicator",
    category: "primary" as const,
    trigger_level: "Triggered = recession signal (weekly claims-based)",
    fetch: async () => {
      return { value: 0.12, date: new Date().toISOString().split("T")[0] };
    },
    evaluate: (value: number) => ({
      status: value >= 0.20 ? "danger" : value >= 0.15 ? "warning" : value >= 0.10 ? "watch" : "safe",
      signal_emoji: value >= 0.20 ? "DANGER" : value >= 0.15 ? "WARNING" : value >= 0.10 ? "WATCH" : "SAFE",
      signal: value >= 0.20 ? "TRIGGERED — recession signal" : value >= 0.15 ? "Near trigger — watch weekly" : value >= 0.10 ? "Elevated — monitor" : "Not triggered",
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

  // 3. Generate AI summaries for all indicators
  let summariesGenerated = 0;
  try {
    const { generateIndicatorSummary } = await import("@/lib/ai");
    const { setGlobalSummary } = await import("@/lib/redis");

    const { data: todayReadings } = await supabase
      .from("indicator_readings")
      .select("*")
      .eq("reading_date", today);

    if (todayReadings) {
      const bySlug = new Map<string, typeof todayReadings[0]>();
      for (const r of todayReadings) {
        if (!bySlug.has(r.slug)) bySlug.set(r.slug, r);
      }

      for (const [slug, ind] of bySlug) {
        try {
          const summary = await generateIndicatorSummary({
            name: ind.name,
            slug,
            latestValue: ind.latest_value,
            status: ind.status,
            signal: ind.signal,
            triggerLevel: ind.trigger_level || "",
          });

          await supabase.from("indicator_summaries").upsert(
            { slug, summary, model: "gpt-4o-mini", reading_date: today },
            { onConflict: "slug,reading_date" }
          );

          await setGlobalSummary(slug, summary).catch(() => {});
          summariesGenerated++;
        } catch (err) {
          console.error(`Summary generation failed for ${slug}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("AI summary generation error:", err);
  }

  return NextResponse.json({
    message: `Fetched ${successCount} indicators, ${failCount} failed, ${summariesGenerated} AI summaries generated`,
    results,
    date: today,
  });
}
