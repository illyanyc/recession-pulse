import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { GitCompare, ArrowRight } from "lucide-react";
import { COMPARE_PAIRS } from "@/lib/compare-pairs";
import { INDICATORS_SEO } from "@/lib/indicators-metadata";

export const metadata: Metadata = {
  title: "Compare Recession Indicators — Head-to-Head Analysis",
  description:
    "Head-to-head comparisons of the most-cited recession indicators: Sahm Rule vs yield curve, LEI vs ISM PMI, VIX vs credit spreads, and more.",
  keywords: [
    "compare recession indicators",
    "sahm rule vs yield curve",
    "best recession indicator",
    "recession indicator comparison",
  ],
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Compare Recession Indicators — RecessionPulse",
    description:
      "Head-to-head comparisons of recession indicators with historical track record and practical guidance.",
    url: "https://recessionpulse.com/indicators/compare",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Compare Indicators" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare Recession Indicators — RecessionPulse",
    description:
      "Head-to-head comparisons of recession indicators with historical track record and practical guidance.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://recessionpulse.com/indicators/compare" },
};

export default function CompareIndexPage() {
  const pairs = COMPARE_PAIRS.map((p) => ({
    ...p,
    aName: INDICATORS_SEO[p.a]?.shortName || p.a,
    bName: INDICATORS_SEO[p.b]?.shortName || p.b,
  }));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Compare Recession Indicators",
    url: "https://recessionpulse.com/indicators/compare",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pairs.length,
      itemListElement: pairs.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://recessionpulse.com/indicators/compare/${p.slug}`,
        name: p.headline,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <header className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-6">
              <GitCompare className="h-3.5 w-3.5" />
              {pairs.length} head-to-head comparisons
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Compare Recession Indicators
            </h1>
            <p className="text-lg text-pulse-muted max-w-2xl">
              Which indicator wins on lead time? On accuracy? On false-positive rate? These
              head-to-heads break down the trade-offs with historical data and practical
              guidance for using them together.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pairs.map((p) => (
              <Link
                key={p.slug}
                href={`/indicators/compare/${p.slug}`}
                className="group bg-pulse-card border border-pulse-border rounded-xl p-5 hover:border-pulse-green/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-lg font-bold text-white group-hover:text-pulse-green transition-colors">
                    {p.headline}
                  </h2>
                  <ArrowRight className="h-5 w-5 text-pulse-muted group-hover:text-pulse-green flex-shrink-0 mt-1" />
                </div>
                <p className="text-xs text-pulse-muted leading-relaxed line-clamp-3">
                  {p.question}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
