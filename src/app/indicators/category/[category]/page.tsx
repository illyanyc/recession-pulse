import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, ArrowRight, Activity } from "lucide-react";
import {
  CATEGORY_PILLARS,
  CATEGORY_SLUGS,
  CATEGORY_FROM_SLUG,
} from "@/lib/category-pillars";
import { getSlugsByCategory } from "@/lib/indicator-categories";
import {
  ALL_INDICATOR_SLUGS,
  INDICATORS_SEO,
} from "@/lib/indicators-metadata";
import type { IndicatorCategory, IndicatorStatus } from "@/types";
import { CATEGORY_LABELS } from "@/types";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ category: string }>;
}

interface IndicatorRow {
  slug: string;
  name: string;
  latest_value: string;
  status: IndicatorStatus;
  status_text: string;
  signal: string;
  category: string;
  reading_date: string;
}

export async function generateStaticParams() {
  return (Object.values(CATEGORY_SLUGS) as string[]).map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = CATEGORY_FROM_SLUG[category];
  if (!cat) return {};
  const pillar = CATEGORY_PILLARS[cat];

  return {
    title: pillar.metaTitle,
    description: pillar.metaDescription,
    keywords: pillar.keywords,
    openGraph: {
      type: "website",
      siteName: "RecessionPulse",
      title: pillar.metaTitle,
      description: pillar.metaDescription,
      url: `https://recessionpulse.com/indicators/category/${category}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: pillar.h1 }],
    },
    twitter: {
      card: "summary_large_image",
      title: pillar.metaTitle,
      description: pillar.metaDescription,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `https://recessionpulse.com/indicators/category/${category}`,
    },
  };
}

function StatusDot({ status }: { status: IndicatorStatus }) {
  const color =
    status === "safe"
      ? "bg-pulse-green"
      : status === "watch"
      ? "bg-pulse-yellow"
      : "bg-pulse-red";
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
}

export default async function CategoryHubPage({ params }: PageProps) {
  const { category } = await params;
  const cat: IndicatorCategory | undefined = CATEGORY_FROM_SLUG[category];
  if (!cat) notFound();

  const pillar = CATEGORY_PILLARS[cat];
  const memberSlugs = getSlugsByCategory(cat, ALL_INDICATOR_SLUGS);

  const latestBySlug = new Map<string, IndicatorRow>();
  try {
    const supabase = createServiceClient();
    const { data: readings } = await supabase
      .from("indicator_readings")
      .select(
        "slug, name, latest_value, status, status_text, signal, category, reading_date",
      )
      .in("slug", memberSlugs)
      .order("reading_date", { ascending: false });
    if (readings) {
      for (const r of readings as IndicatorRow[]) {
        if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
      }
    }
  } catch {
    // Supabase unavailable at build time — render with static pillar only
  }

  const signalCounts = { safe: 0, watch: 0, warning: 0, danger: 0 };
  for (const row of latestBySlug.values()) {
    if (row.status in signalCounts) {
      signalCounts[row.status as keyof typeof signalCounts]++;
    }
  }

  const breadcrumbJsonLd = {
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
        name: CATEGORY_LABELS[cat],
        item: `https://recessionpulse.com/indicators/category/${category}`,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pillar.metaTitle,
    url: `https://recessionpulse.com/indicators/category/${category}`,
    description: pillar.metaDescription,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: memberSlugs.length,
      itemListElement: memberSlugs.map((slug, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://recessionpulse.com/indicators/${slug}`,
        name: INDICATORS_SEO[slug]?.shortName || slug,
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pillar.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const otherCategories = (Object.keys(CATEGORY_PILLARS) as IndicatorCategory[])
    .filter((c) => c !== cat)
    .map((c) => ({
      key: c,
      label: CATEGORY_LABELS[c],
      slug: CATEGORY_SLUGS[c],
      members: getSlugsByCategory(c, ALL_INDICATOR_SLUGS).length,
    }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-pulse-muted mb-6">
            <Link href="/" className="hover:text-pulse-green">
              Home
            </Link>
            <span>/</span>
            <Link href="/indicators" className="hover:text-pulse-green">
              Indicators
            </Link>
            <span>/</span>
            <span className="text-white">{CATEGORY_LABELS[cat]}</span>
          </nav>

          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-6">
              <Activity className="h-3.5 w-3.5" />
              {memberSlugs.length} indicators · updated daily
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {pillar.h1}
            </h1>
            <p className="text-lg text-pulse-muted leading-relaxed">{pillar.lede}</p>
          </header>

          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {(["safe", "watch", "warning", "danger"] as const).map((s) => (
              <div
                key={s}
                className="bg-pulse-card border border-pulse-border rounded-xl p-4 text-center"
              >
                <div className="text-3xl font-bold font-mono text-white mb-1">
                  {signalCounts[s]}
                </div>
                <Badge status={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</Badge>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
              <h2 className="text-sm font-bold text-pulse-green uppercase tracking-wider mb-3">
                Why this category matters
              </h2>
              <p className="text-sm text-pulse-text leading-relaxed">
                {pillar.whyItMatters}
              </p>
            </div>
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
              <h2 className="text-sm font-bold text-pulse-green uppercase tracking-wider mb-3">
                How to read it
              </h2>
              <p className="text-sm text-pulse-text leading-relaxed">{pillar.howToRead}</p>
            </div>
            <div className="bg-pulse-card border border-pulse-border rounded-xl p-6">
              <h2 className="text-sm font-bold text-pulse-green uppercase tracking-wider mb-3">
                Historical lead time
              </h2>
              <p className="text-sm text-pulse-text leading-relaxed">
                {pillar.historicalLeadTime}
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Indicators in this category
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {memberSlugs.map((slug) => {
                const seo = INDICATORS_SEO[slug];
                const reading = latestBySlug.get(slug);
                const name = reading?.name || seo?.shortName || slug;
                return (
                  <Link
                    key={slug}
                    href={`/indicators/${slug}`}
                    className="group flex items-center justify-between bg-pulse-card border border-pulse-border rounded-xl p-4 hover:border-pulse-green/30 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {reading ? (
                          <StatusDot status={reading.status} />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-pulse-border" />
                        )}
                        <span className="text-sm font-semibold text-white truncate">
                          {name}
                        </span>
                      </div>
                      <p className="text-xs text-pulse-muted truncate">
                        {reading?.status_text ||
                          seo?.metaDescription ||
                          "Tap to view details"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-pulse-muted group-hover:text-pulse-green flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {pillar.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group bg-pulse-card border border-pulse-border rounded-xl p-5"
                >
                  <summary className="cursor-pointer text-sm font-semibold text-white">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm text-pulse-muted leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="mb-12 border-t border-pulse-border pt-10">
            <h2 className="text-xl font-bold text-white mb-4">Explore other categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {otherCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/indicators/category/${c.slug}`}
                  className="group bg-pulse-card border border-pulse-border rounded-xl p-4 hover:border-pulse-green/30 transition-all"
                >
                  <div className="text-sm font-semibold text-white group-hover:text-pulse-green transition-colors">
                    {c.label}
                  </div>
                  <div className="text-xs text-pulse-muted mt-1">
                    {c.members} indicators
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <Link
            href="/indicators"
            className="inline-flex items-center gap-2 text-pulse-green hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all indicators
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
