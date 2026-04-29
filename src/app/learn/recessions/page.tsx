import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Clock, ArrowRight } from "lucide-react";
import {
  HISTORICAL_RECESSIONS,
  HISTORICAL_RECESSION_SLUGS,
} from "@/lib/historical-recessions";

export const metadata: Metadata = {
  title: "US Recession History — Every Post-War Recession Explained",
  description:
    "Deep dives into the last six US recessions (1973, 1980, 1990, 2001, 2008, 2020) — what caused them, what ended them, and which modern indicators would have warned.",
  keywords: [
    "US recession history",
    "list of US recessions",
    "recession timeline",
    "historical recessions",
    "past recessions",
  ],
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "US Recession History — RecessionPulse",
    description:
      "Every post-war US recession, with causes, playbook, and modern parallels — linked to the live indicators that would have warned.",
    url: "https://recessionpulse.com/learn/recessions",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "US Recession History" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "US Recession History — RecessionPulse",
    description:
      "Every post-war US recession, with causes, playbook, and modern parallels.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://recessionpulse.com/learn/recessions" },
};

export default function RecessionsIndexPage() {
  const recessions = HISTORICAL_RECESSION_SLUGS.map((s) => HISTORICAL_RECESSIONS[s]);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "US Recession History",
    url: "https://recessionpulse.com/learn/recessions",
    description: "Deep dives into every US post-war recession.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: recessions.length,
      itemListElement: recessions.map((r, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://recessionpulse.com/learn/recessions/${r.slug}`,
        name: r.name,
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
              <Clock className="h-3.5 w-3.5" />
              {recessions.length} post-war US recessions
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              US Recession History
            </h1>
            <p className="text-lg text-pulse-muted max-w-2xl">
              Every post-war US recession, with causes, duration, what ended it, and the
              indicators that would have warned — so today&rsquo;s signals can be read in
              historical context.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recessions.map((r) => (
              <Link
                key={r.slug}
                href={`/learn/recessions/${r.slug}`}
                className="group bg-pulse-card border border-pulse-border rounded-xl p-6 hover:border-pulse-green/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-xs font-mono text-pulse-muted mb-1">
                      {r.peak} → {r.trough}
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-pulse-green transition-colors">
                      {r.name}
                    </h2>
                  </div>
                  <ArrowRight className="h-5 w-5 text-pulse-muted group-hover:text-pulse-green flex-shrink-0 mt-1" />
                </div>
                <p className="text-sm text-pulse-muted leading-relaxed line-clamp-3 mb-4">
                  {r.summary}
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Stat label="Duration" value={`${r.durationMonths}mo`} />
                  <Stat label="Peak U/E" value={r.peakUnemployment.split(" ")[0]} />
                  <Stat label="S&P" value={`-${r.sp500DrawdownPct}%`} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-pulse-border pt-2">
      <div className="text-pulse-muted uppercase tracking-wider text-[10px]">{label}</div>
      <div className="text-white font-mono font-semibold">{value}</div>
    </div>
  );
}
