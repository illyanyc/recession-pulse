import { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { BlogList } from "./BlogList";

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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-pulse-darker pt-24 pb-16">
        <BlogList posts={blogPosts} />
      </main>
      <Footer />
    </>
  );
}
