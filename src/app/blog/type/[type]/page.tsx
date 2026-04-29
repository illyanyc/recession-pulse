import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BookOpen, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import {
  BLOG_CONTENT_TYPES,
  BLOG_CONTENT_TYPE_SLUGS,
  getContentTypeBySlug,
  getContentTypeKeyBySlug,
} from "@/lib/blog-taxonomy";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ type: string }>;
}

export async function generateStaticParams() {
  return BLOG_CONTENT_TYPE_SLUGS.map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const entry = getContentTypeBySlug(type);
  if (!entry) return {};

  return {
    title: entry.metaTitle,
    description: entry.metaDescription,
    keywords: entry.keywords,
    openGraph: {
      type: "website",
      siteName: "RecessionPulse",
      title: entry.metaTitle,
      description: entry.metaDescription,
      url: `https://recessionpulse.com/blog/type/${type}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: entry.label }],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.metaTitle,
      description: entry.metaDescription,
      images: ["/og-image.png"],
    },
    alternates: { canonical: `https://recessionpulse.com/blog/type/${type}` },
  };
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content_type: string;
  published_at: string;
  keywords: string[];
}

export default async function BlogTypePage({ params }: PageProps) {
  const { type } = await params;
  const entry = getContentTypeBySlug(type);
  if (!entry) notFound();

  const columnKey = getContentTypeKeyBySlug(type);
  if (!columnKey) notFound();

  let posts: BlogPost[] = [];
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, content_type, published_at, keywords")
      .eq("status", "published")
      .eq("content_type", columnKey)
      .order("published_at", { ascending: false })
      .limit(200);
    posts = (data as BlogPost[]) || [];
  } catch {
    // supabase unavailable at build time
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: entry.metaTitle,
    url: `https://recessionpulse.com/blog/type/${type}`,
    description: entry.metaDescription,
    isPartOf: {
      "@type": "WebSite",
      name: "RecessionPulse",
      url: "https://recessionpulse.com",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 50).map((p, idx) => ({
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://recessionpulse.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://recessionpulse.com/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.label,
        item: `https://recessionpulse.com/blog/type/${type}`,
      },
    ],
  };

  const otherTypes = Object.values(BLOG_CONTENT_TYPES).filter((t) => t.slug !== type);

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm text-pulse-muted mb-6">
            <Link href="/" className="hover:text-pulse-green">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-pulse-green">
              Blog
            </Link>
            <span>/</span>
            <span className="text-white">{entry.label}</span>
          </nav>

          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              {posts.length} article{posts.length === 1 ? "" : "s"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {entry.label}
            </h1>
            <p className="text-lg text-pulse-muted max-w-2xl">{entry.lede}</p>
          </header>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-pulse-card border border-pulse-border rounded-xl">
              <BookOpen className="h-10 w-10 text-pulse-muted mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-white mb-2">
                No articles in this category yet
              </h2>
              <p className="text-pulse-muted text-sm mb-6">
                Check back soon — new posts are published daily.
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-pulse-green hover:underline text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all posts
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 mb-10">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-pulse-card border border-pulse-border rounded-xl p-6 hover:border-pulse-green/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green">
                      {entry.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-pulse-muted">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-pulse-green transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-pulse-muted line-clamp-2">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          )}

          {otherTypes.length > 0 && (
            <section className="border-t border-pulse-border pt-10">
              <h2 className="text-lg font-bold text-white mb-4">Other categories</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {otherTypes.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/blog/type/${t.slug}`}
                    className="group flex items-center justify-between bg-pulse-card border border-pulse-border rounded-xl p-4 hover:border-pulse-green/30 transition-all"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-pulse-green transition-colors">
                        {t.label}
                      </div>
                      <div className="text-xs text-pulse-muted line-clamp-1">
                        {t.lede}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-pulse-muted group-hover:text-pulse-green flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
