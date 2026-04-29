import type { IndicatorCategory } from "@/types";

/**
 * Pillar copy for each `/indicators/category/[category]` hub page.
 *
 * Each entry powers:
 *  - `<title>` / meta description
 *  - H1 + intro paragraph
 *  - "Why this category matters" explainer
 *  - FAQPage JSON-LD questions (derived from the FAQ array)
 *
 * Copy is written to be authoritative, evergreen, and specific enough to
 * rank for long-tail queries like "what are leading recession indicators"
 * without becoming stale.
 */

export interface CategoryFaqItem {
  question: string;
  answer: string;
}

export interface CategoryPillar {
  slug: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  lede: string;
  keywords: string[];
  whyItMatters: string;
  howToRead: string;
  historicalLeadTime: string;
  faqs: CategoryFaqItem[];
}

export const CATEGORY_SLUGS: Record<IndicatorCategory, string> = {
  primary: "primary",
  secondary: "secondary",
  housing: "housing",
  business_activity: "business-activity",
  credit_stress: "credit-stress",
  market: "market",
  liquidity: "liquidity",
  realtime: "realtime",
};

export const CATEGORY_FROM_SLUG: Record<string, IndicatorCategory> =
  Object.fromEntries(
    Object.entries(CATEGORY_SLUGS).map(([k, v]) => [v, k as IndicatorCategory]),
  );

