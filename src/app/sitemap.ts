import { MetadataRoute } from "next";
import { ALL_INDICATOR_SLUGS } from "@/lib/indicators-metadata";
import { CATEGORY_SLUGS } from "@/lib/category-pillars";
import { GLOSSARY_SLUGS } from "@/lib/glossary";
import { HISTORICAL_RECESSION_SLUGS } from "@/lib/historical-recessions";
import { COMPARE_SLUGS } from "@/lib/compare-pairs";
import { BLOG_CONTENT_TYPE_SLUGS } from "@/lib/blog-taxonomy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://recessionpulse.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/indicators`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/embed/recession-meter`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/learn/glossary`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/learn/recessions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/indicators/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const indicatorPages: MetadataRoute.Sitemap = ALL_INDICATOR_SLUGS.map((slug) => ({
    url: `${baseUrl}/indicators/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const categoryHubPages: MetadataRoute.Sitemap = (
    Object.values(CATEGORY_SLUGS) as string[]
  ).map((slug) => ({
    url: `${baseUrl}/indicators/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const glossaryPages: MetadataRoute.Sitemap = GLOSSARY_SLUGS.map((slug) => ({
    url: `${baseUrl}/learn/glossary/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const recessionPages: MetadataRoute.Sitemap = HISTORICAL_RECESSION_SLUGS.map(
    (slug) => ({
      url: `${baseUrl}/learn/recessions/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }),
  );

  const comparePages: MetadataRoute.Sitemap = COMPARE_SLUGS.map((slug) => ({
    url: `${baseUrl}/indicators/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  const blogTypePages: MetadataRoute.Sitemap = BLOG_CONTENT_TYPE_SLUGS.map((slug) => ({
    url: `${baseUrl}/blog/type/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  let blogPages: MetadataRoute.Sitemap = [];
  let blogTagPages: MetadataRoute.Sitemap = [];
  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, content_type, keywords, published_at, updated_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(500);

    if (posts) {
      blogPages = posts.map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at || p.published_at),
        changeFrequency: p.content_type === "daily_risk_assessment" ? ("daily" as const) : ("weekly" as const),
        priority: p.content_type === "daily_risk_assessment" ? 0.75 : 0.7,
      }));

      // Promote keywords tagged on ≥5 posts to crawlable /blog/tag/[keyword]
      const tagCounts = new Map<string, number>();
      for (const p of posts) {
        const kws = Array.isArray(p.keywords) ? (p.keywords as string[]) : [];
        for (const raw of kws) {
          const key = tagSlug(raw);
          if (!key) continue;
          tagCounts.set(key, (tagCounts.get(key) ?? 0) + 1);
        }
      }
      blogTagPages = Array.from(tagCounts.entries())
        .filter(([, count]) => count >= 5)
        .map(([slug]) => ({
          url: `${baseUrl}/blog/tag/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.55,
        }));
    }
  } catch {
    /* blog table may not exist yet */
  }

  return [
    ...staticPages,
    ...indicatorPages,
    ...categoryHubPages,
    ...glossaryPages,
    ...recessionPages,
    ...comparePages,
    ...blogTypePages,
    ...blogTagPages,
    ...blogPages,
  ];
}

function tagSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
