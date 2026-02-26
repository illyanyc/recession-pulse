import { Metadata } from "next";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { NewsletterSignup } from "@/components/shared/NewsletterSignup";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

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
    title: "RecessionPulse Blog — Weekly Recession Reports & Analysis",
    description:
      "Data-driven weekly recession reports, indicator deep dives, and market commentary.",
    url: "https://recessionpulse.com/blog",
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

const TYPE_LABELS: Record<string, string> = {
  daily_risk_assessment: "Daily Risk Assessment",
  weekly_report: "Weekly Report",
  deep_dive: "Deep Dive",
  market_commentary: "Market Commentary",
};

export default async function BlogIndexPage() {
  let blogPosts: BlogPost[] = [];

  try {
    const supabase = createServiceClient();

    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, content_type, published_at, keywords")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);

    blogPosts = (posts as BlogPost[]) || [];
  } catch {
    // Supabase unavailable at build time
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-6">
              <BookOpen className="h-3.5 w-3.5" />
              Data-Driven Analysis
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Recession Analysis & Reports
            </h1>
            <p className="text-lg text-pulse-muted max-w-2xl mx-auto">
              Weekly recession indicator reports, deep-dive analyses, and real-time
              market commentary powered by data.
            </p>
          </div>

          {/* Newsletter signup */}
          <div className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-12">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-1">
                  Free Weekly Recession Report
                </h2>
                <p className="text-sm text-pulse-muted">
                  Get our weekly analysis delivered to your inbox. No spam, unsubscribe anytime.
                </p>
              </div>
              <NewsletterSignup />
            </div>
          </div>

          {/* Posts */}
          {blogPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-12 w-12 text-pulse-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                First report coming soon
              </h2>
              <p className="text-pulse-muted mb-6">
                Our AI-powered weekly recession reports launch this week.
                Sign up above to be notified.
              </p>
              <Link
                href="/indicators"
                className="inline-flex items-center gap-2 text-pulse-green hover:underline"
              >
                Browse live indicators
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-pulse-card border border-pulse-border rounded-xl p-6 hover:border-pulse-green/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
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
                  <h2 className="text-xl font-bold text-white group-hover:text-pulse-green transition-colors mb-2">
                    {post.title}
                  </h2>
                  <p className="text-pulse-muted text-sm line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-pulse-green">
                    Read analysis
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
