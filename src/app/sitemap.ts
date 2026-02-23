import { MetadataRoute } from "next";
import { ALL_INDICATOR_SLUGS } from "@/lib/indicators-metadata";

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
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
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
  ];

  const indicatorPages: MetadataRoute.Sitemap = ALL_INDICATOR_SLUGS.map((slug) => ({
    url: `${baseUrl}/indicators/${slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, content_type, published_at, updated_at")
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
    }
  } catch {
    /* blog table may not exist yet */
  }

  return [...staticPages, ...indicatorPages, ...blogPages];
}
