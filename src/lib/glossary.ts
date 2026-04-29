/**
 * Curated macroeconomic glossary powering `/learn/glossary/[term]`.
 *
 * Each term produces:
 *  - A static page with DefinedTerm JSON-LD
 *  - Cross-links to related indicator pages (by slug)
 *  - Cross-links to related glossary terms (by slug)
 *
 * Term slugs are kebab-case and stable. Add new terms freely — the static
 * params and sitemap regenerate automatically.
 */

export interface GlossaryTerm {
  slug: string;
  term: string;
  shortDef: string;
  longDef: string;
  keywords: string[];
  relatedIndicators: string[];
  relatedTerms: string[];
  firstCoined?: string;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  recession: {
    slug: "recession",
    term: "Recession",
    shortDef:
      "A significant, broad-based, sustained decline in economic activity lasting more than a few months.",
    longDef:
      "A recession is a meaningful contraction in economic activity that shows up across production, employment, real income, and trade. In the United States, recessions are officially dated by the NBER Business Cycle Dating Committee, which defines a recession as 'a significant decline in economic activity that is spread across the economy and that lasts more than a few months.' The popular 'two consecutive quarters of negative GDP growth' rule of thumb often agrees with NBER but is not the official definition.",
    keywords: ["recession definition", "what is a recession", "NBER recession", "economic contraction"],
    relatedIndicators: ["sahm-rule", "yield-curve-2s10s", "conference-board-lei", "unemployment-rate"],
    relatedTerms: ["nber-recession-dating", "soft-landing", "stagflation", "recession-indicator"],
    firstCoined: "Julius Shiskin (1974) popularized the two-quarter rule; NBER formally dates cycles.",
  },
  "nber-recession-dating": {
    slug: "nber-recession-dating",
    term: "NBER Recession Dating",
    shortDef:
      "The process by which the National Bureau of Economic Research officially identifies the peaks and troughs of US business cycles.",
    longDef:
      "NBER's Business Cycle Dating Committee looks at depth, diffusion, and duration across real GDP, real gross domestic income, real personal income less transfers, nonfarm payrolls, household employment, industrial production, and real manufacturing/wholesale-retail sales. The committee typically dates peaks and troughs with a 6-18 month lag once all revised data are available.",
    keywords: ["NBER recession dating", "business cycle dating committee", "recession official"],
    relatedIndicators: ["unemployment-rate", "industrial-production", "real-personal-income"],
    relatedTerms: ["recession", "soft-landing"],
  },
  "soft-landing": {
    slug: "soft-landing",
    term: "Soft Landing",
    shortDef:
      "A scenario in which monetary policy slows inflation without causing a recession.",
    longDef:
      "A soft landing is the Fed's stated goal during hiking cycles: bringing inflation back to target while keeping unemployment from spiking. Historically rare — the Fed has arguably achieved only one unambiguous soft landing (1994-95). Most tightening cycles end in recession with a 12-24 month lag from the final hike.",
    keywords: ["soft landing", "Fed soft landing", "monetary policy soft landing"],
    relatedIndicators: ["fed-funds-rate", "unemployment-rate", "sahm-rule"],
    relatedTerms: ["recession", "stagflation"],
  },
  stagflation: {
    slug: "stagflation",
    term: "Stagflation",
    shortDef:
      "The simultaneous occurrence of high inflation, high unemployment, and stagnant demand.",
    longDef:
      "Stagflation describes the macroeconomic regime of the 1970s: persistently high inflation combined with rising unemployment and weak growth. The Phillips curve, which assumes a tradeoff between the two, breaks down under stagflation. Supply shocks (oil, labor, geopolitics) are typical catalysts.",
    keywords: ["stagflation", "1970s inflation", "high unemployment inflation"],
    relatedIndicators: ["unemployment-rate", "fed-funds-rate"],
    relatedTerms: ["recession", "soft-landing"],
    firstCoined: "Iain Macleod (1965), UK politician.",
  },
  "sahm-rule": {
    slug: "sahm-rule",
    term: "Sahm Rule",
    shortDef:
      "A recession indicator that triggers when the 3-month moving average of the unemployment rate rises 0.5 percentage points or more above its 12-month low.",
    longDef:
      "Created by economist Claudia Sahm, the Sahm Rule has correctly identified every US recession since 1970 in real time with no false positives until 2024, when a data-revision issue caused a brief trigger that Sahm herself flagged as potentially spurious. It is now watched as one of the cleanest labor-market recession signals available.",
    keywords: ["sahm rule definition", "claudia sahm", "sahm rule recession indicator"],
    relatedIndicators: ["sahm-rule", "unemployment-rate", "initial-claims"],
    relatedTerms: ["recession", "recession-indicator", "nber-recession-dating"],
  },
  "yield-curve-inversion": {
    slug: "yield-curve-inversion",
    term: "Yield Curve Inversion",
    shortDef:
      "When short-term Treasury yields exceed long-term Treasury yields, signaling elevated recession risk.",
    longDef:
      "The 2s10s spread (10-year Treasury yield minus 2-year) inverts when markets expect the Fed to cut aggressively in the medium term. An inverted 2s10s has preceded every US recession since 1955 with only one false signal (1966). Historically, recessions follow 6-18 months after the curve un-inverts, not when it first inverts.",
    keywords: ["yield curve inversion", "2s10s recession", "inverted yield curve"],
    relatedIndicators: ["yield-curve-2s10s", "yield-curve-2s30s", "ny-fed-recession-prob"],
    relatedTerms: ["term-premium", "recession", "fed-funds-rate"],
  },
  "term-premium": {
    slug: "term-premium",
    term: "Term Premium",
    shortDef:
      "The extra yield investors demand to hold longer-duration bonds instead of rolling short-duration bonds.",
    longDef:
      "The term premium is the component of long-term Treasury yields that is not explained by expected future short rates. A compressed or negative term premium helps explain inverted yield curves without requiring extreme recession expectations.",
    keywords: ["term premium", "ACM term premium", "Treasury term premium"],
    relatedIndicators: ["yield-curve-2s10s", "ny-fed-recession-prob"],
    relatedTerms: ["yield-curve-inversion"],
  },
  "leading-economic-index": {
    slug: "leading-economic-index",
    term: "Leading Economic Index (LEI)",
    shortDef:
      "The Conference Board's composite index of 10 leading economic indicators.",
    longDef:
      "The LEI combines 10 components — average weekly hours in manufacturing, initial claims, ISM new orders, building permits, stock prices (S&P 500), the 2s10s spread, leading credit index, consumer expectations, manufacturers' new orders for consumer goods, and nondefense capital goods. The '3Ds rule' (Depth, Diffusion, Duration) evaluates when LEI declines qualify as recession signals.",
    keywords: ["leading economic index", "LEI 3Ds rule", "conference board LEI"],
    relatedIndicators: ["conference-board-lei", "building-permits", "initial-claims", "ism-manufacturing"],
    relatedTerms: ["recession-indicator"],
  },
  "recession-indicator": {
    slug: "recession-indicator",
    term: "Recession Indicator",
    shortDef: "Any data series whose behavior reliably precedes or confirms a recession.",
    longDef:
      "Recession indicators fall into three groups: leading (peak before the economy turns), coincident (peak with the economy), and lagging (peak after the economy turns). Useful indicators must have a track record of historical accuracy, a clear economic mechanism, timely availability, and low revision risk.",
    keywords: ["recession indicator", "leading recession indicator", "coincident lagging"],
    relatedIndicators: ["sahm-rule", "yield-curve-2s10s", "conference-board-lei"],
    relatedTerms: ["sahm-rule", "yield-curve-inversion", "leading-economic-index", "recession"],
  },
  "ism-pmi": {
    slug: "ism-pmi",
    term: "ISM Manufacturing PMI",
    shortDef:
      "A monthly diffusion index that measures manufacturing activity. Above 50 means expansion, below 50 means contraction.",
    longDef:
      "The Institute for Supply Management surveys manufacturing purchasing managers on new orders, production, employment, deliveries, and inventories. A composite PMI below 48 for three consecutive months has historically coincided with or preceded recession in eight of nine cycles.",
    keywords: ["ISM PMI", "manufacturing PMI", "purchasing managers index"],
    relatedIndicators: ["ism-manufacturing", "conference-board-lei"],
    relatedTerms: ["leading-economic-index", "recession-indicator"],
  },
  jolts: {
    slug: "jolts",
    term: "JOLTS (Job Openings and Labor Turnover Survey)",
    shortDef:
      "A monthly BLS survey measuring job openings, hires, quits, and layoffs.",
    longDef:
      "The JOLTS quits rate — the share of employees voluntarily leaving — is a sensitive barometer of labor-market heat. A falling quits rate historically leads unemployment by 3-6 months and is one of the earliest labor-market signs of a cyclical turn.",
    keywords: ["JOLTS quits rate", "job openings", "labor turnover"],
    relatedIndicators: ["jolts-quits-rate", "initial-claims", "unemployment-rate"],
    relatedTerms: ["sahm-rule"],
  },
  pce: {
    slug: "pce",
    term: "PCE (Personal Consumption Expenditures)",
    shortDef: "The Fed's preferred inflation measure and the largest component of US GDP.",
    longDef:
      "PCE tracks what US households actually spend on. Core PCE (excluding food and energy) is the Fed's preferred inflation gauge because of its chain-weighted methodology and broader scope than CPI. The PCE deflator's 2% annual target is the anchor for Fed policy.",
    keywords: ["PCE inflation", "core PCE", "Fed inflation target"],
    relatedIndicators: ["fed-funds-rate"],
    relatedTerms: ["inflation", "fed-funds-rate"],
  },
  inflation: {
    slug: "inflation",
    term: "Inflation",
    shortDef: "A sustained increase in the general price level of goods and services.",
    longDef:
      "Inflation is measured by CPI, PCE, and the GDP deflator, each with different scope. Persistent above-target inflation forces tighter monetary policy, raises recession risk, and compresses real wages. 'Transitory' and 'sticky' inflation distinctions became central to the 2021-24 macro debate.",
    keywords: ["inflation definition", "CPI PCE inflation", "what is inflation"],
    relatedIndicators: ["fed-funds-rate"],
    relatedTerms: ["pce", "stagflation", "fed-funds-rate"],
  },
  "fed-funds-rate": {
    slug: "fed-funds-rate",
    term: "Federal Funds Rate",
    shortDef:
      "The overnight interbank lending rate targeted by the Federal Open Market Committee.",
    longDef:
      "The Fed Funds rate is the Fed's primary policy tool. Hikes transmit through the broader curve via the term structure. Every Fed tightening cycle since 1955 has either coincided with or preceded a recession, with the exception of the 1994-95 soft landing.",
    keywords: ["fed funds rate", "FOMC rate", "federal reserve rate"],
    relatedIndicators: ["fed-funds-rate", "yield-curve-2s10s"],
    relatedTerms: ["inflation", "yield-curve-inversion", "soft-landing"],
  },
  nfci: {
    slug: "nfci",
    term: "National Financial Conditions Index (NFCI)",
    shortDef:
      "A Chicago Fed index summarizing 105 measures of financial activity into a single financial-conditions gauge.",
    longDef:
      "The NFCI is constructed to have a mean of zero and a standard deviation of one. Positive values indicate tighter-than-average financial conditions. Sustained NFCI readings above 0.5 have historically preceded recessions.",
    keywords: ["NFCI", "financial conditions index", "Chicago Fed NFCI"],
    relatedIndicators: ["nfci", "credit-spreads", "vix"],
    relatedTerms: ["recession-indicator"],
  },
  "credit-spread": {
    slug: "credit-spread",
    term: "Credit Spread",
    shortDef:
      "The yield difference between a risky corporate bond and a risk-free Treasury of the same maturity.",
    longDef:
      "Credit spreads, especially high-yield ('junk') spreads, widen when markets price in rising default risk. Spreads above 500 bps have historically coincided with recessions or severe financial stress.",
    keywords: ["credit spread", "high yield spread", "junk bond spread"],
    relatedIndicators: ["credit-spreads", "nfci"],
    relatedTerms: ["recession-indicator"],
  },
  vix: {
    slug: "vix",
    term: "VIX (Volatility Index)",
    shortDef:
      "The CBOE's measure of implied 30-day volatility on the S&P 500, sometimes called the 'fear gauge.'",
    longDef:
      "The VIX is derived from S&P 500 options prices. Sustained levels above 30 coincide with growth scares; above 40 typically marks outright recession repricing or major financial stress events.",
    keywords: ["VIX", "volatility index", "fear gauge"],
    relatedIndicators: ["vix", "credit-spreads", "nfci"],
    relatedTerms: ["credit-spread"],
  },
  "copper-gold-ratio": {
    slug: "copper-gold-ratio",
    term: "Copper-Gold Ratio",
    shortDef:
      "The ratio of the price of copper to the price of gold, used as a market-based growth and inflation signal.",
    longDef:
      "Copper is a cyclical industrial metal; gold is a counter-cyclical safe haven. The copper-gold ratio tends to track 10-year Treasury yields and cyclical growth expectations. Sharp falls in the ratio historically coincide with global growth scares.",
    keywords: ["copper gold ratio", "Gundlach copper gold"],
    relatedIndicators: ["copper-gold-ratio", "gold-silver-ratio"],
    relatedTerms: ["recession-indicator"],
  },
  "m2-money-supply": {
    slug: "m2-money-supply",
    term: "M2 Money Supply",
    shortDef:
      "A broad measure of US money supply including currency, checking deposits, savings deposits, and money-market accounts.",
    longDef:
      "M2 captures cash-like balances available for transactions and near-term spending. A contracting M2 on a year-over-year basis is rare — the 2022-23 contraction was the first post-WWII instance. M2 growth has historically led nominal GDP growth by about 12 months.",
    keywords: ["M2 money supply", "M2 contraction", "broad money"],
    relatedIndicators: ["m2-money-supply"],
    relatedTerms: ["inflation", "fed-funds-rate"],
  },
  "on-rrp": {
    slug: "on-rrp",
    term: "Overnight Reverse Repo (ON RRP)",
    shortDef:
      "The Fed facility that lets eligible counterparties lend cash overnight to the Fed in exchange for Treasury collateral.",
    longDef:
      "ON RRP balances peaked above $2.5 trillion in 2022 and subsequently drained toward zero as the Treasury issued bills to absorb the cash. A fully drained RRP is the first leg of true quantitative tightening hitting bank reserves.",
    keywords: ["ON RRP", "reverse repo", "Fed RRP facility"],
    relatedIndicators: ["on-rrp-facility", "m2-money-supply"],
    relatedTerms: ["m2-money-supply"],
  },
  gdpnow: {
    slug: "gdpnow",
    term: "GDPNow",
    shortDef: "The Atlanta Fed's real-time GDP nowcast, updated 6-8 times per quarter.",
    longDef:
      "GDPNow aggregates incoming indicators into a model-based estimate of the quarter's GDP growth rate before BEA releases advance data. Historically, GDPNow's final pre-release estimate is within 0.4 percentage points of the advance GDP print.",
    keywords: ["GDPNow", "Atlanta Fed GDPNow", "real time GDP"],
    relatedIndicators: ["gdpnow"],
    relatedTerms: ["recession-indicator"],
  },
  "cass-freight-index": {
    slug: "cass-freight-index",
    term: "Cass Freight Index",
    shortDef:
      "A monthly index of North American freight shipments and expenditures based on billions of dollars of actual invoices.",
    longDef:
      "The Cass Shipments index historically leads ISM PMI by 2-3 months. Year-over-year declines of 5% or more have coincided with industrial slowdowns and often preceded broader recessions.",
    keywords: ["Cass freight index", "freight recession"],
    relatedIndicators: ["freight-index"],
    relatedTerms: ["recession-indicator"],
  },
  "building-permits": {
    slug: "building-permits",
    term: "Building Permits",
    shortDef:
      "Authorizations issued by local jurisdictions for private housing units to be built.",
    longDef:
      "Building permits are the earliest available housing data. Year-over-year declines of 10% or more historically precede recessions by 9-15 months. Permits are a component of the Conference Board LEI.",
    keywords: ["building permits recession", "housing permits"],
    relatedIndicators: ["building-permits", "housing-starts"],
    relatedTerms: ["leading-economic-index", "recession-indicator"],
  },
  "housing-starts": {
    slug: "housing-starts",
    term: "Housing Starts",
    shortDef:
      "Privately-owned housing units whose foundations were begun in a given month.",
    longDef:
      "Housing starts lag permits by roughly 1 month. They are an early, cyclical signal because residential investment contracts sharply during monetary tightening cycles.",
    keywords: ["housing starts", "residential construction"],
    relatedIndicators: ["housing-starts", "building-permits"],
    relatedTerms: ["building-permits"],
  },
  "initial-claims": {
    slug: "initial-claims",
    term: "Initial Jobless Claims",
    shortDef:
      "Weekly count of first-time filings for unemployment insurance benefits.",
    longDef:
      "Initial claims are the highest-frequency labor indicator. Sustained readings above 300k-350k (after adjusting for trend labor-force growth) have historically preceded recessions. Claims are noisy week-to-week; use the 4-week moving average.",
    keywords: ["initial jobless claims", "unemployment claims"],
    relatedIndicators: ["initial-claims", "unemployment-rate"],
    relatedTerms: ["sahm-rule"],
  },
  "consumer-sentiment": {
    slug: "consumer-sentiment",
    term: "Consumer Sentiment",
    shortDef:
      "A survey-based index measuring how optimistic households feel about the economy and their personal finances.",
    longDef:
      "Both the University of Michigan and Conference Board publish consumer sentiment. Readings in the bottom decile of the post-1980 range have coincided with recessions in most cycles, though sentiment can diverge from actual spending.",
    keywords: ["consumer sentiment", "consumer confidence", "Michigan sentiment"],
    relatedIndicators: ["consumer-sentiment"],
    relatedTerms: ["recession-indicator"],
  },
  "nfib-optimism": {
    slug: "nfib-optimism",
    term: "NFIB Small Business Optimism Index",
    shortDef:
      "A monthly survey of small business owners' expectations for hiring, capex, and sales.",
    longDef:
      "The NFIB index has tracked the business cycle for 50 years. Readings below 90 have historically coincided with or preceded recessions. Small businesses employ roughly half of the US workforce, making NFIB a cyclically important indicator.",
    keywords: ["NFIB optimism", "small business optimism"],
    relatedIndicators: ["nfib-optimism"],
    relatedTerms: ["recession-indicator"],
  },
  "inventory-sales-ratio": {
    slug: "inventory-sales-ratio",
    term: "Inventory-to-Sales Ratio",
    shortDef:
      "The ratio of inventories held by manufacturers, wholesalers, and retailers to their monthly sales.",
    longDef:
      "A rising inventory-to-sales ratio signals that demand is slowing faster than production. Sustained increases typically precede production cuts and layoffs by 2-6 months.",
    keywords: ["inventory to sales", "inventory buildup recession"],
    relatedIndicators: ["inventory-sales-ratio"],
    relatedTerms: ["recession-indicator"],
  },
  "corporate-profits": {
    slug: "corporate-profits",
    term: "Corporate Profits",
    shortDef:
      "After-tax corporate profits as reported in the US national income and product accounts.",
    longDef:
      "Corporate profits YoY turning negative for two consecutive quarters is the single cleanest business-side recession tell in the post-WWII era. Firms cut capex and hiring when profits compress.",
    keywords: ["corporate profits recession", "NIPA profits"],
    relatedIndicators: ["corporate-profits"],
    relatedTerms: ["recession-indicator"],
  },
  "personal-savings-rate": {
    slug: "personal-savings-rate",
    term: "Personal Savings Rate",
    shortDef:
      "The share of disposable personal income that households save rather than spend.",
    longDef:
      "A personal savings rate below 3% has preceded every consumer-led recession since 1980. When households run out of cushion, any income shock translates directly into spending cuts.",
    keywords: ["personal savings rate", "household savings"],
    relatedIndicators: ["personal-savings-rate"],
    relatedTerms: ["credit-card-delinquency-rate"],
  },
  "credit-card-delinquency-rate": {
    slug: "credit-card-delinquency-rate",
    term: "Credit Card Delinquency Rate",
    shortDef:
      "The share of credit card balances that are 30+ or 90+ days past due.",
    longDef:
      "Credit card delinquencies climb 6 months before unemployment in most cycles. The 2024 print reached its highest level since the GFC, flagging meaningful consumer stress.",
    keywords: ["credit card delinquency", "consumer credit stress"],
    relatedIndicators: ["credit-card-delinquency"],
    relatedTerms: ["personal-savings-rate"],
  },
  sloos: {
    slug: "sloos",
    term: "SLOOS (Senior Loan Officer Opinion Survey)",
    shortDef:
      "The Fed's quarterly survey of senior loan officers on lending standards and loan demand.",
    longDef:
      "SLOOS tightening above 40% of banks has preceded every recession since the survey began in 1990. The survey has a 6-9 month lead because loan-standards tightening takes time to flow through to actual loan contractions.",
    keywords: ["SLOOS", "loan officer survey", "bank lending standards"],
    relatedIndicators: ["sloos-lending"],
    relatedTerms: ["recession-indicator"],
  },
  "debt-service-ratio": {
    slug: "debt-service-ratio",
    term: "Household Debt Service Ratio",
    shortDef:
      "Total household debt service payments as a share of disposable personal income.",
    longDef:
      "A debt service ratio exceeding 10% of disposable income has accompanied every consumer-led recession since 1980. Mortgage payments dominate the ratio, making it sensitive to rate cycles.",
    keywords: ["debt service ratio", "household debt burden"],
    relatedIndicators: ["debt-service-ratio"],
    relatedTerms: ["personal-savings-rate"],
  },
  "temp-help-services": {
    slug: "temp-help-services",
    term: "Temporary Help Services Employment",
    shortDef:
      "Employment in the temporary help services industry tracked monthly by BLS.",
    longDef:
      "Temporary help services employment is highly cyclical — employers adjust temp staffing before making cuts to permanent headcount. A 12-month decline in temp help has preceded every recession since 1990.",
    keywords: ["temp help services", "temporary employment recession"],
    relatedIndicators: ["temp-help-services"],
    relatedTerms: ["sahm-rule"],
  },
  buffett: {
    slug: "buffett-indicator",
    term: "Buffett Indicator",
    shortDef:
      "The ratio of total US stock market capitalization to US GDP, used as a market-valuation gauge.",
    longDef:
      "Named for Warren Buffett, who called it 'probably the best single measure of where valuations stand at any given moment.' Readings above 150% are considered significantly overvalued; above 200% extremely so. The ratio peaked near 200% in 2022 and 2000.",
    keywords: ["Buffett indicator", "market cap to GDP"],
    relatedIndicators: ["sp500-gdp", "djia-gdp", "nasdaq-gdp"],
    relatedTerms: ["pe-ratio"],
  },
  "pe-ratio": {
    slug: "pe-ratio",
    term: "Price-to-Earnings (P/E) Ratio",
    shortDef:
      "The ratio of a stock's or index's price to its trailing twelve-month earnings per share.",
    longDef:
      "P/E ratios are the most common valuation metric. S&P 500 P/E above 25 is historically expensive; above 30 is comparable to the dot-com peak. Shiller CAPE (cyclically adjusted P/E) smooths over cycles for comparability.",
    keywords: ["P/E ratio", "price earnings", "Shiller CAPE"],
    relatedIndicators: ["sp500-pe", "djia-pe", "nasdaq-pe"],
    relatedTerms: ["buffett-indicator"],
  },
  "sp500": {
    slug: "sp500",
    term: "S&P 500",
    shortDef:
      "A market-cap-weighted index of 500 leading US companies.",
    longDef:
      "The S&P 500 is the most widely followed US equity benchmark. Sustained declines of 20% or more ('bear markets') have accompanied recessions in most cycles, though not all bear markets are recessionary.",
    keywords: ["S&P 500", "SPX index"],
    relatedIndicators: ["sp500", "vix"],
    relatedTerms: ["vix", "buffett-indicator"],
  },
  "ny-fed-recession-probability": {
    slug: "ny-fed-recession-probability",
    term: "NY Fed Recession Probability",
    shortDef:
      "A monthly recession-probability model published by the New York Fed, based on the 3m10y yield curve spread.",
    longDef:
      "Originally developed by economist Arturo Estrella, the NY Fed model converts the 3-month/10-year yield spread into a probability of recession over the next 12 months. Readings above 50% have preceded every recession since 1968.",
    keywords: ["NY Fed recession probability", "Estrella model"],
    relatedIndicators: ["ny-fed-recession-prob", "yield-curve-2s10s"],
    relatedTerms: ["yield-curve-inversion"],
  },
  "bank-unrealized-losses": {
    slug: "bank-unrealized-losses",
    term: "Bank Unrealized Losses on Securities",
    shortDef:
      "The cumulative mark-to-market losses banks are carrying on their held-to-maturity securities portfolios.",
    longDef:
      "FDIC-reported unrealized losses on bank securities topped $600 billion during the 2022-23 rate-hike cycle. These losses do not hit earnings unless sold, but they create deposit-run risk in the event of liquidity stress, as demonstrated by SVB in March 2023.",
    keywords: ["bank unrealized losses", "HTM securities losses"],
    relatedIndicators: ["bank-unrealized-losses"],
    relatedTerms: ["fed-funds-rate"],
  },
  "dxy-dollar-index": {
    slug: "dxy-dollar-index",
    term: "DXY (US Dollar Index)",
    shortDef:
      "A trade-weighted index measuring the dollar against a basket of major currencies.",
    longDef:
      "DXY rallies typically coincide with tighter global liquidity and stress in EM economies dollar-funded. Sharp DXY rallies in 2022 and during the 1997-98 Asian crisis foreshadowed meaningful growth scares.",
    keywords: ["DXY", "dollar index", "US dollar index"],
    relatedIndicators: ["dxy-dollar-index"],
    relatedTerms: ["inflation"],
  },
  "emerging-markets": {
    slug: "emerging-markets",
    term: "Emerging Markets Equities",
    shortDef:
      "Equities of developing-economy countries, tracked by indices like MSCI EM.",
    longDef:
      "EM equities are sensitive to global liquidity and dollar cycles. Persistent EM underperformance vs DM has historically preceded global growth scares.",
    keywords: ["emerging markets equities", "MSCI EM", "EM stocks"],
    relatedIndicators: ["emerging-markets", "dxy-dollar-index"],
    relatedTerms: ["dxy-dollar-index"],
  },
  "gold-silver-ratio": {
    slug: "gold-silver-ratio",
    term: "Gold-Silver Ratio",
    shortDef:
      "The price of gold divided by the price of silver, historically used as a risk-sentiment gauge.",
    longDef:
      "Gold is primarily a monetary hedge; silver has dual industrial/monetary use. Spikes in the ratio above 80 have coincided with risk-off regimes and cyclical slowdowns.",
    keywords: ["gold silver ratio", "gold to silver"],
    relatedIndicators: ["gold-silver-ratio", "copper-gold-ratio"],
    relatedTerms: ["copper-gold-ratio"],
  },
  "debt-to-gdp": {
    slug: "debt-to-gdp",
    term: "Debt-to-GDP Ratio",
    shortDef:
      "The ratio of total US federal debt to nominal GDP.",
    longDef:
      "US debt-to-GDP exceeded 120% after the pandemic, a level last seen after WWII. Elevated debt-to-GDP constrains fiscal space in a recession and raises long-term interest-expense burdens.",
    keywords: ["debt to GDP", "US national debt GDP"],
    relatedIndicators: ["debt-to-gdp-ratio", "us-national-debt", "us-interest-expense"],
    relatedTerms: ["fed-funds-rate"],
  },
  "3ds-rule": {
    slug: "3ds-rule",
    term: "LEI 3Ds Rule",
    shortDef:
      "The Conference Board's framework for converting LEI declines into recession signals: Depth, Diffusion, Duration.",
    longDef:
      "The 3Ds rule triggers a recession signal when (1) the 6-month LEI growth rate is below -4.3%, (2) more than half of components are declining (diffusion), and (3) declines are sustained over multiple months. Historical accuracy exceeds 85%.",
    keywords: ["3Ds rule", "LEI 3Ds", "depth diffusion duration"],
    relatedIndicators: ["conference-board-lei"],
    relatedTerms: ["leading-economic-index", "recession-indicator"],
  },
  "bear-market": {
    slug: "bear-market",
    term: "Bear Market",
    shortDef:
      "A sustained decline in a major equity index of 20% or more from a recent peak.",
    longDef:
      "Bear markets are common during recessions but also occur independently (e.g. 2022). Peak-to-trough declines in recessionary bear markets average 35-45% and typically last 12-20 months.",
    keywords: ["bear market", "20 percent decline", "stock market crash"],
    relatedIndicators: ["sp500", "nasdaq", "dow-jones"],
    relatedTerms: ["recession-indicator"],
  },
  "quantitative-tightening": {
    slug: "quantitative-tightening",
    term: "Quantitative Tightening (QT)",
    shortDef:
      "Reduction of the Fed's balance sheet by allowing Treasuries and agency MBS to run off without reinvestment.",
    longDef:
      "QT drains reserves from the banking system and tightens financial conditions beyond what Fed Funds alone would imply. The 2022-24 QT cycle reduced the Fed balance sheet by over $1.5 trillion.",
    keywords: ["quantitative tightening", "Fed QT", "balance sheet runoff"],
    relatedIndicators: ["m2-money-supply", "on-rrp-facility"],
    relatedTerms: ["m2-money-supply", "on-rrp", "fed-funds-rate"],
  },
  "quantitative-easing": {
    slug: "quantitative-easing",
    term: "Quantitative Easing (QE)",
    shortDef:
      "Large-scale central-bank purchases of securities to lower long-term interest rates and expand bank reserves.",
    longDef:
      "QE was pioneered by the Bank of Japan in the 2000s and used extensively by the Fed after 2008 and again in 2020. QE lowers the term premium, compresses credit spreads, and supports asset prices.",
    keywords: ["quantitative easing", "QE", "Fed balance sheet"],
    relatedIndicators: ["m2-money-supply"],
    relatedTerms: ["quantitative-tightening", "m2-money-supply"],
  },
  "us-national-debt": {
    slug: "us-national-debt",
    term: "US National Debt",
    shortDef:
      "The total outstanding debt of the US federal government.",
    longDef:
      "US national debt surpassed $34 trillion in 2024. Net interest expense — the portion servicing this debt — now exceeds defense spending and is the fastest-growing line item in the federal budget.",
    keywords: ["US national debt", "federal debt", "34 trillion debt"],
    relatedIndicators: ["us-national-debt", "us-interest-expense", "debt-to-gdp-ratio"],
    relatedTerms: ["debt-to-gdp"],
  },
  "us-interest-expense": {
    slug: "us-interest-expense",
    term: "US Federal Interest Expense",
    shortDef:
      "Annual federal spending to service the national debt.",
    longDef:
      "Federal interest expense crossed $1 trillion annualized in 2024, now exceeding the defense budget. Elevated interest expense crowds out other fiscal spending and reduces counter-cyclical flexibility.",
    keywords: ["US interest expense", "federal debt service"],
    relatedIndicators: ["us-interest-expense", "us-national-debt"],
    relatedTerms: ["us-national-debt", "debt-to-gdp"],
  },
  "gdp-growth": {
    slug: "gdp-growth",
    term: "GDP Growth",
    shortDef:
      "The annualized percentage change in real gross domestic product.",
    longDef:
      "Two consecutive quarters of negative real GDP growth is the popular rule-of-thumb definition of recession, though NBER uses a broader set of criteria. GDP is released quarterly with a 4-6 week lag, making it a lagging indicator.",
    keywords: ["GDP growth", "real GDP", "GDP contraction"],
    relatedIndicators: ["gdp-growth", "gdpnow"],
    relatedTerms: ["gdpnow", "recession"],
  },
  "unemployment-rate": {
    slug: "unemployment-rate",
    term: "Unemployment Rate",
    shortDef:
      "The share of the civilian labor force that is jobless and actively seeking work.",
    longDef:
      "The headline U-3 rate excludes discouraged workers and part-time-for-economic-reasons; U-6 is the broader measure. The unemployment rate is a coincident-to-lagging recession indicator that rises rapidly once cyclical layoffs accelerate.",
    keywords: ["unemployment rate", "U-3 U-6", "jobless rate"],
    relatedIndicators: ["unemployment-rate", "sahm-rule", "initial-claims"],
    relatedTerms: ["sahm-rule", "initial-claims"],
  },
  "industrial-production": {
    slug: "industrial-production",
    term: "Industrial Production",
    shortDef:
      "A Fed index measuring output of manufacturing, mining, and utilities.",
    longDef:
      "Industrial production is one of the six indicators the NBER considers when dating recessions. It is more cyclical than services-sector output and turns down earlier in most cycles.",
    keywords: ["industrial production index", "manufacturing output"],
    relatedIndicators: ["industrial-production", "ism-manufacturing"],
    relatedTerms: ["nber-recession-dating", "ism-pmi"],
  },
  "real-personal-income": {
    slug: "real-personal-income",
    term: "Real Personal Income",
    shortDef:
      "Personal income adjusted for inflation, excluding transfer payments.",
    longDef:
      "Real personal income ex-transfers is one of the NBER's six core dating indicators. It captures both employment and wage dynamics without being distorted by stimulus payments.",
    keywords: ["real personal income", "real wages"],
    relatedIndicators: ["real-personal-income"],
    relatedTerms: ["nber-recession-dating"],
  },
  "conference-board-lei": {
    slug: "conference-board-lei",
    term: "Conference Board LEI",
    shortDef: "The Conference Board's monthly Leading Economic Index.",
    longDef:
      "See 'Leading Economic Index (LEI)' for details on the index construction, components, and the 3Ds rule framework.",
    keywords: ["conference board LEI", "leading economic index"],
    relatedIndicators: ["conference-board-lei"],
    relatedTerms: ["leading-economic-index", "3ds-rule"],
  },
};

export const GLOSSARY_SLUGS = Object.keys(GLOSSARY);
