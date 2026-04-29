/**
 * Blog content-type taxonomy, centralised so that the blog index filter,
 * `/blog/type/[type]` crawlable hub pages, and the sitemap all stay in sync.
 *
 * `content_type` is the column on `public.blog_posts`. Any value present in
 * the database that is not listed here renders as-is in the UI but is NOT
 * promoted to a `/blog/type/[type]` URL.
 */

export interface BlogContentType {
  slug: string;
  label: string;
  shortLabel: string;
  metaTitle: string;
  metaDescription: string;
  lede: string;
  keywords: string[];
}

export const BLOG_CONTENT_TYPES: Record<string, BlogContentType> = {
  daily_risk_assessment: {
    slug: "daily-risk-assessment",
    label: "Daily Risk Assessment",
    shortLabel: "Daily Risk",
    metaTitle: "Daily Recession Risk Assessments — Every Weekday",
    metaDescription:
      "Every weekday, our AI analyzes 50+ recession indicators and publishes a full risk assessment with score, category breakdown, and outlook.",
    lede: "A fresh recession risk score, category breakdown, and outlook — published every weekday, powered by 50+ live macro indicators.",
    keywords: [
      "daily recession risk",
      "daily recession report",
      "recession risk score",
      "daily macro briefing",
    ],
  },
  weekly_report: {
    slug: "weekly-report",
    label: "Weekly Report",
    shortLabel: "Weekly Reports",
    metaTitle: "Weekly Recession Reports — In-Depth Macro Analysis",
    metaDescription:
      "In-depth weekly reports tying together the week's recession indicator moves, key macro stories, and forward-looking risks.",
    lede: "The definitive weekly recession brief: indicator moves, macro narrative, and forward-looking risks in one read.",
    keywords: [
      "weekly recession report",
      "weekly macro report",
      "recession analysis weekly",
    ],
  },
  deep_dive: {
    slug: "deep-dive",
    label: "Deep Dive",
    shortLabel: "Deep Dives",
    metaTitle: "Macro Deep Dives — Recession Indicator Analysis",
    metaDescription:
      "Long-form analyses of individual recession indicators, cross-indicator relationships, and historical cycles.",
    lede: "Long-form explainers on individual indicators, cross-indicator relationships, and historical cycles.",
    keywords: ["macro deep dive", "recession indicator analysis", "recession research"],
  },
  market_commentary: {
    slug: "market-commentary",
    label: "Market Commentary",
    shortLabel: "Market Commentary",
    metaTitle: "Market Commentary — Recession Risk & Markets",
    metaDescription:
      "Market commentary connecting today's equity, credit, and rates moves to the recession indicator dashboard.",
    lede: "Market commentary connecting today's equity, credit, and rates moves to the recession dashboard.",
    keywords: [
      "market commentary",
      "stocks recession risk",
      "market analysis recession",
    ],
  },
};

export const BLOG_CONTENT_TYPE_SLUGS: string[] = Object.values(BLOG_CONTENT_TYPES).map(
  (t) => t.slug,
);

export const BLOG_CONTENT_TYPE_BY_SLUG: Record<string, BlogContentType> =
  Object.fromEntries(Object.values(BLOG_CONTENT_TYPES).map((t) => [t.slug, t]));

export function getContentTypeBySlug(slug: string): BlogContentType | undefined {
  return BLOG_CONTENT_TYPE_BY_SLUG[slug];
}

export function getContentTypeKeyBySlug(slug: string): string | undefined {
  const entry = Object.entries(BLOG_CONTENT_TYPES).find(
    ([, value]) => value.slug === slug,
  );
  return entry?.[0];
}
