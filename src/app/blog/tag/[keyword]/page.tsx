import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Tag, Calendar, BookOpen, ArrowLeft } from "lucide-react";
import { BLOG_CONTENT_TYPES } from "@/lib/blog-taxonomy";

export const revalidate = 3600;

// Minimum number of posts required for a tag to become a crawlable URL.
// Below this, tag pages are thin content and are not generated.
const MIN_POSTS_PER_TAG = 5;

interface PageProps {
  params: Promise<{ keyword: string }>;
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content_type: string;
  published_at: string;
  keywords: string[];
}

function tagSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Returns the list of tag slugs that meet the minimum-post threshold, keyed
 * by slug with the canonical display string as value (the first raw keyword
 * observed in `blog_posts.keywords` that maps to that slug).
 */
async function getEligibleTags(): Promise<Map<string, { display: string; count: number }>> {
  const tags = new Map<string, { display: string; count: number }>();
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("keywords")
      .eq("status", "published")
      .limit(500);
    if (!data) return tags;
    for (const row of data) {
      const kws = Array.isArray(row.keywords) ? (row.keywords as string[]) : [];
      for (const raw of kws) {
        const slug = tagSlug(raw);
        if (!slug) continue;
        const existing = tags.get(slug);
        if (existing) {
          existing.count += 1;
        } else {
          tags.set(slug, { display: raw, count: 1 });
        }
      }
    }
  } catch {
    // supabase unavailable at build time
  }
  return tags;
}

export async function generateStaticParams() {
  const tags = await getEligibleTags();
  return Array.from(tags.entries())
    .filter(([, v]) => v.count >= MIN_POSTS_PER_TAG)
    .map(([slug]) => ({ keyword: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { keyword } = await params;
  const tags = await getEligibleTags();
  const entry = tags.get(keyword);
  if (!entry || entry.count < MIN_POSTS_PER_TAG) return {};
  const title = `${humanize(keyword)} — Blog Archive`;
  const description = `All RecessionPulse posts tagged "${entry.display}" — ${entry.count} articles.`;
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "RecessionPulse",
      title,
      description,
      url: `https://recessionpulse.com/blog/tag/${keyword}`,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: humanize(keyword) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    alternates: { canonical: `https://recessionpulse.com/blog/tag/${keyword}` },
  };
}

export default async function BlogTagPage({ params }: PageProps) {
  const { keyword } = await params;
  const tags = await getEligibleTags();
  const entry = tags.get(keyword);
  if (!entry || entry.count < MIN_POSTS_PER_TAG) notFound();

  let posts: BlogPost[] = [];
  try {
    const supabase = createServiceClient();
    // Supabase `contains` on array columns accepts a raw value; match by exact keyword.
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, content_type, published_at, keywords")
      .eq("status", "published")
      .contains("keywords", [entry.display])
      .order("published_at", { ascending: false })
      .limit(200);
    posts = (data as BlogPost[]) || [];

    // If the canonical `display` spelling doesn't exact-match all variants,
    // fall back to a full scan filtered by normalized slug.
    if (posts.length < entry.count) {
      const { data: all } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, content_type, published_at, keywords")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(500);
      posts = ((all as BlogPost[]) || []).filter((p) =>
        (p.keywords ?? []).some((k) => tagSlug(k) === keyword),
      );
    }
  } catch {
    // supabase unavailable at build time
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${humanize(keyword)} — Blog Archive`,
    url: `https://recessionpulse.com/blog/tag/${keyword}`,
    description: `All RecessionPulse posts tagged "${entry.display}".`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 50).map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `https://recessionpulse.com/blog/${p.slug}`,
        name: p.title,
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
            <span className="text-white">Tag: {humanize(keyword)}</span>
          </nav>

          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-4">
              <Tag className="h-3.5 w-3.5" />
              {posts.length} article{posts.length === 1 ? "" : "s"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              {humanize(keyword)}
            </h1>
            <p className="text-lg text-pulse-muted max-w-2xl">
              Every RecessionPulse article tagged &ldquo;{entry.display}&rdquo; — sorted
              newest first.
            </p>
          </header>

          {posts.length === 0 ? (
            <div className="text-center py-16 bg-pulse-card border border-pulse-border rounded-xl">
              <BookOpen className="h-10 w-10 text-pulse-muted mx-auto mb-3" />
              <p className="text-pulse-muted text-sm">No articles found.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {posts.map((post) => {
                const typeKey = post.content_type as keyof typeof BLOG_CONTENT_TYPES;
                const typeLabel = BLOG_CONTENT_TYPES[typeKey]?.label ?? post.content_type;
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group bg-pulse-card border border-pulse-border rounded-xl p-6 hover:border-pulse-green/30 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green">
                        {typeLabel}
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
                );
              })}
            </div>
          )}

          <Link
            href="/blog"
            className="mt-10 inline-flex items-center gap-2 text-pulse-green hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all posts
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
