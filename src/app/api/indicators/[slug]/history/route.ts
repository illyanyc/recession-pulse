import { createClient } from "@/lib/supabase/server";
import { fetchFredSeries } from "@/lib/fred";
import { NextResponse } from "next/server";

const SLUG_TO_FRED: Record<string, string> = {
  "sahm-rule": "SAHMCURRENT",
  "yield-curve-2s10s": "T10Y2Y",
  "yield-curve-2s30s": "T10Y2Y",
  "ism-manufacturing": "MANEMP",
  "initial-claims": "ICSA",
  "consumer-sentiment": "UMCSENT",
  "fed-funds-rate": "FEDFUNDS",
  "m2-money-supply": "M2SL",
  "unemployment-rate": "UNRATE",
  "on-rrp-facility": "RRPONTSYD",
  "dxy-dollar-index": "DTWEXBGS",
  "credit-spreads-hy": "BAMLH0A0HYM2",
  "gdp-growth-forecast": "GDPC1",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fredSeries = SLUG_TO_FRED[slug];

  if (fredSeries) {
    try {
      const observations = await fetchFredSeries(fredSeries, 30);
      const history = observations
        .filter((o) => o.value !== ".")
        .map((o) => ({ date: o.date, value: parseFloat(o.value) }))
        .filter((o) => !isNaN(o.value))
        .reverse();

      return NextResponse.json({ slug, source: "fred", history });
    } catch {
      // Fall through to Supabase history
    }
  }

  // Fallback: pull from indicator_readings table
  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = createServiceClient();

  const { data: readings } = await service
    .from("indicator_readings")
    .select("reading_date, numeric_value")
    .eq("slug", slug)
    .order("reading_date", { ascending: true })
    .limit(30);

  const history = (readings || [])
    .filter((r) => r.numeric_value !== null)
    .map((r) => ({ date: r.reading_date, value: r.numeric_value }));

  return NextResponse.json({ slug, source: "supabase", history });
}
