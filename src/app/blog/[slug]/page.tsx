import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ShareButtons } from "@/components/shared/ShareButtons";
import { NewsletterSignup } from "@/components/shared/NewsletterSignup";
import { Calendar, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  meta_description: string;
  keywords: string[];
  content_type: string;
  published_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  daily_risk_assessment: "Daily Risk Assessment",
  weekly_report: "Weekly Report",
  deep_dive: "Deep Dive",
  market_commentary: "Market Commentary",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let post: { title: string; meta_description: string; keywords: string[]; og_image_url?: string } | null = null;

  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("title, meta_description, keywords, og_image_url")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    post = data;
  } catch {
    // Supabase unavailable at build time
  }

  if (!post) return {};

  return {
    title: post.title,
    description: post.meta_description,
    keywords: post.keywords,
    openGraph: {
      type: "article",
      siteName: "RecessionPulse",
      title: `${post.title} — RecessionPulse`,
      description: post.meta_description,
      url: `https://recessionpulse.com/blog/${slug}`,
      images: post.og_image_url
        ? [{ url: post.og_image_url, width: 1200, height: 630, alt: post.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.meta_description,
    },
    alternates: { canonical: `https://recessionpulse.com/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post: BlogPost | null = null;
  let relatedPosts: { slug: string; title: string; excerpt: string; content_type: string; published_at: string }[] | null = null;

  try {
    const supabase = createServiceClient();

    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    post = data as BlogPost | null;

    if (post) {
      const { data: related } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, content_type, published_at")
        .eq("status", "published")
        .neq("slug", slug)
        .order("published_at", { ascending: false })
        .limit(3);
      relatedPosts = related;
    }
  } catch {
    // Supabase unavailable at build time
  }

  if (!post) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description,
    author: { "@type": "Organization", name: "RecessionPulse" },
    publisher: {
      "@type": "Organization",
      name: "RecessionPulse",
      logo: { "@type": "ImageObject", url: "https://recessionpulse.com/logo-transparent.png" },
    },
    datePublished: post.published_at,
    url: `https://recessionpulse.com/blog/${slug}`,
    mainEntityOfPage: `https://recessionpulse.com/blog/${slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://recessionpulse.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://recessionpulse.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://recessionpulse.com/blog/${slug}` },
    ],
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        <article className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-pulse-muted mb-8">
            <Link href="/" className="hover:text-pulse-green transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-pulse-green transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-white truncate max-w-[200px]">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green">
                {TYPE_LABELS[post.content_type] || post.content_type}
              </span>
              <span className="flex items-center gap-1 text-xs text-pulse-muted">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-pulse-muted">{post.excerpt}</p>
            )}
          </header>

          {/* Content */}
          <div
            className="prose prose-invert prose-green max-w-none mb-12
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-pulse-text prose-p:leading-relaxed
              prose-a:text-pulse-green prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white
              prose-li:text-pulse-text
              prose-code:text-pulse-green prose-code:bg-pulse-card prose-code:px-1 prose-code:rounded
              prose-hr:border-pulse-border"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
          />

          {/* Share */}
          <div className="border-t border-pulse-border pt-8 mb-8">
            <h3 className="text-sm font-semibold text-white mb-3">Share this article</h3>
            <ShareButtons
              url={`https://recessionpulse.com/blog/${slug}`}
              title={`${post.title} — RecessionPulse`}
            />
          </div>

          {/* Newsletter CTA */}
          <div className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-12">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">
                  Get Weekly Reports in Your Inbox
                </h2>
                <p className="text-sm text-pulse-muted">
                  Free weekly recession analysis. No spam.
                </p>
              </div>
              <NewsletterSignup />
            </div>
          </div>

          {/* Related posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">More Analysis</h2>
              <div className="space-y-4">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.slug}
                    href={`/blog/${rp.slug}`}
                    className="group flex items-center justify-between bg-pulse-card border border-pulse-border rounded-xl p-4 hover:border-pulse-green/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpen className="h-3.5 w-3.5 text-pulse-green" />
                        <span className="text-xs text-pulse-muted">
                          {TYPE_LABELS[rp.content_type] || rp.content_type}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-pulse-green transition-colors">
                        {rp.title}
                      </h3>
                    </div>
                    <ArrowRight className="h-4 w-4 text-pulse-muted flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to blog */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-pulse-green hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all articles
          </Link>
        </article>
      </main>
      <Footer />
    </>
  );
}

function markdownToHtml(md: string): string {
  let html = md;
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  html = html.replace(/^---$/gm, "<hr />");
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<ol")
      )
        return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join("\n");
  return html;
}
