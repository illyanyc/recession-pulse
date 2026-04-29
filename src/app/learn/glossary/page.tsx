import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BookOpen, ArrowRight } from "lucide-react";
import { GLOSSARY, GLOSSARY_SLUGS } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Macro Glossary — Recession, Inflation & Market Terms",
  description:
    "A curated glossary of recession, inflation, monetary policy, and market terms. Plain-English definitions with links to the live indicators they describe.",
  keywords: [
    "macroeconomics glossary",
    "recession glossary",
    "macro terms",
    "economic definitions",
  ],
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "Macro Glossary — RecessionPulse",
    description:
      "Plain-English definitions for recession, inflation, monetary policy, and market terms — with links to the live indicators they describe.",
    url: "https://recessionpulse.com/learn/glossary",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Macro Glossary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Macro Glossary — RecessionPulse",
    description:
      "Plain-English definitions for recession, inflation, monetary policy, and market terms.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://recessionpulse.com/learn/glossary" },
};

export default function GlossaryIndexPage() {
  const terms = GLOSSARY_SLUGS.map((slug) => GLOSSARY[slug]).sort((a, b) =>
    a.term.localeCompare(b.term),
  );

  const groupedByLetter = new Map<string, typeof terms>();
  for (const t of terms) {
    const first = t.term[0].toUpperCase();
    const bucket = /[A-Z]/.test(first) ? first : "#";
    if (!groupedByLetter.has(bucket)) groupedByLetter.set(bucket, []);
    groupedByLetter.get(bucket)!.push(t);
  }
  const letters = Array.from(groupedByLetter.keys()).sort();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Macro Glossary — RecessionPulse",
    url: "https://recessionpulse.com/learn/glossary",
    description:
      "A curated glossary of recession, inflation, monetary policy, and market terms.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: terms.length,
      itemListElement: terms.map((t, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://recessionpulse.com/learn/glossary/${t.slug}`,
        name: t.term,
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
              <BookOpen className="h-3.5 w-3.5" />
              {terms.length} terms · curated by RecessionPulse
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Macro Glossary
            </h1>
            <p className="text-lg text-pulse-muted max-w-2xl">
              Plain-English definitions for recession, inflation, monetary policy, and
              market terms — each one linked to the live indicators it describes.
            </p>
          </header>

          <nav className="mb-10 flex flex-wrap gap-2 border-b border-pulse-border pb-6">
            {letters.map((l) => (
              <a
                key={l}
                href={`#${l}`}
                className="px-3 py-1 rounded-lg bg-pulse-card border border-pulse-border text-sm font-mono text-white hover:border-pulse-green/30"
              >
                {l}
              </a>
            ))}
          </nav>

          {letters.map((l) => {
            const items = groupedByLetter.get(l)!;
            return (
              <section key={l} id={l} className="mb-10 scroll-mt-24">
                <h2 className="text-2xl font-bold text-pulse-green mb-4 font-mono">
                  {l}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/learn/glossary/${t.slug}`}
                      className="group bg-pulse-card border border-pulse-border rounded-xl p-4 hover:border-pulse-green/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-white group-hover:text-pulse-green transition-colors">
                          {t.term}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-pulse-muted group-hover:text-pulse-green flex-shrink-0" />
                      </div>
                      <p className="text-xs text-pulse-muted leading-relaxed line-clamp-2">
                        {t.shortDef}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
