import type { IndicatorCategory } from "@/types";

/**
 * Canonical slug -> category mapping for every indicator that has a live
 * reading or SEO surface.
 *
 * Used by:
 *  - `/indicators` list (filter + category pillars)
 *  - `/indicators/[slug]` related-indicator block (category siblings)
 *  - `/indicators/category/[category]` hub pages
 *
 * Keep in sync with `INDICATOR_DEFINITIONS` in `@/lib/constants` for live
 * indicators, and with `INDICATORS_SEO` in `@/lib/indicators-metadata` for
 * SEO-only slugs.
 */
export const SLUG_CATEGORY_MAP: Record<string, IndicatorCategory> = {
  "sahm-rule": "primary",
  "yield-curve-2s10s": "primary",
  "yield-curve-2s30s": "primary",
  "conference-board-lei": "primary",
  "ism-manufacturing": "primary",
  "unemployment-rate": "primary",
  "real-personal-income": "primary",
  "industrial-production": "primary",
  "jolts-quits-rate": "primary",
  "temp-help-services": "primary",
  "ny-fed-recession-prob": "primary",
  "sos-recession": "primary",
  "initial-claims": "secondary",
  "consumer-sentiment": "secondary",
  "fed-funds-rate": "secondary",
  "gdp-growth": "secondary",
  "jpm-recession-probability": "secondary",
  "building-permits": "housing",
  "housing-starts": "housing",
  "corporate-profits": "business_activity",
  "nfib-optimism": "business_activity",
  "inventory-sales-ratio": "business_activity",
  "sloos-lending": "business_activity",
  "personal-savings-rate": "credit_stress",
  "credit-card-delinquency": "credit_stress",
  "debt-service-ratio": "credit_stress",
  "us-national-debt": "credit_stress",
  "debt-to-gdp-ratio": "credit_stress",
  "nfci": "market",
  "credit-spreads": "market",
  "vix": "market",
  "dxy-dollar-index": "market",
  "emerging-markets": "market",
  "gold-silver-ratio": "market",
  "sp500": "market",
  "dow-jones": "market",
  "nasdaq": "market",
  "sp500-gdp": "market",
  "djia-gdp": "market",
  "nasdaq-gdp": "market",
  "sp500-pe": "market",
  "djia-pe": "market",
  "nasdaq-pe": "market",
  "m2-money-supply": "liquidity",
  "on-rrp-facility": "liquidity",
  "bank-unrealized-losses": "liquidity",
  "us-interest-expense": "liquidity",
  "gdpnow": "realtime",
  "copper-gold-ratio": "realtime",
  "freight-index": "realtime",
};

/**
 * Returns up to `limit` slugs from the same category as `slug`, excluding
 * `slug` itself. Falls back to adjacent-category siblings if fewer than
 * `limit` matches exist in the primary category.
 */
export function getCategorySiblings(
  slug: string,
  allSlugs: readonly string[],
  limit = 3,
): string[] {
  const category = SLUG_CATEGORY_MAP[slug];
  if (!category) {
    return allSlugs.filter((s) => s !== slug).slice(0, limit);
  }

  const sameCategory = allSlugs.filter(
    (s) => s !== slug && SLUG_CATEGORY_MAP[s] === category,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const fillers = allSlugs.filter(
    (s) => s !== slug && SLUG_CATEGORY_MAP[s] !== category,
  );
  return [...sameCategory, ...fillers].slice(0, limit);
}

/**
 * Returns all slugs belonging to a given category, preserving discovery
 * order from `allSlugs`.
 */
export function getSlugsByCategory(
  category: IndicatorCategory,
  allSlugs: readonly string[],
): string[] {
  return allSlugs.filter((s) => SLUG_CATEGORY_MAP[s] === category);
}
