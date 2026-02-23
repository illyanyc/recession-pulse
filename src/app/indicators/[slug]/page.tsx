import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { getIndicatorSEO, ALL_INDICATOR_SLUGS, INDICATORS_SEO } from "@/lib/indicators-metadata";
import { getGlobalSummary } from "@/lib/redis";
import { Badge } from "@/components/ui/Badge";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { IndicatorChart } from "@/components/indicators/IndicatorChart";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRight,
  ArrowLeft,
  Activity,
  BookOpen,
  Brain,
  Clock,
} from "lucide-react";
import type { IndicatorStatus } from "@/types";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_INDICATOR_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = getIndicatorSEO(slug);
  if (!seo) return {};

  return {
    title: seo.title,
    description: seo.metaDescription,
    keywords: seo.keywords,
    openGraph: {
      title: `${seo.title} — RecessionPulse`,
      description: seo.metaDescription,
      url: `https://recessionpulse.com/indicators/${slug}`,
      images: [{ url: `/api/og/${slug}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${seo.title} — RecessionPulse`,
      description: seo.metaDescription,
      images: [`/api/og/${slug}`],
    },
    alternates: { canonical: `https://recessionpulse.com/indicators/${slug}` },
  };
}

function TrendIcon({ status }: { status: IndicatorStatus }) {
  if (status === "safe") return <TrendingUp className="h-5 w-5 text-pulse-green" />;
  if (status === "danger" || status === "warning")
    return <TrendingDown className="h-5 w-5 text-pulse-red" />;
  return <Minus className="h-5 w-5 text-pulse-yellow" />;
}

export default async function IndicatorPage({ params }: PageProps) {
  const { slug } = await params;
  const seo = getIndicatorSEO(slug);
  if (!seo) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let latest: any = null;
  let history: { date: string; value: number }[] = [];
  let aiSummary: string | null = null;

  try {
    const supabase = createServiceClient();

    const { data: readings } = await supabase
      .from("indicator_readings")
      .select("*")
      .eq("slug", slug)
      .order("reading_date", { ascending: false })
      .limit(90);

    latest = readings?.[0] ?? null;
    history = readings
      ? [...readings]
          .reverse()
          .map((r) => ({
            date: r.reading_date,
            value: r.numeric_value ?? (parseFloat(r.latest_value) || 0),
          }))
      : [];

    aiSummary = await getGlobalSummary(slug);

    if (!aiSummary) {
      try {
        const { data: dbSummary } = await supabase
          .from("indicator_summaries")
          .select("summary")
          .eq("slug", slug)
          .order("reading_date", { ascending: false })
          .limit(1)
          .single();

        if (dbSummary?.summary) {
          aiSummary = dbSummary.summary;
        }
      } catch {
        // indicator_summaries table may not exist yet
      }
    }
  } catch {
    // Supabase unavailable at build time — render with static content only
  }

  const relatedSlugs = ALL_INDICATOR_SLUGS.filter((s) => s !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: seo.title,
    description: seo.metaDescription,
    url: `https://recessionpulse.com/indicators/${slug}`,
    license: "https://creativecommons.org/licenses/by/4.0/",
    temporalCoverage: history.length
      ? `${history[0].date}/${history[history.length - 1].date}`
      : undefined,
    creator: { "@type": "Organization", name: "RecessionPulse" },
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `https://recessionpulse.com/api/indicators/${slug}/history`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://recessionpulse.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Indicators",
        item: "https://recessionpulse.com/indicators",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: seo.shortName,
        item: `https://recessionpulse.com/indicators/${slug}`,
      },
    ],
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-pulse-muted mb-8">
            <Link href="/" className="hover:text-pulse-green transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/indicators" className="hover:text-pulse-green transition-colors">
              Indicators
            </Link>
            <span>/</span>
            <span className="text-white">{seo.shortName}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold">
                <Activity className="h-3.5 w-3.5" />
                Live Data
              </div>
              {latest && (
                <Badge
                  status={latest.status as IndicatorStatus}
                  pulse={latest.status === "danger"}
                >
                  {latest.status_text || latest.status}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {seo.title}
            </h1>
            <p className="text-pulse-muted text-lg">{seo.metaDescription}</p>
          </div>

          {/* Current value card */}
          {latest && (
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-pulse-muted mb-1">Current Value</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold font-mono text-white">
                      {latest.latest_value}
                    </span>
                    <TrendIcon status={latest.status as IndicatorStatus} />
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full shrink-0 ${
                      latest.signal_emoji === "DANGER" ? "bg-pulse-red" :
                      latest.signal_emoji === "WARNING" ? "bg-pulse-yellow" :
                      latest.signal_emoji === "WATCH" ? "bg-pulse-yellow" :
                      "bg-pulse-green"
                    }`} />
                    <span className="text-sm font-medium text-white">{latest.signal}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-pulse-muted">
                    <Clock className="h-3.5 w-3.5" />
                    Updated {new Date(latest.reading_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-pulse-border">
                <p className="text-xs text-pulse-muted">
                  Trigger Level: {latest.trigger_level}
                </p>
              </div>
            </div>
          )}

          {/* Chart */}
          {history.length > 1 && (
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Historical Trend</h2>
              <IndicatorChart
                data={history}
                status={(latest?.status as IndicatorStatus) ?? "safe"}
                slug={slug}
              />
            </div>
          )}

          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-pulse-green" />
                  <h2 className="text-lg font-semibold text-white">AI Analysis</h2>
                </div>
                {latest && (
                  <span className="text-xs text-pulse-muted">
                    Updated {new Date(latest.reading_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-pulse-text leading-relaxed">{aiSummary}</p>
            </div>
          )}

          {/* Educational content */}
          <div className="space-y-6 mb-8">
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-pulse-green" />
                <h2 className="text-lg font-semibold text-white">
                  What is the {seo.shortName}?
                </h2>
              </div>
              <p className="text-pulse-text leading-relaxed">{seo.whatIsIt}</p>
            </div>

            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Why It Matters for Recession Risk
              </h2>
              <p className="text-pulse-text leading-relaxed">{seo.whyItMatters}</p>
            </div>

            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">
                Historical Context
              </h2>
              <p className="text-pulse-text leading-relaxed">{seo.historicalContext}</p>
            </div>
          </div>

          {/* Share */}
          <div className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-8">
            <h3 className="text-sm font-semibold text-white mb-3">Share this indicator</h3>
            <ShareButtons
              url={`https://recessionpulse.com/indicators/${slug}`}
              title={`${seo.shortName}: ${latest?.latest_value ?? "Check status"} — RecessionPulse`}
            />
          </div>

          {/* Related indicators */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Related Indicators</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedSlugs.map((rs) => {
                const rSeo = INDICATORS_SEO[rs];
                if (!rSeo) return null;
                return (
                  <Link
                    key={rs}
                    href={`/indicators/${rs}`}
                    className="bg-pulse-card border border-pulse-border rounded-xl p-4 hover:border-pulse-green/30 transition-all"
                  >
                    <h3 className="text-sm font-semibold text-white mb-2">
                      {rSeo.shortName}
                    </h3>
                    <p className="text-xs text-pulse-muted line-clamp-2">
                      {rSeo.metaDescription}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-pulse-card border border-pulse-green/20 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Get Daily {seo.shortName} Alerts
            </h2>
            <p className="text-pulse-muted mb-6 max-w-lg mx-auto">
              Receive SMS and email alerts when this indicator changes status.
              Stay ahead of the market.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-pulse-green text-pulse-darker px-6 py-3 rounded-lg font-semibold hover:bg-pulse-green/90 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/indicators"
                className="inline-flex items-center justify-center gap-2 border border-pulse-border text-pulse-text px-6 py-3 rounded-lg font-semibold hover:border-pulse-green/30 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                All Indicators
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
