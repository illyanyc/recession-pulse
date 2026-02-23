import { Badge } from "@/components/ui/Badge";
import { INDICATOR_DEFINITIONS, TOTAL_INDICATORS } from "@/lib/constants";
import { createServiceClient } from "@/lib/supabase/server";
import type { IndicatorCategory, IndicatorStatus } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { Lock } from "lucide-react";
import Link from "next/link";

interface IndicatorRow {
  name: string;
  value: string;
  trigger: string;
  status: IndicatorStatus;
  statusText: string;
  signal: string;
  slug: string;
  category: IndicatorCategory;
}

const FALLBACK_INDICATORS: IndicatorRow[] = [
  // Primary
  { slug: "sahm-rule", name: "Sahm Rule", value: "0.30", trigger: ">=0.50 triggers", status: "safe", statusText: "NOT triggered", signal: "Declining from 0.57 peak", category: "primary" },
  { slug: "unemployment-rate", name: "Unemployment Rate", value: "4.0%", trigger: ">0.5% from low", status: "watch", statusText: "Ticking up", signal: "Above cycle trough", category: "primary" },
  { slug: "industrial-production", name: "Industrial Production", value: "102.1", trigger: "Declining", status: "safe", statusText: "Expanding", signal: "Production stable", category: "primary" },
  { slug: "jolts-quits-rate", name: "JOLTS Quits Rate", value: "2.1%", trigger: "<2.0%", status: "watch", statusText: "Below avg", signal: "Workers cautious", category: "primary" },
  { slug: "temp-help-services", name: "Temp Help Services", value: "2.85M", trigger: "Declining", status: "warning", statusText: "Falling", signal: "12-month decline", category: "primary" },
  { slug: "sos-recession", name: "SOS Recession Indicator", value: "1.1%", trigger: "+0.2pp rise", status: "safe", statusText: "Below trigger", signal: "Claims stable", category: "primary" },
  { slug: "real-personal-income", name: "Real Personal Income", value: "$16.8T", trigger: "Declining", status: "watch", statusText: "Monitor", signal: "Track organic income trend", category: "primary" },
  // Secondary
  { slug: "ism-manufacturing", name: "ISM Manufacturing PMI", value: "48.5", trigger: "Sub-50", status: "warning", statusText: "Contraction", signal: "9th month below 50", category: "secondary" },
  { slug: "consumer-sentiment", name: "Consumer Sentiment", value: "64.7", trigger: "<60", status: "watch", statusText: "Below avg", signal: "Weak confidence", category: "secondary" },
  { slug: "initial-claims", name: "Initial Jobless Claims", value: "215K", trigger: ">300K", status: "safe", statusText: "Healthy", signal: "Labor market holding", category: "secondary" },
  { slug: "fed-funds-rate", name: "Fed Funds Rate", value: "4.33%", trigger: "Cuts after hikes", status: "watch", statusText: "Elevated", signal: "Monitoring for cuts", category: "secondary" },
  // Housing
  { slug: "building-permits", name: "Building Permits", value: "1.47M", trigger: "Declining", status: "watch", statusText: "Slowing", signal: "Down from 1.6M peak", category: "housing" },
  { slug: "housing-starts", name: "Housing Starts", value: "1.35M", trigger: "Declining", status: "watch", statusText: "Below trend", signal: "Rate-sensitive", category: "housing" },
  // Business Activity
  { slug: "corporate-profits", name: "Corporate Profits", value: "$2.9T", trigger: "Declining", status: "watch", statusText: "Moderate", signal: "Growth slowing", category: "business_activity" },
  { slug: "nfib-optimism", name: "NFIB Small Business", value: "93.7", trigger: "<93", status: "watch", statusText: "Below avg", signal: "Below 52yr average", category: "business_activity" },
  { slug: "inventory-sales-ratio", name: "Inventory/Sales Ratio", value: "1.37", trigger: ">1.4", status: "watch", statusText: "Elevated", signal: "Slightly above trend", category: "business_activity" },
  // Credit Stress
  { slug: "credit-card-delinquency", name: "CC Delinquency Rate", value: "3.9%", trigger: ">4%", status: "warning", statusText: "Near GFC", signal: "Highest since 2011", category: "credit_stress" },
  { slug: "personal-savings-rate", name: "Savings Rate", value: "4.1%", trigger: "<4%", status: "warning", statusText: "Very low", signal: "No consumer buffer", category: "credit_stress" },
  { slug: "sloos-lending", name: "SLOOS Lending", value: "15.4%", trigger: ">20% tight", status: "watch", statusText: "Tightening", signal: "Banks cautious", category: "credit_stress" },
  { slug: "debt-service-ratio", name: "Debt Service Ratio", value: "11.4%", trigger: ">13%", status: "watch", statusText: "Moderate", signal: "Rising with rates", category: "credit_stress" },
  // Market
  { slug: "yield-curve-2s10s", name: "Yield Curve 2s10s", value: "+70 bps", trigger: "Inversion", status: "watch", statusText: "Un-inverted", signal: "Post-inversion watch", category: "market" },
  { slug: "vix", name: "VIX", value: "16.2", trigger: ">30", status: "safe", statusText: "Normal", signal: "Low volatility", category: "market" },
  { slug: "nfci", name: "Chicago Fed NFCI", value: "-0.32", trigger: ">0", status: "safe", statusText: "Loose", signal: "Accommodative conditions", category: "market" },
  { slug: "copper-gold-ratio", name: "Copper/Gold Ratio", value: "0.00077", trigger: "Falling", status: "danger", statusText: "Below 2008", signal: "Deep fear signal", category: "market" },
  { slug: "ny-fed-recession-prob", name: "NY Fed Recession Prob", value: "~55%", trigger: ">50%", status: "warning", statusText: "Elevated", signal: "Spread-based model", category: "market" },
  // Liquidity
  { slug: "m2-money-supply", name: "M2 Money Supply", value: "$21.2T", trigger: "YoY decline", status: "watch", statusText: "Monitor", signal: "YoY growth rate key", category: "liquidity" },
  // Realtime
  { slug: "freight-index", name: "Freight Index", value: "118.2", trigger: "Declining", status: "watch", statusText: "Moderate", signal: "Freight mixed", category: "realtime" },
  { slug: "gdpnow", name: "GDPNow", value: "2.1%", trigger: "<0%", status: "watch", statusText: "Slowing", signal: "Down from 2.8%", category: "realtime" },
];

