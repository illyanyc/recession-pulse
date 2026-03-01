"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { NewsletterSignup } from "@/components/shared/NewsletterSignup";
import { Calendar, ArrowRight, BookOpen, Search, ChevronLeft, ChevronRight } from "lucide-react";

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

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "daily_risk_assessment", label: "Daily Risk" },
  { value: "weekly_report", label: "Weekly Reports" },
  { value: "deep_dive", label: "Deep Dives" },
  { value: "market_commentary", label: "Commentary" },
];

const POSTS_PER_PAGE = 12;

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = posts;

    if (typeFilter !== "all") {
      result = result.filter((p) => p.content_type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.keywords?.some((k) => k.toLowerCase().includes(q))
      );
    }

    return result;
  }, [posts, typeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
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
      <div className="bg-pulse-card border border-pulse-border rounded-xl p-6 mb-8">
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

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pulse-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 bg-pulse-card border border-pulse-border rounded-lg text-white placeholder:text-pulse-muted text-sm focus:outline-none focus:border-pulse-green/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1); }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                typeFilter === f.value
                  ? "bg-pulse-green text-black"
                  : "bg-pulse-card border border-pulse-border text-pulse-muted hover:border-pulse-green/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {paginated.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-pulse-muted mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            {search || typeFilter !== "all" ? "No matching articles" : "First report coming soon"}
          </h2>
          <p className="text-pulse-muted mb-6">
            {search || typeFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Our AI-powered recession reports launch this week. Sign up above to be notified."}
          </p>
          {(search || typeFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); setTypeFilter("all"); setPage(1); }}
              className="text-pulse-green hover:underline text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {paginated.map((post) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-pulse-card border border-pulse-border text-pulse-muted hover:border-pulse-green/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] ?? 0) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-pulse-muted">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === item
                          ? "bg-pulse-green text-black"
                          : "bg-pulse-card border border-pulse-border text-pulse-muted hover:border-pulse-green/30"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-pulse-card border border-pulse-border text-pulse-muted hover:border-pulse-green/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-pulse-muted mt-4">
            Showing {(currentPage - 1) * POSTS_PER_PAGE + 1}–{Math.min(currentPage * POSTS_PER_PAGE, filtered.length)} of {filtered.length} articles
          </p>
        </>
      )}
    </div>
  );
}
