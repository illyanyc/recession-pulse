import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { GLOSSARY, GLOSSARY_SLUGS } from "@/lib/glossary";
import { INDICATORS_SEO } from "@/lib/indicators-metadata";

interface PageProps {
  params: Promise<{ term: string }>;
}

export async function generateStaticParams() {
  return GLOSSARY_SLUGS.map((term) => ({ term }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { term } = await params;
  const entry = GLOSSARY[term];
  if (!entry) return {};

  const title = `${entry.term} — Definition & Meaning`;
  const description = entry.shortDef;

  return {
    title,
    description,
    keywords: entry.keywords,
    openGraph: {
      type: "article",
      siteName: "RecessionPulse",
      title: `${entry.term} — RecessionPulse Glossary`,
      description,
      url: `https://recessionpulse.com/learn/glossary/${term}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: entry.term }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.term} — RecessionPulse Glossary`,
      description,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `https://recessionpulse.com/learn/glossary/${term}`,
    },
  };
}

export default async function GlossaryTermPage({ params }: PageProps) {
  const { term } = await params;
  const entry = GLOSSARY[term];
  if (!entry) notFound();

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: entry.term,
    description: entry.longDef,
    url: `https://recessionpulse.com/learn/glossary/${term}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "RecessionPulse Macro Glossary",
      url: "https://recessionpulse.com/learn/glossary",
    },
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
        name: "Glossary",
        item: "https://recessionpulse.com/learn/glossary",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: entry.term,
        item: `https://recessionpulse.com/learn/glossary/${term}`,
      },
    ],
  };

  const relatedIndicators = entry.relatedIndicators
    .map((slug) => ({ slug, seo: INDICATORS_SEO[slug] }))
    .filter((r) => r.seo);
  const relatedTerms = entry.relatedTerms
    .map((slug) => GLOSSARY[slug])
    .filter(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }}
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
            <Link href="/learn/glossary" className="hover:text-pulse-green">
              Glossary
            </Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{entry.term}</span>
          </nav>

          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              Macro glossary
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {entry.term}
            </h1>
            <p className="text-lg text-pulse-muted leading-relaxed">{entry.shortDef}</p>
          </header>

          <section className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-10">
            <h2 className="text-sm font-bold text-pulse-green uppercase tracking-wider mb-3">
              Definition
            </h2>
            <p className="text-sm text-pulse-text leading-relaxed whitespace-pre-line">
              {entry.longDef}
            </p>
            {entry.firstCoined && (
              <p className="mt-4 pt-4 border-t border-pulse-border text-xs text-pulse-muted">
                <strong className="text-white">Origin:</strong> {entry.firstCoined}
              </p>
            )}
          </section>

          {relatedIndicators.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">Related indicators</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedTerms.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/learn/glossary/${t.slug}`}
                    className="group flex items-center justify-between bg-pulse-card border border-pulse-border rounded-xl p-4 hover:border-pulse-green/30 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white group-hover:text-pulse-green transition-colors truncate">
                        {t.term}
                      </div>
                      <div className="text-xs text-pulse-muted truncate">
                        {t.shortDef}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-pulse-muted group-hover:text-pulse-green flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Link
            href="/learn/glossary"
            className="inline-flex items-center gap-2 text-pulse-green hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to glossary
          </Link>
        </article>
      </main>
      <Footer />
    </>
  );
}