const FREE_SLUGS = new Set(["sahm-rule", "yield-curve-2s10s", "vix"]);

async function fetchLiveIndicators(): Promise<IndicatorRow[] | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, trigger_level, status, status_text, signal, reading_date, category")
      .order("reading_date", { ascending: false })
      .limit(100);

    if (!data || data.length === 0) return null;

    const bySlug = new Map<string, typeof data[0]>();
    for (const row of data) {
      if (!bySlug.has(row.slug)) bySlug.set(row.slug, row);
    }

    if (bySlug.size === 0) return null;

    return Array.from(bySlug.values()).map((r) => ({
      slug: r.slug,
      name: r.name,
      value: r.latest_value,
      trigger: r.trigger_level || "",
      status: r.status as IndicatorStatus,
      statusText: r.status_text || r.status,
      signal: r.signal,
      category: (r.category || "primary") as IndicatorCategory,
    }));
  } catch {
    return null;
  }
}

const CATEGORY_DISPLAY_ORDER: IndicatorCategory[] = [
  "primary",
  "secondary",
  "housing",
  "business_activity",
  "credit_stress",
  "market",
  "liquidity",
  "realtime",
];

export async function Indicators() {
  const live = await fetchLiveIndicators();
  const indicators = live && live.length > 0 ? live : FALLBACK_INDICATORS;
  const isLive = live !== null && live.length > 0;

  const grouped = CATEGORY_DISPLAY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: indicators.filter((ind) => ind.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <section id="indicators" className="py-24 bg-pulse-dark/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {TOTAL_INDICATORS} indicators. <span className="gradient-text">Real-time signals.</span>
          </h2>
          <p className="text-pulse-muted text-lg max-w-2xl mx-auto">
            {isLive
              ? "Live data from FRED, Treasury, and financial APIs — updated daily."
              : `${INDICATOR_DEFINITIONS.length} indicators across ${CATEGORY_DISPLAY_ORDER.length} categories. Here\u2019s what you get — free.`}
          </p>
        </div>

        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-pulse-green uppercase tracking-wider mb-3 px-4">
                {group.label}
              </h3>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-pulse-border">
                      <th className="text-left py-2 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">Indicator</th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">Latest</th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">Trigger</th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">Status</th>
                      <th className="text-left py-2 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((ind) => {
                      const isFree = FREE_SLUGS.has(ind.slug);
                      return (
                        <tr
                          key={ind.slug}
                          className="border-b border-pulse-border/50 hover:bg-pulse-card/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white text-sm">{ind.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            {isFree ? (
                              <span className="font-mono text-sm text-pulse-text">{ind.value}</span>
                            ) : (
                              <span className="font-mono text-sm text-pulse-muted/60 blur-[5px] select-none" aria-hidden="true">
                                {ind.value}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isFree ? (
                              <span className="text-xs text-pulse-muted">{ind.trigger}</span>
                            ) : (
                              <span className="text-xs text-pulse-muted/60 blur-[5px] select-none" aria-hidden="true">{ind.trigger}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isFree ? (
                              <Badge status={ind.status} pulse={ind.status === "danger"}>
                                {ind.statusText}
                              </Badge>
                            ) : (
                              <span className="blur-[5px] select-none" aria-hidden="true">
                                <Badge status={ind.status} pulse={false}>
                                  {ind.statusText}
                                </Badge>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isFree ? (
                              <span className="text-xs text-pulse-muted">{ind.signal}</span>
                            ) : (
                              <span className="text-xs text-pulse-muted/60 blur-[5px] select-none" aria-hidden="true">
                                {ind.signal}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 rounded-xl border border-pulse-green/20 bg-pulse-green/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-pulse-green shrink-0" />
            <p className="text-sm text-pulse-text">
              <span className="font-semibold text-white">Sign up free</span> to access all {TOTAL_INDICATORS} indicator values and signals.
              Upgrade for daily SMS & email alerts.
            </p>
          </div>
          <Link
            href="/signup"
            className="shrink-0 px-6 py-2.5 rounded-lg bg-pulse-green text-black font-semibold text-sm hover:bg-pulse-green/90 transition-colors"
          >
            Get Free Access
          </Link>
        </div>
      </div>
    </section>
  );
}
