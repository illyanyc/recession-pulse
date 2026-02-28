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
  // --- New Tier 1 Indicators ---
  "building-permits": {
    slug: "building-permits",
    title: "Building Permits (Residential)",
    shortName: "Building Permits",
    metaDescription:
      "Track U.S. residential building permits in real time. Declining permits are the most critical recession predictor per Moody's Analytics.",
    keywords: [
      "building permits",
      "building permits recession",
      "housing permits",
      "residential construction",
      "housing recession indicator",
      "building permits 2026",
    ],
    whatIsIt:
      "Building permits measure the number of new residential construction projects authorized by local governments. Released monthly by the Census Bureau, they reflect future housing construction activity and developer confidence.",
    whyItMatters:
      "Moody's Analytics chief economist Mark Zandi calls residential building permit growth 'the most critical economic variable' for predicting recessions. Housing construction leads the business cycle by 3-5 quarters, making permits one of the earliest signals available.",
    historicalContext:
      "Building permits plunged from 2.2M to under 600K before the 2008 housing crisis. Research spanning 100 years shows permit volatility strongly predicts financial market downturns at 12-month horizons.",
  },
  "real-personal-income": {
    slug: "real-personal-income",
    title: "Real Personal Income (Excluding Transfers)",
    shortName: "Real Income (ex Transfers)",
    metaDescription:
      "Track real personal income excluding transfers — the NBER's top recession indicator. Declining organic income signals economic weakness.",
    keywords: [
      "real personal income",
      "personal income less transfers",
      "NBER recession indicator",
      "income recession",
      "W875RX1",
    ],
    whatIsIt:
      "Real personal income excluding current transfer receipts strips out government payments (Social Security, unemployment benefits, stimulus) to show organic income growth. It is measured in billions of chained 2017 dollars.",
    whyItMatters:
      "The NBER's Business Cycle Dating Committee places the most weight on this indicator alongside nonfarm payroll employment. Declining real income means households are earning less in purchasing power terms — the foundation of consumer spending.",
    historicalContext:
      "This metric declined before every NBER-dated recession. It provides a cleaner signal than total income because government transfer payments often increase during downturns, masking organic weakness.",
  },
  "industrial-production": {
    slug: "industrial-production",
    title: "Industrial Production Index",
    shortName: "Industrial Production",
    metaDescription:
      "Monitor the Industrial Production Index — a core NBER recession indicator tracking real output of manufacturing, mining, and utilities.",
    keywords: [
      "industrial production index",
      "industrial production recession",
      "manufacturing output",
      "INDPRO",
      "industrial production 2026",
    ],
    whatIsIt:
      "The Industrial Production Index (IPI) measures the real output of the manufacturing, mining, and electric and gas utilities sectors. Published monthly by the Federal Reserve, it is indexed to a base year of 2017=100.",
    whyItMatters:
      "Industrial production is one of four key indicators the NBER monitors during recessions. Declines in IP have preceded or coincided with every post-war recession, making it a critical measure of real economic activity beyond the services sector.",
    historicalContext:
      "IP fell over 17% during the 2008 recession and 12.7% during the COVID shock. Sustained declines of 2%+ from peak typically indicate recessionary conditions have already begun.",
  },
  "jolts-quits-rate": {
    slug: "jolts-quits-rate",
    title: "JOLTS Quits Rate",
    shortName: "JOLTS Quits Rate",
    metaDescription:
      "Track the JOLTS quits rate — the best forward-looking labor market indicator. Falling quits signal workers are afraid to leave jobs, preceding recessions.",
    keywords: [
      "JOLTS quits rate",
      "job quits rate",
      "JOLTS recession indicator",
      "labor market quits",
      "workers quitting rate 2026",
    ],
    whatIsIt:
      "The JOLTS quits rate measures the percentage of workers who voluntarily leave their jobs each month. High quit rates indicate worker confidence in finding better opportunities; low rates signal fear and labor market deterioration.",
    whyItMatters:
      "The quits rate is one of the best forward-looking labor market indicators. When workers stop quitting, it means they perceive fewer opportunities — a leading signal of rising unemployment and economic weakness.",
    historicalContext:
      "The quits rate peaked at 3.0% in 2021-2022 during the 'Great Resignation' and has since fallen to 2.0%, below its pre-pandemic average. Similar declines preceded both the 2001 and 2008 recessions.",
  },
  "nfci": {
    slug: "nfci",
    title: "Chicago Fed National Financial Conditions Index",
    shortName: "Chicago Fed NFCI",
    metaDescription:
      "Monitor the Chicago Fed NFCI — 105 financial measures in one index. Positive values signal tight financial conditions and recession risk.",
    keywords: [
      "NFCI",
      "Chicago Fed financial conditions",
      "financial conditions index",
      "NFCI recession",
      "financial stress indicator",
    ],
    whatIsIt:
      "The National Financial Conditions Index (NFCI) combines 105 measures of financial activity — across money markets, debt and equity markets, and the banking system — into a single weekly indicator. It has an average of zero and standard deviation of one since 1971.",
    whyItMatters:
      "Positive NFCI values indicate tighter-than-average financial conditions, which historically precede economic slowdowns. The index captures stress in risk, credit, and leverage simultaneously — providing a comprehensive financial health check.",
    historicalContext:
      "The NFCI spiked sharply before both the 2008 financial crisis and the March 2020 market crash. Its three subindexes (risk, credit, leverage) help identify which dimension of financial stress is building.",
  },
  "temp-help-services": {
    slug: "temp-help-services",
    title: "Temporary Help Services Employment",
    shortName: "Temp Help Services",
    metaDescription:
      "Track temporary help services employment — the earliest labor market recession signal. Temp jobs are the first to be cut when companies fear a slowdown.",
    keywords: [
      "temporary help services",
      "temp employment",
      "staffing recession indicator",
      "temporary workers",
      "temp jobs 2026",
    ],
    whatIsIt:
      "Temporary help services employment measures the number of workers employed through staffing agencies. These flexible labor arrangements are the first to be added during expansions and the first to be cut when businesses anticipate weakness.",
    whyItMatters:
      "Temp employment is one of the earliest labor market signals because employers reduce temporary staff before laying off permanent workers. Declining temp employment has preceded every recession since the 1990s.",
    historicalContext:
      "Temp employment peaked at 3.2M in 2022 and has been declining steadily. Similar multi-quarter declines occurred 6-12 months before the 2001 and 2008 recessions began.",
  },
  "ny-fed-recession-prob": {
    slug: "ny-fed-recession-prob",
    title: "NY Fed Recession Probability Model",
    shortName: "NY Fed Recession Prob",
    metaDescription:
      "Track the New York Fed's recession probability model based on the 3-month/10-year Treasury spread. Exceeding 50% has preceded every recession since 1972.",
    keywords: [
      "NY Fed recession probability",
      "recession probability model",
      "term spread recession",
      "3 month 10 year spread",
      "recession odds 2026",
    ],
    whatIsIt:
      "The NY Fed recession probability model uses the spread between the 10-year Treasury yield and the 3-month Treasury bill rate to calculate the probability of a U.S. recession in the next 12 months, using a probit model estimated from data since 1959.",
    whyItMatters:
      "This is the most established academic recession probability model. When the estimated probability exceeds 50%, it has historically preceded every recession since 1972 with remarkable reliability.",
    historicalContext:
      "The model estimated recession probability exceeded 70% in 2023 during the prolonged yield curve inversion. Prior peaks above 40% in 2006 and 2000 correctly preceded those recessions.",
  },
  // --- New Tier 2 Indicators ---
  "corporate-profits": {
    slug: "corporate-profits",
    title: "Corporate Profits (After Tax)",
    shortName: "Corporate Profits",
    metaDescription:
      "Track U.S. corporate profits after tax. Declining profits have preceded 81% of recessions since 1900 — the heart of the business cycle.",
    keywords: [
      "corporate profits",
      "corporate earnings recession",
      "profit margins",
      "corporate profits after tax",
      "business profits 2026",
    ],
    whatIsIt:
      "Corporate profits after tax measure the total net income of U.S. corporations, adjusted for inventory valuation and capital consumption. Released quarterly by the BEA, they reflect the overall health of the business sector.",
    whyItMatters:
      "Profits are 'the heart and soul of the business cycle.' Declining profits drive businesses to cut investment, hiring, and production. Two consecutive quarters of earnings decline have preceded recession 81% of the time since 1900.",
    historicalContext:
      "Corporate profits peaked before both the 2001 and 2008 recessions. The only times profit declines didn't lead to recession were when offset by extraordinary fiscal stimulus or monetary easing.",
  },
  "personal-savings-rate": {
    slug: "personal-savings-rate",
    title: "Personal Savings Rate",
    shortName: "Savings Rate",
    metaDescription:
      "Monitor the U.S. personal savings rate. Historically low savings mean consumers have no financial buffer when the economy turns down.",
    keywords: [
      "personal savings rate",
      "savings rate recession",
      "consumer savings",
      "savings rate 2026",
      "consumer financial buffer",
    ],
    whatIsIt:
      "The personal savings rate measures the percentage of disposable personal income that is saved rather than spent. Released monthly by the BEA, it reflects consumers' ability to build financial reserves.",
    whyItMatters:
      "A low savings rate means consumers are spending nearly everything they earn, leaving no cushion for economic shocks. When savings are depleted, any disruption to income (job loss, rate hikes) quickly translates into reduced spending.",
    historicalContext:
      "The savings rate fell to 2.2% before the 2008 crisis and has been trending below 5% through 2025. The post-COVID savings surplus has been fully depleted, leaving consumers more vulnerable than at any point since 2007.",
  },
  "vix": {
    slug: "vix",
    title: "VIX Volatility Index",
    shortName: "VIX",
    metaDescription:
      "Track the CBOE VIX — Wall Street's fear gauge. Combined with the yield curve, VIX cycles outperform the yield curve alone for recession prediction.",
    keywords: [
      "VIX index",
      "VIX recession",
      "volatility index",
      "CBOE VIX",
      "market fear gauge",
      "VIX 2026",
    ],
    whatIsIt:
      "The CBOE Volatility Index (VIX) measures the market's expectation of 30-day forward-looking volatility, calculated from S&P 500 option prices. Often called the 'fear gauge,' it reflects investor uncertainty.",
    whyItMatters:
      "Research shows the VIX-yield curve cycle significantly outperforms the yield curve alone for recession prediction. VIX spikes above 30 indicate market stress, while sustained readings above 20 suggest elevated uncertainty about economic conditions.",
    historicalContext:
      "VIX spiked to 80+ during the 2008 crisis and 82 during the March 2020 crash. Sustained periods of low VIX (<12) often precede sharp corrections and have coincided with late-cycle complacency.",
  },
  "gdpnow": {
    slug: "gdpnow",
    title: "Atlanta Fed GDPNow",
    shortName: "GDPNow",
    metaDescription:
      "Track the Atlanta Fed GDPNow model — a real-time GDP growth estimate updated throughout the quarter with no subjective adjustments.",
    keywords: [
      "GDPNow",
      "Atlanta Fed GDP",
      "real-time GDP estimate",
      "GDP nowcast",
      "GDPNow 2026",
    ],
    whatIsIt:
      "GDPNow is a running estimate of real GDP growth published by the Atlanta Fed. It uses a methodology similar to the BEA's GDP calculation, incorporating economic data releases throughout the quarter to provide an evolving forecast.",
    whyItMatters:
      "Unlike official GDP data which arrives with a one-quarter lag, GDPNow provides a real-time window into current economic growth. A GDPNow reading below 0% suggests the economy may already be contracting.",
    historicalContext:
      "GDPNow correctly signaled the sharp Q1 2020 contraction and has generally tracked within 1 percentage point of the final GDP estimate. It made headlines in early 2025 when it briefly turned negative.",
  },
  "credit-card-delinquency": {
    slug: "credit-card-delinquency",
    title: "Credit Card Delinquency Rate",
    shortName: "CC Delinquency",
    metaDescription:
      "Monitor U.S. credit card delinquency rates. At their highest since the Great Financial Crisis, rising delinquencies signal broad consumer financial stress.",
    keywords: [
      "credit card delinquency",
      "consumer delinquency",
      "credit card default rate",
      "consumer credit stress",
      "delinquency rate 2026",
    ],
    whatIsIt:
      "The credit card delinquency rate measures the percentage of credit card balances that are 30+ days past due across all U.S. commercial banks. Released quarterly by the Federal Reserve, it directly reflects consumer financial health.",
    whyItMatters:
      "Rising credit card delinquencies are a canary in the coal mine for consumer stress. When households can't make minimum payments, it signals income pressure that will eventually reduce spending — the engine of 70% of GDP.",
    historicalContext:
      "Credit card delinquencies reached 6.8% during the 2008 crisis. Current rates above 4% have risen to the highest since the GFC and are broad-based across income levels, suggesting systemic consumer stress.",
  },
  "nfib-optimism": {
    slug: "nfib-optimism",
    title: "NFIB Small Business Optimism Index",
    shortName: "NFIB Optimism",
    metaDescription:
      "Track the NFIB Small Business Optimism Index. Small businesses employ nearly half of all workers — their sentiment drives hiring and investment decisions.",
    keywords: [
      "NFIB small business optimism",
      "small business confidence",
      "NFIB index",
      "small business recession",
      "NFIB 2026",
    ],
    whatIsIt:
      "The NFIB Small Business Economic Trends survey has tracked small business sentiment since 1986. The Optimism Index aggregates components including employment plans, capital expenditure plans, sales expectations, and economic outlook.",
    whyItMatters:
      "Small businesses employ roughly 47% of the private workforce. When small business optimism drops below the 52-year average of ~98, it signals that employers are pulling back on hiring and investment.",
    historicalContext:
      "The index plunged below 90 during both the 2008 and 2020 recessions. Sustained readings below 95 have historically coincided with or preceded economic contractions.",
  },
  "copper-gold-ratio": {
    slug: "copper-gold-ratio",
    title: "Copper-to-Gold Ratio",
    shortName: "Copper/Gold Ratio",
    metaDescription:
      "Track the copper-to-gold ratio — a powerful gauge of industrial confidence vs financial fear. Currently at 50-year lows below the 2008 crisis.",
    keywords: [
      "copper gold ratio",
      "copper to gold ratio",
      "Dr Copper",
      "copper gold recession",
      "industrial metals ratio",
    ],
    whatIsIt:
      "The copper-to-gold ratio divides the price of copper (an industrial metal reflecting economic growth) by the price of gold (a safe-haven asset reflecting fear). A falling ratio means fear is outpacing industrial demand.",
    whyItMatters:
      "The ratio strongly correlates with 10-year Treasury yields (~0.85 correlation) and serves as a leading indicator for interest rates and economic conditions. Bond manager Jeffrey Gundlach considers it one of his favorite leading indicators.",
    historicalContext:
      "The ratio has fallen to ~0.00077, below its 2008 financial crisis level (0.00110) and 2020 COVID low (0.00084). This reflects gold surging past $4,100/oz while copper remains range-bound amid geopolitical uncertainty.",
  },
  // --- New Tier 3 Indicators ---
  "housing-starts": {
    slug: "housing-starts",
    title: "Housing Starts",
    shortName: "Housing Starts",
    metaDescription:
      "Track U.S. housing starts — a key leading indicator. Residential investment leads the business cycle by 3-5 quarters.",
    keywords: [
      "housing starts",
      "housing starts recession",
      "residential construction",
      "new home construction",
      "housing starts 2026",
    ],
    whatIsIt:
      "Housing starts measure the number of new residential construction projects that have begun during a given month. Released by the Census Bureau, they reflect builder confidence and future construction activity.",
    whyItMatters:
      "Housing is one of the most interest-rate sensitive sectors of the economy. Declining housing starts lead the business cycle by 3-5 quarters because construction generates demand across dozens of industries from lumber to appliances.",
    historicalContext:
      "Housing starts collapsed from 2.3M to 478K during the 2008 crisis — the worst decline in modern history. Even moderate declines of 20%+ from peak have historically preceded broader economic weakness.",
  },
  "freight-index": {
    slug: "freight-index",
    title: "Freight Transportation Index",
    shortName: "Freight Index",
    metaDescription:
      "Monitor the freight transportation index for real-time signals of goods economy health. Declining freight activity precedes broader economic weakness.",
    keywords: [
      "freight index",
      "freight recession",
      "Cass freight index",
      "trucking recession",
      "freight transportation 2026",
    ],
    whatIsIt:
      "The Freight Transportation Services Index measures the volume of freight carried by for-hire transportation industries. It captures real-time shipping demand across trucking, rail, air, and pipeline.",
    whyItMatters:
      "If goods aren't being shipped, they aren't being produced or consumed. Declining freight activity is one of the most tangible real-economy signals that production and consumption are weakening.",
    historicalContext:
      "The freight index declined notably before both the 2008 and 2020 recessions. The 2022-2023 freight recession preceded broader manufacturing weakness by several quarters.",
  },
  "inventory-sales-ratio": {
    slug: "inventory-sales-ratio",
    title: "Inventory-to-Sales Ratio",
    shortName: "Inventory/Sales",
    metaDescription:
      "Track the business inventory-to-sales ratio. Rising inventories relative to sales signal goods are piling up and production cuts are coming.",
    keywords: [
      "inventory to sales ratio",
      "inventory recession",
      "business inventories",
      "inventory buildup",
      "ISRATIO",
    ],
    whatIsIt:
      "The total business inventories-to-sales ratio measures how many months of sales are currently held in inventory across manufacturing, wholesale, and retail. A rising ratio means goods are selling more slowly than they're being produced.",
    whyItMatters:
      "When inventories pile up relative to sales, businesses respond by cutting production and orders — creating a negative feedback loop. Rising inventory-to-sales ratios have preceded manufacturing recessions.",
    historicalContext:
      "The ratio spiked to 1.67 during the 2008 recession as demand collapsed. Current levels around 1.37 are elevated compared to the pre-pandemic trend of 1.32-1.34.",
  },
  "debt-service-ratio": {
    slug: "debt-service-ratio",
    title: "Household Debt Service Ratio",
    shortName: "Debt Service Ratio",
    metaDescription:
      "Track the household debt service ratio — the share of income going to debt payments. Rising debt service crowds out consumer spending.",
    keywords: [
      "debt service ratio",
      "household debt ratio",
      "debt payments income",
      "consumer debt burden",
      "debt service 2026",
    ],
    whatIsIt:
      "The household debt service ratio measures the percentage of disposable personal income devoted to required debt payments (mortgage, consumer, and auto loans). Published quarterly by the Federal Reserve.",
    whyItMatters:
      "When a larger share of income goes to debt payments, less is available for discretionary spending. Debt service ratios above 13% have historically been associated with consumer stress and economic vulnerability.",
    historicalContext:
      "The ratio peaked at 13.2% before the 2008 crisis and fell to historic lows of 9.2% in 2021 thanks to pandemic-era low rates and stimulus. It has been climbing as rates rose in 2022-2025.",
  },
  "sloos-lending": {
    slug: "sloos-lending",
    title: "Senior Loan Officer Survey (SLOOS)",
    shortName: "SLOOS Lending",
    metaDescription:
      "Track bank lending standards from the Fed's Senior Loan Officer Survey. Tightening credit means less lending and slower economic growth.",
    keywords: [
      "SLOOS",
      "loan officer survey",
      "bank lending standards",
      "credit tightening",
      "bank lending recession",
    ],
    whatIsIt:
      "The Senior Loan Officer Opinion Survey (SLOOS) is a quarterly Fed survey of up to 80 large banks tracking changes in lending standards and loan demand for business and consumer loans.",
    whyItMatters:
      "When banks tighten lending standards, credit becomes harder to obtain — slowing business investment and consumer spending. Net tightening above 20% has historically been associated with recessions or near-recession conditions.",
    historicalContext:
      "Lending standards tightened dramatically before both the 2001 and 2008 recessions. Current standards remain on the tighter end of the range observed since 2005, reflecting ongoing bank caution.",
  },
  "sos-recession": {
    slug: "sos-recession",
    title: "SOS Recession Indicator",
    shortName: "SOS Indicator",
    metaDescription:
      "Track the SOS recession indicator — an improved Sahm Rule using weekly unemployment insurance claims. Correctly identified all 7 recessions since 1971.",
    keywords: [
      "SOS recession indicator",
      "Scavette O'Trakoun Sahm",
      "weekly claims recession",
      "SOS indicator",
      "improved Sahm rule",
    ],
    whatIsIt:
      "The SOS (Scavette-O'Trakoun-Sahm-style) indicator applies Sahm Rule methodology to weekly insured unemployment claims data. It signals recession when the 26-week moving average of the insured unemployment rate rises 0.2+ percentage points above its 52-week low.",
    whyItMatters:
      "The SOS correctly identifies all seven recessions since 1971, produces fewer false positives than the original Sahm Rule, and signals recessions faster. It uses administrative data (insurance claims) rather than survey data, avoiding response rate bias.",
    historicalContext:
      "Published by the Richmond Fed, the SOS addresses key limitations of the original Sahm Rule including declining CPS survey response rates and confounding labor supply factors from immigration changes.",
  },
};

export const ALL_INDICATOR_SLUGS = Object.keys(INDICATORS_SEO);

export function getIndicatorSEO(slug: string): IndicatorSEO | undefined {
  return INDICATORS_SEO[slug];
}
