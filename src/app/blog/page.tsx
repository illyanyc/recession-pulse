import { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BlogList } from "./BlogList";
import { BLOG_CONTENT_TYPES } from "@/lib/blog-taxonomy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Recession Analysis & Weekly Reports",
  description:
    "Weekly recession indicator reports, deep-dive analyses, and market commentary. Data-driven economic insights from RecessionPulse.",
  keywords: [
    "recession blog",
    "recession analysis",
    "weekly recession report",
    "economic analysis blog",
    "recession indicators analysis",
  ],
  openGraph: {
    type: "website",
    siteName: "RecessionPulse",
    title: "RecessionPulse Blog — Weekly Recession Reports & Analysis",
    description:
      "Data-driven weekly recession reports, indicator deep dives, and market commentary.",
    url: "https://recessionpulse.com/blog",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "RecessionPulse Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RecessionPulse Blog — Weekly Recession Reports & Analysis",
    description:
      "Data-driven weekly recession reports, indicator deep dives, and market commentary.",
    images: ["/og-image.png"],
  },
  alternates: { canonical: "https://recessionpulse.com/blog" },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content_type: string;
  published_at: string;
  keywords: string[];
}

export default async function BlogIndexPage() {
  let blogPosts: BlogPost[] = [];

  try {
    const supabase = createServiceClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, content_type, published_at, keywords")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(500);

    blogPosts = (posts as BlogPost[]) || [];
  } catch {
    // Supabase unavailable at build time
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "RecessionPulse Blog — Weekly Recession Reports & Analysis",
    url: "https://recessionpulse.com/blog",
    description:
      "Data-driven weekly recession reports, indicator deep dives, and daily macro risk assessments.",
    isPartOf: {
      "@type": "WebSite",
      name: "RecessionPulse",
      url: "https://recessionpulse.com",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: blogPosts.length,
      itemListElement: blogPosts.slice(0, 50).map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://recessionpulse.com/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };

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
        name: "Blog",
        item: "https://recessionpulse.com/blog",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-6">
          <nav
            aria-label="Browse by category"
            className="flex flex-wrap items-center gap-2 text-xs"
          >
            <span className="text-pulse-muted mr-1">Browse by category:</span>
            {Object.values(BLOG_CONTENT_TYPES).map((t) => (
              <Link
                key={t.slug}
                href={`/blog/type/${t.slug}`}
                className="px-3 py-1 rounded-full bg-pulse-card border border-pulse-border text-pulse-muted hover:text-pulse-green hover:border-pulse-green/30 transition-colors"
              >
                {t.shortLabel}
              </Link>
            ))}
          </nav>
        </div>
        <BlogList posts={blogPosts} />
      </main>
      <Footer />
    </>
  );
}
