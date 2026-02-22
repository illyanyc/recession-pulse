import { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { INDICATORS_SEO, ALL_INDICATOR_SLUGS } from "@/lib/indicators-metadata";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TrendingDown, TrendingUp, Minus, ArrowRight, Activity } from "lucide-react";
import type { IndicatorStatus } from "@/types";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Recession Indicators — Live Economic Dashboard",
  description:
    "Track 15+ recession indicators in real time: Sahm Rule, yield curve, credit spreads, ISM PMI, consumer sentiment, and more. Updated daily with AI analysis.",
  keywords: [
    "recession indicators",
    "recession tracker",
    "economic indicators dashboard",
    "recession probability 2026",
    "is a recession coming",
    "live recession indicators",
  ],
  openGraph: {
    title: "Live Recession Indicators Dashboard — RecessionPulse",
    description:
      "15+ recession indicators tracked daily. Sahm Rule, yield curve, credit spreads, PMI, and more.",
    url: "https://recessionpulse.com/indicators",
  },
  alternates: { canonical: "https://recessionpulse.com/indicators" },
};

function TrendIcon({ status }: { status: IndicatorStatus }) {
  if (status === "safe") return <TrendingUp className="h-4 w-4 text-pulse-green" />;
  if (status === "danger" || status === "warning")
    return <TrendingDown className="h-4 w-4 text-pulse-red" />;
  return <Minus className="h-4 w-4 text-pulse-yellow" />;
}

interface IndicatorRow {
  slug: string;
  name: string;
  latest_value: string;
  status: IndicatorStatus;
  status_text: string;
  signal: string;
  signal_emoji: string;
  category: string;
  reading_date: string;
}

export default async function IndicatorsIndexPage() {
  const supabase = createServiceClient();

  const { data: readings } = await supabase
    .from("indicator_readings")
    .select("slug, name, latest_value, status, status_text, signal, signal_emoji, category, reading_date")
    .order("reading_date", { ascending: false });

  const latestBySlug = new Map<string, IndicatorRow>();
  if (readings) {
    for (const r of readings as IndicatorRow[]) {
      if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
    }
  }

  const categories = [
    { key: "primary", label: "Primary Indicators" },
    { key: "secondary", label: "Secondary Indicators" },
    { key: "liquidity", label: "Liquidity Indicators" },
    { key: "market", label: "Market Indicators" },
  ];

  const statusCounts = { safe: 0, watch: 0, warning: 0, danger: 0 };
  for (const row of latestBySlug.values()) {
    if (row.status in statusCounts) statusCounts[row.status as keyof typeof statusCounts]++;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-6">
              <Activity className="h-3.5 w-3.5" />
              Updated Daily
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Recession Indicators
            </h1>
            <p className="text-lg text-pulse-muted max-w-2xl mx-auto">
              Real-time tracking of {ALL_INDICATOR_SLUGS.length} economic indicators
              that signal recession risk. Click any indicator for detailed analysis, charts,
              and historical context.
            </p>
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {(["safe", "watch", "warning", "danger"] as const).map((s) => (
              <div
                key={s}
                className="bg-pulse-card border border-pulse-border rounded-xl p-4 text-center"
              >
                <div className="text-3xl font-bold font-mono text-white mb-1">
                  {statusCounts[s]}
                </div>
                <Badge status={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Badge>
              </div>
            ))}
          </div>

          {/* Indicators by category */}
          {categories.map((cat) => {
            const items = ALL_INDICATOR_SLUGS
              .filter((slug) => {
                const row = latestBySlug.get(slug);
                const seo = INDICATORS_SEO[slug];
                if (row) return row.category === cat.key;
                if (!seo) return false;
                if (cat.key === "primary")
                  return [
                    "sahm-rule",
                    "yield-curve-2s10s",
                    "yield-curve-2s30s",
                    "conference-board-lei",
                    "ism-manufacturing",
                    "unemployment-rate",
                  ].includes(slug);
                if (cat.key === "secondary")
                  return [
                    "initial-claims",
                    "consumer-sentiment",
                    "fed-funds-rate",
                    "gdp-growth",
                    "jpm-recession-probability",
                  ].includes(slug);
                if (cat.key === "liquidity")
                  return [
                    "m2-money-supply",
                    "on-rrp-facility",
                    "bank-unrealized-losses",
                    "us-interest-expense",
                  ].includes(slug);
                return [
                  "dxy-dollar-index",
                  "credit-spreads",
                  "emerging-markets",
                ].includes(slug);
              })
              .map((slug) => ({ slug, seo: INDICATORS_SEO[slug], row: latestBySlug.get(slug) }))
              .filter((i) => i.seo);

            if (items.length === 0) return null;

            return (
              <section key={cat.key} className="mb-12">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-pulse-border pb-3">
                  {cat.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(({ slug, seo, row }) => (
                    <Link
                      key={slug}
                      href={`/indicators/${slug}`}
                      className="group bg-pulse-card border border-pulse-border rounded-xl p-5 hover:border-pulse-green/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white group-hover:text-pulse-green transition-colors">
                          {seo!.shortName}
                        </h3>
                        {row ? (
                          <Badge status={row.status as IndicatorStatus}>
                            {row.status_text || row.status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-pulse-muted">No data</span>
                        )}
                      </div>

                      {row && (
                        <div className="flex items-end gap-3 mb-3">
                          <span className="text-2xl font-bold font-mono text-white">
                            {row.latest_value}
                          </span>
                          <TrendIcon status={row.status as IndicatorStatus} />
                        </div>
                      )}

                      {row && (
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{row.signal_emoji}</span>
                          <span className="text-xs text-pulse-muted line-clamp-1">
                            {row.signal}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-pulse-border">
                        <span className="text-xs text-pulse-muted">
                          {row
                            ? `Updated ${new Date(row.reading_date).toLocaleDateString()}`
                            : "Awaiting data"}
                        </span>
                        <ArrowRight className="h-4 w-4 text-pulse-muted group-hover:text-pulse-green transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {/* CTA */}
          <div className="bg-pulse-card border border-pulse-border rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Get Daily Alerts on These Indicators
            </h2>
            <p className="text-pulse-muted mb-6 max-w-lg mx-auto">
              Receive a morning SMS or email briefing with all indicator statuses.
              Know before the recession hits.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-pulse-green text-pulse-darker px-6 py-3 rounded-lg font-semibold hover:bg-pulse-green/90 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
