import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  daily_risk_assessment: "Daily Risk Assessment",
  weekly_report: "Weekly Report",
  deep_dive: "Deep Dive",
  market_commentary: "Market Commentary",
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content_type: string;
  published_at: string;
}

async function getRecentPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, content_type, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4);

    return (data as BlogPost[]) || [];
  } catch {
    return [];
  }
}

export async function RecentBlog() {
  const posts = await getRecentPosts();

  if (posts.length === 0) return null;

  const [featured, ...sidebar] = posts;

  return (
    <section className="py-24 bg-pulse-dark/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green text-xs font-semibold mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              Latest Analysis
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              AI-Powered <span className="gradient-text">Recession Reports</span>
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-pulse-green hover:underline font-semibold"
          >
            View all articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Featured post — large card */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group lg:col-span-3 flex flex-col bg-pulse-card border border-pulse-border rounded-xl overflow-hidden hover:border-pulse-green/30 transition-all duration-300"
          >
            <div className="flex-1 p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green">
                  {TYPE_LABELS[featured.content_type] || featured.content_type}
                </span>
                <span className="flex items-center gap-1 text-xs text-pulse-muted">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(featured.published_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-pulse-green transition-colors mb-3 leading-tight">
                {featured.title}
              </h3>
              <p className="text-pulse-muted text-sm sm:text-base leading-relaxed line-clamp-4 mb-6 flex-1">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-pulse-green">
                Read full analysis
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Sidebar — 3 smaller cards stacked */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {sidebar.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex-1 bg-pulse-card border border-pulse-border rounded-xl p-5 hover:border-pulse-green/30 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pulse-green/10 border border-pulse-green/20 text-pulse-green">
                    {TYPE_LABELS[post.content_type] || post.content_type}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-pulse-muted">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-pulse-green transition-colors mb-1.5 leading-snug line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-pulse-muted leading-relaxed line-clamp-2 flex-1">
                  {post.excerpt}
                </p>
              </Link>
            ))}

            {/* If fewer than 3 sidebar posts, show CTA card */}
            {sidebar.length < 3 && (
              <Link
                href="/blog"
                className="flex-1 flex items-center justify-center bg-pulse-card/50 border border-dashed border-pulse-border rounded-xl p-5 hover:border-pulse-green/30 transition-all duration-300 text-sm text-pulse-muted hover:text-pulse-green"
              >
                <span className="flex items-center gap-2 font-semibold">
                  Browse all articles
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile "View all" link */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-pulse-green hover:underline font-semibold"
          >
            View all articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
