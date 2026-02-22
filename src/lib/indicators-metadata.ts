export interface IndicatorSEO {
  slug: string;
  title: string;
  shortName: string;
  metaDescription: string;
  keywords: string[];
  whatIsIt: string;
  whyItMatters: string;
  historicalContext: string;
}

export const INDICATORS_SEO: Record<string, IndicatorSEO> = {
  "sahm-rule": {
    slug: "sahm-rule",
    title: "Sahm Rule Recession Indicator",
    shortName: "Sahm Rule",
    metaDescription:
      "Track the Sahm Rule in real time. Current value, historical chart, and AI analysis. The Sahm Rule has correctly signaled every US recession since 1970.",
    keywords: [
      "sahm rule",
      "sahm rule current value",
      "sahm rule recession indicator",
      "claudia sahm recession",
      "sahm rule 2026",
      "unemployment recession trigger",
    ],
    whatIsIt:
      "The Sahm Rule identifies recessions when the 3-month moving average of the national unemployment rate rises by 0.50 percentage points or more above its low from the previous 12 months. Created by economist Claudia Sahm, it provides a real-time recession signal based on labor market deterioration.",
    whyItMatters:
      "The Sahm Rule has correctly identified every U.S. recession since 1970 in real time — with zero false positives. When this indicator triggers, it historically means a recession has already begun or is imminent.",
    historicalContext:
      "The indicator was formalized by Federal Reserve economist Claudia Sahm in 2019 as a way to trigger automatic fiscal stimulus. Unlike lagging indicators like GDP, the Sahm Rule provides near-instant recession detection using monthly employment data.",
  },
  "yield-curve-2s10s": {
    slug: "yield-curve-2s10s",
    title: "Yield Curve (2s10s) Spread",
    shortName: "Yield Curve 2s10s",
    metaDescription:
      "Monitor the 2-year/10-year Treasury yield curve spread in real time. Yield curve inversions have preceded every US recession since 1955.",
    keywords: [
      "yield curve",
      "yield curve inversion",
      "2s10s spread",
      "treasury yield curve",
      "yield curve recession",
      "inverted yield curve 2026",
    ],
    whatIsIt:
      "The 2s10s yield curve measures the difference between 10-year and 2-year U.S. Treasury yields. When short-term rates exceed long-term rates (inversion), it signals that bond markets expect economic weakness ahead.",
    whyItMatters:
      "Yield curve inversions have preceded every U.S. recession since 1955, with only one false signal. Historically, recessions follow 6–18 months after the curve un-inverts, making this one of the most reliable leading indicators.",
    historicalContext:
      "The 2s10s spread inverted in 2022–2023 for the longest sustained period in history. Prior inversions in 2000 and 2006 preceded the dot-com bust and the Great Financial Crisis respectively.",
  },
  "yield-curve-2s30s": {
    slug: "yield-curve-2s30s",
    title: "Yield Curve (2s30s) Spread",
    shortName: "Yield Curve 2s30s",
    metaDescription:
      "Track the 2-year/30-year Treasury yield curve spread. A wider view of the term structure that signals long-term economic expectations.",
    keywords: [
      "yield curve 2s30s",
      "30 year treasury spread",
      "treasury yield curve",
      "long-term yield curve",
    ],
    whatIsIt:
      "The 2s30s spread compares 30-year and 2-year Treasury yields. It captures long-duration economic expectations and is sensitive to both inflation expectations and growth outlook over a full business cycle.",
    whyItMatters:
      "The 2s30s spread provides a broader view of the term structure than the 2s10s. A steepening curve after inversion can signal that the Fed is about to cut rates — often a late-cycle confirmation that recession is approaching.",
    historicalContext:
      "This spread tends to move with the 2s10s but with larger amplitude. Its steepening in late cycle environments has historically coincided with equity market peaks.",
  },
  "conference-board-lei": {
    slug: "conference-board-lei",
    title: "Conference Board Leading Economic Index (LEI)",
    shortName: "Conference Board LEI",
    metaDescription:
      "Track the Conference Board LEI and the 3Ds Rule. When depth, diffusion, and duration align, recession probability exceeds 85%.",
    keywords: [
      "conference board LEI",
      "leading economic index",
      "3Ds rule recession",
      "conference board recession indicator",
      "LEI index 2026",
    ],
    whatIsIt:
      "The Conference Board Leading Economic Index (LEI) aggregates 10 economic components into a single composite designed to signal turning points in the business cycle 7 months ahead. The 3Ds Rule evaluates its depth, diffusion, and duration.",
    whyItMatters:
      "When all three Ds trigger simultaneously — depth (6-month growth below -4.3%), diffusion (>50% of components declining), and duration (sustained decline) — historical recession probability exceeds 85%.",
    historicalContext:
      "The LEI has declined before every recession since its creation. The 3Ds framework was developed to filter out false signals and has successfully identified genuine recessions while avoiding false alarms.",
  },
  "ism-manufacturing": {
    slug: "ism-manufacturing",
    title: "ISM Manufacturing PMI",
    shortName: "ISM Manufacturing",
    metaDescription:
      "Real-time ISM Manufacturing PMI tracking. Sub-50 readings signal manufacturing contraction and potential recession risk.",
    keywords: [
      "ISM manufacturing PMI",
      "ISM PMI today",
      "manufacturing recession",
      "PMI index current",
      "ISM manufacturing index 2026",
    ],
    whatIsIt:
      "The ISM Manufacturing Purchasing Managers' Index surveys manufacturing executives on new orders, production, employment, deliveries, and inventories. A reading above 50 signals expansion; below 50 signals contraction.",
    whyItMatters:
      "Sustained readings below 50 have preceded or coincided with every post-war recession. The manufacturing sector often leads the broader economy into downturns, making the PMI an early warning system.",
    historicalContext:
      "The ISM PMI dropped below 50 before both the 2001 and 2008 recessions. Extended sub-50 readings (6+ months) have a strong correlation with GDP contraction.",
  },
  "initial-claims": {
    slug: "initial-claims",
    title: "Initial Jobless Claims",
    shortName: "Jobless Claims",
    metaDescription:
      "Weekly initial jobless claims tracker. Rising claims above 300K sustained signal labor market weakening and recession risk.",
    keywords: [
      "initial jobless claims",
      "weekly unemployment claims",
      "jobless claims today",
      "unemployment claims recession",
      "initial claims 2026",
    ],
    whatIsIt:
      "Initial jobless claims measure the number of people filing for unemployment insurance for the first time each week. It is the most timely indicator of labor market health, released weekly with only a one-week lag.",
    whyItMatters:
      "Claims above 300,000 sustained over several weeks signal meaningful labor market deterioration. Sharp increases from cycle lows are among the earliest recession signals available.",
    historicalContext:
      "Claims spiked above 600K before the 2008 recession was officially declared. The 4-week moving average helps smooth volatility and provides a cleaner signal.",
  },
  "consumer-sentiment": {
    slug: "consumer-sentiment",
    title: "University of Michigan Consumer Sentiment",
    shortName: "Consumer Sentiment",
    metaDescription:
      "Track consumer sentiment from the University of Michigan survey. Readings below 60 have historically aligned with recessionary conditions.",
    keywords: [
      "consumer sentiment",
      "university of michigan consumer sentiment",
      "consumer confidence index",
      "consumer sentiment today",
      "consumer confidence recession",
    ],
    whatIsIt:
      "The University of Michigan Consumer Sentiment Index surveys 500 households monthly on their financial conditions and expectations. It captures consumer willingness to spend, which drives roughly 70% of U.S. GDP.",
    whyItMatters:
      "Consumer spending is the backbone of the U.S. economy. When sentiment drops below 60, consumers typically pull back spending, creating a self-reinforcing cycle that can tip the economy into recession.",
    historicalContext:
      "Sentiment plunged below 55 during the 2008 financial crisis and hit historic lows during the 2022 inflation shock. Sustained readings below 65 have coincided with or preceded multiple recessions.",
  },
  "fed-funds-rate": {
    slug: "fed-funds-rate",
    title: "Federal Funds Rate",
    shortName: "Fed Funds Rate",
    metaDescription:
      "Track the Federal Reserve's benchmark interest rate. Rate cuts after sustained hiking cycles often signal late-cycle recession risk.",
    keywords: [
      "fed funds rate",
      "federal reserve interest rate",
      "fed rate today",
      "interest rate recession",
      "fed rate cut 2026",
    ],
    whatIsIt:
      "The Federal Funds Rate is the interest rate at which banks lend to each other overnight. Set by the Federal Reserve, it is the primary tool for monetary policy and influences all other interest rates in the economy.",
    whyItMatters:
      "When the Fed raises rates aggressively to fight inflation, it creates a restrictive environment that slows economic activity. Rate cuts after a hiking cycle often confirm that the Fed sees recession risk.",
    historicalContext:
      "The Fed raised rates from 0% to 5.25–5.50% in 2022–2023, the fastest hiking cycle in 40 years. Historically, recessions have followed the end of tightening cycles as the lagged effects of high rates ripple through the economy.",
  },
  "m2-money-supply": {
    slug: "m2-money-supply",
    title: "M2 Money Supply",
    shortName: "M2 Money Supply",
    metaDescription:
      "Monitor the M2 money supply. Year-over-year contraction in M2 is a rare deflationary signal associated with severe economic stress.",
    keywords: [
      "M2 money supply",
      "money supply recession",
      "M2 contraction",
      "money supply today",
      "M2 money supply 2026",
    ],
    whatIsIt:
      "M2 measures the total money supply including cash, checking deposits, savings, money market funds, and other near-money assets. It represents the total liquidity available in the economy.",
    whyItMatters:
      "Year-over-year declines in M2 are extremely rare — occurring only a handful of times in the last century — and have been associated with deflationary recessions and severe economic stress.",
    historicalContext:
      "M2 contracted YoY in 2023 for the first time since the 1930s, driven by quantitative tightening and bank lending pullback. Historically, money supply contraction precedes reduced economic activity.",
  },
  "unemployment-rate": {
    slug: "unemployment-rate",
    title: "Unemployment Rate (U3)",
    shortName: "Unemployment Rate",
    metaDescription:
      "Track the U.S. unemployment rate. Rising unemployment above 0.5% from cycle lows triggers recession signals including the Sahm Rule.",
    keywords: [
      "unemployment rate",
      "us unemployment rate today",
      "unemployment recession",
      "unemployment rate 2026",
      "labor market recession",
    ],
    whatIsIt:
      "The U3 unemployment rate measures the percentage of the civilian labor force that is unemployed and actively seeking work. Released monthly by the Bureau of Labor Statistics, it is the most widely watched labor market metric.",
    whyItMatters:
      "A rising unemployment rate is both a symptom and cause of recession. Once unemployment starts rising meaningfully (>0.5% from the cycle low), it tends to accelerate — the labor market rarely experiences a 'soft landing.'",
    historicalContext:
      "Unemployment rose from 3.5% to 10% during the 2008 recession and from 3.5% to 14.7% during the 2020 pandemic. The current cycle low provides the baseline for Sahm Rule calculations.",
  },
  "on-rrp-facility": {
    slug: "on-rrp-facility",
    title: "ON RRP Facility Levels",
    shortName: "ON RRP Facility",
    metaDescription:
      "Track the Federal Reserve's Overnight Reverse Repo facility. Declining ON RRP signals the financial system's liquidity buffer is thinning.",
    keywords: [
      "ON RRP facility",
      "overnight reverse repo",
      "fed reverse repo",
      "ON RRP levels today",
      "liquidity recession",
    ],
    whatIsIt:
      "The Overnight Reverse Repurchase Agreement (ON RRP) Facility allows eligible counterparties to deposit excess cash at the Federal Reserve overnight. Its balance reflects excess liquidity sloshing around the financial system.",
    whyItMatters:
      "Rapidly declining ON RRP balances indicate the financial system's liquidity cushion is evaporating. Near-zero levels mean banks and money market funds have less buffer during market stress events.",
    historicalContext:
      "ON RRP balances peaked above $2.5 trillion in late 2022 and have been declining as quantitative tightening drains reserves. The pace of decline is a key indicator of when liquidity constraints may start binding.",
  },
  "dxy-dollar-index": {
    slug: "dxy-dollar-index",
    title: "DXY U.S. Dollar Index",
    shortName: "DXY Dollar Index",
    metaDescription:
      "Monitor the U.S. Dollar Index (DXY). Dollar strength can signal global stress and tightening financial conditions that precede recessions.",
    keywords: [
      "DXY dollar index",
      "US dollar index today",
      "dollar strength recession",
      "DXY 2026",
      "dollar index chart",
    ],
    whatIsIt:
      "The DXY Index measures the U.S. dollar against a basket of six major currencies (EUR, JPY, GBP, CAD, SEK, CHF). It reflects relative monetary policy, capital flows, and risk sentiment globally.",
    whyItMatters:
      "A strong dollar tightens global financial conditions, puts pressure on emerging markets with dollar-denominated debt, and squeezes U.S. multinationals' earnings. Extreme dollar strength often precedes global economic stress.",
    historicalContext:
      "The DXY surged to 20-year highs in 2022 as the Fed aggressively hiked rates. Similar spikes preceded the 1997 Asian crisis and the 2008 global financial crisis.",
  },
  "credit-spreads": {
    slug: "credit-spreads",
    title: "High-Yield Credit Spreads (OAS)",
    shortName: "Credit Spreads",
    metaDescription:
      "Track high-yield credit spreads (ICE BofA HY OAS). Widening spreads signal rising default risk and are a classic recession leading indicator.",
    keywords: [
      "credit spreads",
      "high yield spread",
      "HY OAS",
      "credit spread recession",
      "corporate bond spreads 2026",
    ],
    whatIsIt:
      "The ICE BofA High Yield Option-Adjusted Spread (HY OAS) measures the yield premium investors demand for holding high-yield corporate bonds over risk-free Treasuries. It reflects credit risk and default expectations.",
    whyItMatters:
      "Widening credit spreads signal that bond investors are demanding more compensation for default risk — a sign of deteriorating economic conditions. Spreads above 500bps have historically coincided with recessions.",
    historicalContext:
      "Spreads blew out to 1,100bps during the 2008 crisis and 1,087bps during the March 2020 COVID crash. Rapid widening from compressed levels is particularly significant as a recession warning.",
  },
  "gdp-growth": {
    slug: "gdp-growth",
    title: "GDP Growth Forecast",
    shortName: "GDP Growth",
    metaDescription:
      "Track U.S. GDP growth rate and nowcast estimates. Two consecutive quarters of negative GDP growth is the traditional recession definition.",
    keywords: [
      "GDP growth rate",
      "US GDP today",
      "GDP recession",
      "GDP forecast 2026",
      "GDP nowcast",
    ],
    whatIsIt:
      "Gross Domestic Product (GDP) measures the total value of goods and services produced in the U.S. economy. The annualized quarter-over-quarter growth rate is the primary measure of economic expansion or contraction.",
    whyItMatters:
      "Two consecutive quarters of negative GDP growth is the traditional (though not official) definition of recession. Real-time nowcast models like the Atlanta Fed GDPNow provide forward-looking estimates before official data.",
    historicalContext:
      "The U.S. experienced two consecutive negative GDP quarters in early 2022, though the NBER did not declare a recession. Official recessions are determined by a broader set of indicators including employment and income.",
  },
  "jpm-recession-probability": {
    slug: "jpm-recession-probability",
    title: "JPMorgan Recession Probability Model",
    shortName: "JPM Recession Prob",
    metaDescription:
      "Track JPMorgan's market-implied recession probability model. Combines bond, equity, and credit market signals into a single probability estimate.",
    keywords: [
      "JPMorgan recession probability",
      "recession probability model",
      "market implied recession",
      "recession odds 2026",
    ],
    whatIsIt:
      "JPMorgan's recession probability model combines signals from Treasury yields, credit spreads, equity volatility, and other market-based indicators to estimate the probability that the U.S. is entering or in a recession.",
    whyItMatters:
      "Market-based probability models synthesize the collective intelligence of millions of investors. When the model exceeds 50%, markets are pricing in a recession as the base case.",
    historicalContext:
      "The model has historically spiked above 60% within months of recession onset. It provides a useful summary of how financial markets are pricing recession risk in real time.",
  },
  "emerging-markets": {
    slug: "emerging-markets",
    title: "Emerging Markets Performance",
    shortName: "Emerging Markets",
    metaDescription:
      "Track emerging market performance as a global recession indicator. EM weakness often precedes developed market downturns.",
    keywords: [
      "emerging markets recession",
      "EEM performance",
      "emerging markets 2026",
      "global recession indicator",
    ],
    whatIsIt:
      "Emerging market equity and debt performance reflects global risk appetite and capital flows. Tracked via indices like MSCI EM and ETFs like EEM, it captures the health of the global growth cycle.",
    whyItMatters:
      "Emerging markets are sensitive to global liquidity, dollar strength, and commodity prices. Broad EM weakness often precedes developed market downturns as global financial conditions tighten.",
    historicalContext:
      "EM equities peaked well before the 2008 global financial crisis and the 2020 downturn. Capital flight from emerging markets is a classic early warning of global risk aversion.",
  },
  "bank-unrealized-losses": {
    slug: "bank-unrealized-losses",
    title: "Bank Unrealized Losses",
    shortName: "Bank Losses",
    metaDescription:
      "Monitor U.S. bank unrealized losses on securities portfolios. Large unrealized losses signal financial system fragility and potential credit contraction.",
    keywords: [
      "bank unrealized losses",
      "bank losses 2026",
      "banking crisis",
      "bank securities losses",
      "financial system risk",
    ],
    whatIsIt:
      "Unrealized losses on bank securities portfolios represent the mark-to-market decline in bonds held by U.S. banks. These losses don't appear on income statements but reduce banks' actual equity cushion.",
    whyItMatters:
      "Large unrealized losses constrain banks' ability to lend, sell assets, or absorb further shocks. The 2023 banking crisis (SVB, Signature, First Republic) was triggered by this exact dynamic.",
    historicalContext:
      "Unrealized losses peaked at over $620 billion in late 2022 as rising rates crushed bond portfolios. While improving as rates stabilize, remaining losses represent ongoing fragility in the banking system.",
  },
  "us-interest-expense": {
    slug: "us-interest-expense",
    title: "U.S. Government Interest Expense",
    shortName: "Interest Expense",
    metaDescription:
      "Track U.S. government interest payments on national debt. Rising interest expense crowds out fiscal stimulus capacity during downturns.",
    keywords: [
      "US interest expense",
      "government debt interest",
      "national debt cost",
      "interest expense GDP",
      "fiscal recession risk",
    ],
    whatIsIt:
      "U.S. government interest expense is the annual cost of servicing the national debt. As debt levels and interest rates rise, this expense consumes an increasing share of federal revenue and GDP.",
    whyItMatters:
      "High interest expense limits the government's ability to deploy fiscal stimulus during a recession. It also signals structural fiscal deterioration that can eventually force painful austerity or monetization.",
    historicalContext:
      "Interest expense surpassed $1 trillion annually in 2024, exceeding defense spending for the first time. The combination of $34T+ in debt and elevated rates creates a structural fiscal headwind unlike anything in modern history.",
  },
};

export const ALL_INDICATOR_SLUGS = Object.keys(INDICATORS_SEO);

export function getIndicatorSEO(slug: string): IndicatorSEO | undefined {
  return INDICATORS_SEO[slug];
}