export const CATEGORY_PILLARS: Record<IndicatorCategory, CategoryPillar> = {
  primary: {
    slug: "primary",
    h1: "Primary Recession Indicators",
    metaTitle: "Primary Recession Indicators — Sahm Rule, Yield Curve, LEI & More",
    metaDescription:
      "The core recession indicators with the strongest historical track record: Sahm Rule, 2s10s yield curve, Conference Board LEI, unemployment, JOLTS, and more. Updated daily.",
    lede: "Primary indicators are the signals with the strongest historical track record for calling US recessions — the Sahm Rule, the 2s10s yield curve, and the Conference Board LEI 3Ds rule have each flagged every NBER-dated recession since 1970 in real time.",
    keywords: [
      "primary recession indicators",
      "sahm rule",
      "yield curve inversion",
      "leading economic index",
      "NBER recession indicators",
      "best recession indicators",
    ],
    whyItMatters:
      "Primary indicators deserve more weight than any other category because they are the ones Wall Street, the Fed, and the NBER itself watch. When multiple primary indicators flash red at the same time, the base-rate probability of a recession within 6–18 months climbs above 70%.",
    howToRead:
      "Read primary indicators as a breadth signal: a single primary signal flashing red is a warning, two is a confirmation, three or more is nearly deterministic. Focus on trend direction over the past 3-6 months rather than a single print.",
    historicalLeadTime:
      "Primary indicators lead recessions by 6–18 months on average. The yield curve typically leads the deepest, at 12–18 months before the first quarter of contraction.",
    faqs: [
      {
        question: "Which primary recession indicator is most reliable?",
        answer:
          "The Sahm Rule has the cleanest historical record — it has signaled every US recession since 1970 in real time with zero false positives, triggering when the 3-month moving average of the unemployment rate rises 0.5 percentage points above its 12-month low.",
      },
      {
        question: "How far in advance do primary indicators warn of recession?",
        answer:
          "Primary indicators typically lead recessions by 6 to 18 months. The 2s10s yield curve leads the deepest at 12-18 months, while the Sahm Rule tends to trigger closer to or just after the cycle peak.",
      },
    ],
  },
  secondary: {
    slug: "secondary",
    h1: "Secondary Recession Indicators",
    metaTitle: "Secondary Recession Indicators — ISM PMI, Consumer Sentiment, Initial Claims",
    metaDescription:
      "Confirming recession indicators: ISM Manufacturing PMI, consumer sentiment, Fed Funds rate, initial jobless claims, and GDP growth. Updated daily.",
    lede: "Secondary indicators confirm what the primary signals suggest. ISM PMI, consumer sentiment, Fed Funds, initial claims, and GDP growth each capture a different dimension of cyclical momentum and rarely disagree with primary signals for long.",
    keywords: [
      "secondary recession indicators",
      "ISM PMI recession",
      "consumer sentiment recession",
      "initial claims recession",
      "Fed Funds rate recession",
    ],
    whyItMatters:
      "Secondary indicators reduce false-positive risk. When the Sahm Rule flashes but ISM, initial claims, and GDPNow are all stable, the primary signal is often a head-fake driven by labor-supply noise rather than genuine contraction.",
    howToRead:
      "Secondary indicators work best as a confirming panel. Look for at least two of four flashing the same direction before adjusting your recession probability.",
    historicalLeadTime:
      "Secondary indicators lead recessions by 3 to 9 months. ISM PMI under 48 for three consecutive months has a strong recession-confirmation track record.",
    faqs: [
      {
        question: "What does ISM Manufacturing PMI below 50 mean?",
        answer:
          "A PMI reading below 50 means the manufacturing sector is contracting. Below 48 for three consecutive months has historically coincided with or preceded recessions in eight of the last nine cycles.",
      },
    ],
  },
  housing: {
    slug: "housing",
    h1: "Housing & Construction Recession Indicators",
    metaTitle: "Housing Recession Indicators — Building Permits, Housing Starts",
    metaDescription:
      "Housing and construction indicators: building permits and housing starts. Residential investment leads the business cycle by 3-5 quarters.",
    lede: "Housing is the most interest-rate-sensitive part of the US economy and the earliest physical-economy signal of a cyclical turn. Residential investment peaks a full year before GDP in most recessions since 1970.",
    keywords: [
      "housing recession indicators",
      "building permits recession",
      "housing starts recession",
      "residential investment recession",
    ],
    whyItMatters:
      "Housing permits and starts lead the business cycle by 3–5 quarters. When permits drop 15% year-over-year, a recession has followed within 12 months in every cycle since 1960.",
    howToRead:
      "Focus on year-over-year change and 3-month moving averages to cut through volatility. A YoY decline of 10% or more combined with rising inventory is the classic housing-recession setup.",
    historicalLeadTime:
      "Housing permits lead recessions by 9-15 months, with peak-to-trough declines of 30-50% during severe contractions.",
    faqs: [
      {
        question: "Why do building permits lead the business cycle?",
        answer:
          "Permits are filed months before construction, construction precedes sales, and housing employment and materials demand flow into GDP 3-5 quarters later. This time-lag makes permits one of the earliest recession indicators available.",
      },
    ],
  },
  business_activity: {
    slug: "business-activity",
    h1: "Business Activity Recession Indicators",
    metaTitle: "Business Activity Recession Indicators — Corporate Profits, NFIB, Inventories",
    metaDescription:
      "Business-side recession indicators: corporate profits, NFIB small business optimism, inventory-to-sales ratio, and SLOOS lending standards.",
    lede: "Business-side indicators track what firms are doing, not what households feel. Corporate profits, NFIB optimism, and the inventory-to-sales ratio each capture the supply side of the cycle that precedes layoffs and consumer retrenchment.",
    keywords: [
      "business activity recession",
      "corporate profits recession",
      "NFIB small business optimism",
      "inventory to sales ratio",
      "SLOOS tightening",
    ],
    whyItMatters:
      "Firms cut capex and hiring before households cut spending. Watching the supply side gives you a 3-6 month head start on the demand-side data everyone else is watching.",
    howToRead:
      "Corporate profits YoY below zero for two consecutive quarters is the single cleanest business-side recession tell in the post-WWII era.",
    historicalLeadTime:
      "Business-side indicators lead recessions by 2-8 months. SLOOS tightening above 40% of banks leads by 6-9 months.",
    faqs: [
      {
        question: "What does the inventory-to-sales ratio signal?",
        answer:
          "A rising inventory-to-sales ratio means firms are carrying more stock relative to demand. Sustained increases signal slowing final demand and often precede production cuts and layoffs.",
      },
    ],
  },
  credit_stress: {
    slug: "credit-stress",
    h1: "Consumer Credit Stress Recession Indicators",
    metaTitle: "Credit Stress Recession Indicators — Delinquencies, Savings, Debt Service",
    metaDescription:
      "Consumer credit stress indicators: personal savings rate, credit card delinquencies, debt service ratio, SLOOS lending standards, and national debt burden.",
    lede: "Credit stress indicators track whether American households can still service their debt. When savings run out, delinquencies climb, and lending standards tighten simultaneously, consumer spending — 68% of GDP — contracts sharply.",
    keywords: [
      "credit stress indicators",
      "credit card delinquency recession",
      "personal savings rate",
      "debt service ratio",
      "consumer credit cycle",
    ],
    whyItMatters:
      "Consumers cannot sustain spending when debt service exceeds 10% of disposable income or savings fall below 3%. Both thresholds have preceded every consumer-led recession since 1980.",
    howToRead:
      "Watch the direction over 3-6 months, not the level. Delinquencies climbing from 2% to 3% matters more than whether the absolute number sounds high.",
    historicalLeadTime:
      "Credit stress indicators lead recessions by 3-12 months. Credit card delinquency turns up roughly 6 months before unemployment.",
    faqs: [
      {
        question: "What savings rate signals recession risk?",
        answer:
          "A personal savings rate below 3% has historically preceded every consumer-led recession. When households run out of cushion, any income shock translates directly into spending cuts.",
      },
    ],
  },
  market: {
    slug: "market",
    h1: "Market-Based Recession Indicators",
    metaTitle: "Market Recession Indicators — VIX, Credit Spreads, NFCI, Dollar Index",
    metaDescription:
      "Market-based recession indicators: VIX, NFCI, credit spreads, copper-gold ratio, NY Fed recession probability, DXY, and equity-market valuations.",
    lede: "Markets aggregate information faster than any economist. The VIX, NFCI, credit spreads, copper-gold ratio, and NY Fed recession probability model each distill millions of trades into a real-time recession gauge.",
    keywords: [
      "market recession indicators",
      "VIX recession",
      "credit spreads recession",
      "NFCI financial conditions",
      "copper gold ratio",
      "NY Fed recession probability",
    ],
    whyItMatters:
      "Markets price in recession risk weeks before the data confirms it. When three or more market indicators move in the same direction at the same time, the signal is rarely a head-fake.",
    howToRead:
      "Market indicators are noisy — use 20-day moving averages and confirm with at least two non-market signals before acting.",
    historicalLeadTime:
      "Market indicators lead recessions by 1-6 months, with credit spreads leading the earliest and equity-market valuations the latest.",
    faqs: [
      {
        question: "What VIX level signals recession risk?",
        answer:
          "A sustained VIX above 30 for more than 10 trading days historically coincides with growth scares. Above 40 typically marks outright recession repricing or major financial stress events.",
      },
    ],
  },
  liquidity: {
    slug: "liquidity",
    h1: "Liquidity & Monetary Recession Indicators",
    metaTitle: "Liquidity Recession Indicators — M2, ON RRP, Bank Unrealized Losses",
    metaDescription:
      "Liquidity and monetary indicators: M2 money supply, Fed ON RRP facility balances, bank unrealized losses, and US interest expense as share of GDP.",
    lede: "Liquidity indicators track the plumbing of the financial system. When M2 contracts year-over-year, bank unrealized losses spike, or the ON RRP drains rapidly, the monetary transmission mechanism is under stress — and that stress almost always precedes recession.",
    keywords: [
      "liquidity recession indicators",
      "M2 money supply",
      "ON RRP facility",
      "bank unrealized losses",
      "US interest expense",
    ],
    whyItMatters:
      "M2 contracting YoY is rare — it has only happened twice in 100 years, both times preceding severe recessions. Liquidity indicators pick up stress that does not yet show up in output or labor data.",
    howToRead:
      "Focus on the rate of change, not the level. Rapid tightening is the signal — a falling M2 growth rate is more informative than a negative YoY print already locked in.",
    historicalLeadTime:
      "Liquidity indicators lead recessions by 6-18 months. M2 YoY leads by roughly 12 months in post-1990 cycles.",
    faqs: [
      {
        question: "What does M2 contracting mean?",
        answer:
          "M2 YoY contracting means the broad money supply is actually shrinking in nominal terms. This is historically rare and has accompanied some of the most severe recessions on record, including 1930-33 and 2022-23.",
      },
    ],
  },
  realtime: {
    slug: "realtime",
    h1: "Real-Time & High-Frequency Recession Indicators",
    metaTitle: "Real-Time Recession Indicators — GDPNow, Freight Index, Copper-Gold Ratio",
    metaDescription:
      "High-frequency recession indicators: Atlanta Fed GDPNow, Cass freight index, and copper-gold ratio for real-time recession tracking.",
    lede: "Real-time indicators update weekly or daily and give you the fastest possible read on the economy. GDPNow, the Cass freight index, and the copper-gold ratio together provide a same-week snapshot of what the slower monthly data will eventually confirm.",
    keywords: [
      "real time recession indicators",
      "high frequency recession",
      "GDPNow recession",
      "freight index recession",
      "copper gold ratio",
    ],
    whyItMatters:
      "Monthly data lags by 4-8 weeks. Real-time indicators close that gap and let you react before the official numbers confirm the turn.",
    howToRead:
      "Real-time indicators are volatile — use 4-week moving averages and confirm with at least one monthly signal.",
    historicalLeadTime:
      "Real-time indicators coincide with or slightly lead the economy in real time. Their value is speed, not lead time.",
    faqs: [
      {
        question: "How accurate is GDPNow?",
        answer:
          "GDPNow's final estimate before BEA release is typically within 0.4 percentage points of the advance GDP print. It is most useful for direction and magnitude, not decimal-level precision.",
      },
    ],
  },
};
