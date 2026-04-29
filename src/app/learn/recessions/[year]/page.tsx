import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import {
  HISTORICAL_RECESSIONS,
  HISTORICAL_RECESSION_SLUGS,
} from "@/lib/historical-recessions";
import { GLOSSARY } from "@/lib/glossary";
import { INDICATORS_SEO } from "@/lib/indicators-metadata";

interface PageProps {
  params: Promise<{ year: string }>;
}

export async function generateStaticParams() {
  return HISTORICAL_RECESSION_SLUGS.map((year) => ({ year }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year } = await params;
  const entry = HISTORICAL_RECESSIONS[year];
  if (!entry) return {};

  const title = `${entry.name} — Causes, Timeline & Indicators`;
  const description = entry.summary.slice(0, 160);

  return {
    title,
    description,
    keywords: entry.keywords,
    openGraph: {
      type: "article",
      siteName: "RecessionPulse",
      title,
      description,
      url: `https://recessionpulse.com/learn/recessions/${year}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: entry.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `https://recessionpulse.com/learn/recessions/${year}`,
    },
  };
}

export default async function HistoricalRecessionPage({ params }: PageProps) {
  const { year } = await params;
  const entry = HISTORICAL_RECESSIONS[year];
  if (!entry) notFound();

  const relatedIndicators = entry.relatedIndicators
    .map((slug) => ({ slug, seo: INDICATORS_SEO[slug] }))
    .filter((r) => r.seo);
  const relatedTerms = entry.relatedTerms
    .map((slug) => GLOSSARY[slug])
    .filter(Boolean);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.name,
    description: entry.summary,
    url: `https://recessionpulse.com/learn/recessions/${year}`,
    author: { "@type": "Organization", name: "RecessionPulse" },
    publisher: {
      "@type": "Organization",
      name: "RecessionPulse",
      url: "https://recessionpulse.com",
    },
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    about: entry.keywords.map((k) => ({ "@type": "Thing", name: k })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://recessionpulse.com" },
      { "@type": "ListItem", position: 2, name: "Learn", item: "https://recessionpulse.com/learn" },
      {
        "@type": "ListItem",
        position: 3,
        name: "Recessions",
        item: "https://recessionpulse.com/learn/recessions",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: entry.name,
        item: `https://recessionpulse.com/learn/recessions/${year}`,
      },
    ],
  };

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
        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-pulse-muted mb-6">
            <Link href="/" className="hover:text-pulse-green">
              Home
            </Link>
            <span>/</span>
            <Link href="/learn/recessions" className="hover:text-pulse-green">
              Recessions
            </Link>
            <span>/</span>
            <span className="text-white truncate max-w-[240px]">{entry.name}</span>
          </nav>

          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-4">
              <Clock className="h-3.5 w-3.5" />
              {entry.peak} → {entry.trough} · {entry.durationMonths} months
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              {entry.name}
            </h1>
            <p className="text-lg text-pulse-muted leading-relaxed">{entry.summary}</p>
          </header>

          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            <StatCard label="Duration" value={`${entry.durationMonths} months`} />
            <StatCard label="Peak unemployment" value={entry.peakUnemployment} />
            <StatCard label="Peak-to-trough GDP" value={entry.peakToTroughGdp} />
            <StatCard label="S&P 500 drawdown" value={`-${entry.sp500DrawdownPct}%`} />
          </section>

          <Section title="What caused it">
            <ul className="space-y-2 text-sm text-pulse-text">
              {entry.causes.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-pulse-green">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="The indicator playbook">
            <p className="text-sm text-pulse-text leading-relaxed whitespace-pre-line">
              {entry.playbook}
            </p>
          </Section>

          <Section title="What ended it">
            <p className="text-sm text-pulse-text leading-relaxed whitespace-pre-line">
              {entry.whatEndedIt}
            </p>
          </Section>

          <Section title="Modern parallels">
            <p className="text-sm text-pulse-text leading-relaxed whitespace-pre-line">
              {entry.modernParallels}
            </p>
          </Section>

          {relatedIndicators.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">
                Indicators that would have warned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedIndicators.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/indicators/${r.slug}`}
                    className="group flex items-center justify-between bg-pulse-card border border-pulse-border rounded-xl p-4 hover:border-pulse-green/30 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white group-hover:text-pulse-green transition-colors truncate">
                        {r.seo?.shortName || r.slug}
                      </div>
                      <div className="text-xs text-pulse-muted truncate">
                        {r.seo?.metaDescription?.slice(0, 100)}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-pulse-muted group-hover:text-pulse-green flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedTerms.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Related terms</h2>
              <div className="flex flex-wrap gap-2">
                {relatedTerms.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/learn/glossary/${t.slug}`}
                    className="px-3 py-1.5 rounded-lg bg-pulse-card border border-pulse-border text-sm text-white hover:border-pulse-green/30 hover:text-pulse-green transition-colors"
                  >
                    {t.term}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Link
            href="/learn/recessions"
            className="inline-flex items-center gap-2 text-pulse-green hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all recessions
          </Link>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-6">
      <h2 className="text-sm font-bold text-pulse-green uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-pulse-card border border-pulse-border rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-pulse-muted mb-1">
        {label}
      </div>
      <div className="text-sm font-mono font-semibold text-white">{value}</div>
    </div>
  );
}
