import { Metadata } from "next";
import Link from "next/link";
import { createServiceClient, createClient } from "@/lib/supabase/server";
import { INDICATORS_SEO, ALL_INDICATOR_SLUGS } from "@/lib/indicators-metadata";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { TrendingDown, TrendingUp, Minus, ArrowRight, Activity, Lock } from "lucide-react";
import type { IndicatorStatus, IndicatorCategory } from "@/types";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types";

const FREE_INDICATOR_SLUGS = new Set([
  "sahm-rule",
  "yield-curve-2s10s",
  "yield-curve-2s30s",
]);

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Recession Indicators — Live Economic Dashboard",
  description:
    "Track 38+ recession indicators in real time: Sahm Rule, yield curve, credit spreads, ISM PMI, JOLTS, building permits, consumer stress, and more. Updated daily with AI analysis.",
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
      "38+ recession indicators tracked daily. Sahm Rule, yield curve, JOLTS, building permits, credit spreads, PMI, and more.",
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

const SLUG_CATEGORY_MAP: Record<string, IndicatorCategory> = {
  "sahm-rule": "primary",
  "yield-curve-2s10s": "primary",
  "yield-curve-2s30s": "primary",
  "conference-board-lei": "primary",
  "ism-manufacturing": "primary",
  "unemployment-rate": "primary",
  "real-personal-income": "primary",
  "industrial-production": "primary",
  "jolts-quits-rate": "primary",
  "temp-help-services": "primary",
  "ny-fed-recession-prob": "primary",
  "sos-recession": "primary",
  "initial-claims": "secondary",
  "consumer-sentiment": "secondary",
  "fed-funds-rate": "secondary",
  "gdp-growth": "secondary",
  "jpm-recession-probability": "secondary",
  "building-permits": "housing",
  "housing-starts": "housing",
  "corporate-profits": "business_activity",
  "nfib-optimism": "business_activity",
  "inventory-sales-ratio": "business_activity",
  "sloos-lending": "business_activity",
  "personal-savings-rate": "credit_stress",
  "credit-card-delinquency": "credit_stress",
  "debt-service-ratio": "credit_stress",
  "nfci": "market",
  "credit-spreads": "market",
  "vix": "market",
  "dxy-dollar-index": "market",
  "emerging-markets": "market",
  "m2-money-supply": "liquidity",
  "on-rrp-facility": "liquidity",
  "bank-unrealized-losses": "liquidity",
  "us-interest-expense": "liquidity",
  "gdpnow": "realtime",
  "copper-gold-ratio": "realtime",
  "freight-index": "realtime",
};

export default async function IndicatorsIndexPage() {
  const latestBySlug = new Map<string, IndicatorRow>();
  let isSignedIn = false;

  try {
    const supabase = createServiceClient();
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    isSignedIn = !!user;

    const { data: readings } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, status, status_text, signal, signal_emoji, category, reading_date")
      .order("reading_date", { ascending: false });

    if (readings) {
      for (const r of readings as IndicatorRow[]) {
        if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
      }
    }
  } catch {
    // Supabase unavailable at build time
  }

  const categories = CATEGORY_ORDER.map((key) => ({
    key,
    label: CATEGORY_LABELS[key],
  }));

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

          {/* Sign-in prompt for non-authenticated users */}
          {!isSignedIn && (
            <div className="bg-gradient-to-r from-pulse-green/10 to-pulse-card border border-pulse-green/20 rounded-xl p-6 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-pulse-green flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Sign in to unlock all {ALL_INDICATOR_SLUGS.length} indicators
                  </p>
                  <p className="text-xs text-pulse-muted">
                    Sahm Rule and Yield Curve are free. Sign in to access the full dashboard.
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-pulse-green text-pulse-darker text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-pulse-green/90 transition-colors flex-shrink-0"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Indicators by category */}
          {categories.map((cat) => {
            const items = ALL_INDICATOR_SLUGS
              .filter((slug) => {
                const row = latestBySlug.get(slug);
                if (row) return row.category === cat.key;
                return SLUG_CATEGORY_MAP[slug] === cat.key;
              })
              .map((slug) => ({ slug, seo: INDICATORS_SEO[slug], row: latestBySlug.get(slug) }))
              .filter((i) => i.seo)
              .sort((a, b) => a.seo!.shortName.localeCompare(b.seo!.shortName));

            if (items.length === 0) return null;

            return (
              <section key={cat.key} className="mb-12">
                <h2 className="text-xl font-bold text-white mb-6 border-b border-pulse-border pb-3">
                  {cat.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map(({ slug, seo, row }) => {
                    const isFree = FREE_INDICATOR_SLUGS.has(slug);
                    const isLocked = !isFree && !isSignedIn;

                    if (isLocked) {
                      return (
                        <div
                          key={slug}
                          className="relative bg-pulse-card border border-pulse-border rounded-xl p-5 overflow-hidden"
                        >
                          <div className="blur-[6px] select-none pointer-events-none" aria-hidden="true">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-sm font-semibold text-white">
                                {seo!.shortName}
                              </h3>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-pulse-border text-pulse-muted">
                                ••••••
                              </span>
                            </div>
                            <div className="flex items-end gap-3 mb-3">
                              <span className="text-2xl font-bold font-mono text-white">
                                ••••
                              </span>
                              <Minus className="h-4 w-4 text-pulse-muted" />
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">⬤</span>
                              <span className="text-xs text-pulse-muted">
                                ••••••••••••••••
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-pulse-border">
                              <span className="text-xs text-pulse-muted">Updated •••••</span>
                              <ArrowRight className="h-4 w-4 text-pulse-muted" />
                            </div>
                          </div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-pulse-card/60 backdrop-blur-[2px]">
                            <Lock className="h-5 w-5 text-pulse-muted mb-2" />
                            <p className="text-sm font-medium text-white mb-1">
                              {seo!.shortName}
                            </p>
                            <p className="text-xs text-pulse-muted mb-3">
                              Sign in to view live data
                            </p>
                            <Link
                              href="/login"
                              className="inline-flex items-center gap-1.5 bg-pulse-green text-pulse-darker text-xs font-semibold px-4 py-2 rounded-lg hover:bg-pulse-green/90 transition-colors"
                            >
                              Sign in
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      );
                    }

                    return (
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
                    );
                  })}
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
