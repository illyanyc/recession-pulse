import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { CompareChart } from "@/components/indicators/CompareChart";
import { ArrowLeft, ArrowRight, GitCompare } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import {
  COMPARE_PAIRS,
  COMPARE_PAIRS_BY_SLUG,
  COMPARE_SLUGS,
} from "@/lib/compare-pairs";
import { INDICATORS_SEO } from "@/lib/indicators-metadata";

interface PageProps {
  params: Promise<{ pair: string }>;
}

export async function generateStaticParams() {
  return COMPARE_SLUGS.map((pair) => ({ pair }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair } = await params;
  const entry = COMPARE_PAIRS_BY_SLUG[pair];
  if (!entry) {
    // Check reverse ordering — canonical metadata should still work
    const [a, b] = pair.split("-vs-");
    if (a && b) {
      const [x, y] = a < b ? [a, b] : [b, a];
      const canonical = COMPARE_PAIRS_BY_SLUG[`${x}-vs-${y}`];
      if (canonical) return buildMeta(canonical, `${x}-vs-${y}`);
    }
    return {};
  }
  return buildMeta(entry, pair);
}

function buildMeta(
  entry: (typeof COMPARE_PAIRS)[number],
  slug: string,
): Metadata {
  const title = `${entry.headline} — Which Is the Better Recession Indicator?`;
  const description = entry.question;
  return {
    title,
    description,
    keywords: entry.keywords,
    openGraph: {
      type: "article",
      siteName: "RecessionPulse",
      title,
      description,
      url: `https://recessionpulse.com/indicators/compare/${slug}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: entry.headline }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `https://recessionpulse.com/indicators/compare/${slug}`,
    },
  };
}

async function fetchHistory(slug: string): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("indicator_readings")
      .select("reading_date, numeric_value, latest_value")
      .eq("slug", slug)
      .order("reading_date", { ascending: false })
      .limit(365);
    if (!data) return out;
    for (const row of data) {
      const val =
        row.numeric_value ??
        (typeof row.latest_value === "string"
          ? parseFloat(row.latest_value)
          : NaN);
      if (Number.isFinite(val)) {
        out.set(row.reading_date, val as number);
      }
    }
  } catch {
    // supabase unavailable at build time
  }
  return out;
}

export default async function ComparePage({ params }: PageProps) {
  const { pair } = await params;

  let entry = COMPARE_PAIRS_BY_SLUG[pair];
  if (!entry) {
    const [a, b] = pair.split("-vs-");
    if (!a || !b) notFound();
    const [x, y] = a < b ? [a, b] : [b, a];
    const canonicalSlug = `${x}-vs-${y}`;
    const canonical = COMPARE_PAIRS_BY_SLUG[canonicalSlug];
    if (!canonical) notFound();
    redirect(`/indicators/compare/${canonicalSlug}`);
  }

  const aSeo = INDICATORS_SEO[entry.a];
  const bSeo = INDICATORS_SEO[entry.b];

  const [aHistory, bHistory] = await Promise.all([
    fetchHistory(entry.a),
    fetchHistory(entry.b),
  ]);

  const allDates = new Set<string>([...aHistory.keys(), ...bHistory.keys()]);
  const dates = Array.from(allDates).sort();
  const chartData = dates.map((date) => ({
    date,
    a: aHistory.get(date),
    b: bHistory.get(date),
  }));

  const aLabel = aSeo?.shortName || entry.a;
  const bLabel = bSeo?.shortName || entry.b;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.headline,
    description: entry.narrative,
    url: `https://recessionpulse.com/indicators/compare/${pair}`,
    author: { "@type": "Organization", name: "RecessionPulse" },
    publisher: {
      "@type": "Organization",
      name: "RecessionPulse",
      url: "https://recessionpulse.com",
    },
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    about: [entry.a, entry.b].map((slug) => ({ "@type": "Thing", name: slug })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://recessionpulse.com" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Indicators",
        item: "https://recessionpulse.com/indicators",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Compare",
        item: "https://recessionpulse.com/indicators/compare",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: entry.headline,
        item: `https://recessionpulse.com/indicators/compare/${pair}`,
      },
    ],
  };

  const winnerLabel =
    entry.winner === "a" ? aLabel : entry.winner === "b" ? bLabel : "Both";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-pulse-muted mb-6">
            <Link href="/" className="hover:text-pulse-green">
              Home
            </Link>
            <span>/</span>
            <Link href="/indicators/compare" className="hover:text-pulse-green">
              Compare
            </Link>
            <span>/</span>
            <span className="text-white truncate max-w-[280px]">{entry.headline}</span>
          </nav>

          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-4">
              <GitCompare className="h-3.5 w-3.5" />
              Head-to-head comparison
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              {entry.headline}
            </h1>
            <p className="text-lg text-pulse-muted leading-relaxed">{entry.question}</p>
          </header>

          <section className="bg-pulse-card border border-pulse-border rounded-xl p-5 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-pulse-muted">
                  Verdict
                </div>
                <div className="text-lg font-bold text-white">{winnerLabel} wins</div>
              </div>
              <div className="text-xs text-pulse-muted max-w-md text-right">
                {entry.winnerReason}
              </div>
            </div>
          </section>

          <section className="bg-pulse-card border border-pulse-border rounded-xl p-5 mb-8">
            <h2 className="text-sm font-bold text-pulse-green uppercase tracking-wider mb-4">
              One-year comparison
            </h2>
            {chartData.length > 1 ? (
              <CompareChart data={chartData} aLabel={aLabel} bLabel={bLabel} />
            ) : (
              <p className="text-sm text-pulse-muted">
                Historical data unavailable — check back after the next cron run.
              </p>
            )}
            <p className="text-[11px] text-pulse-muted mt-3">
              Left axis: {aLabel} (green) · Right axis: {bLabel} (blue)
            </p>
          </section>

          <section className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-8">
            <h2 className="text-sm font-bold text-pulse-green uppercase tracking-wider mb-3">
              The analysis
            </h2>
            <p className="text-sm text-pulse-text leading-relaxed whitespace-pre-line">
              {entry.narrative}
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <Link
              href={`/indicators/${entry.a}`}
              className="group bg-pulse-card border border-pulse-border rounded-xl p-5 hover:border-pulse-green/30 transition-all"
            >
              <div className="text-[10px] uppercase tracking-wider text-pulse-muted mb-1">
                Indicator A
              </div>
              <div className="text-lg font-bold text-white group-hover:text-pulse-green transition-colors mb-2">
                {aLabel}
              </div>
              <p className="text-xs text-pulse-muted line-clamp-3">
                {aSeo?.metaDescription}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-pulse-green font-semibold">
                View indicator <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
            <Link
              href={`/indicators/${entry.b}`}
              className="group bg-pulse-card border border-pulse-border rounded-xl p-5 hover:border-pulse-green/30 transition-all"
            >
              <div className="text-[10px] uppercase tracking-wider text-pulse-muted mb-1">
                Indicator B
              </div>
              <div className="text-lg font-bold text-white group-hover:text-pulse-green transition-colors mb-2">
                {bLabel}
              </div>
              <p className="text-xs text-pulse-muted line-clamp-3">
                {bSeo?.metaDescription}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-pulse-green font-semibold">
                View indicator <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </section>

          <Link
            href="/indicators/compare"
            className="inline-flex items-center gap-2 text-pulse-green hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            All comparisons
          </Link>
        </article>
      </main>
      <Footer />
    </>
  );
}
