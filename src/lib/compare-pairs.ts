/**
 * Curated set of high-intent indicator comparison pages.
 *
 * These pairs power `/indicators/compare/[a]-vs-[b]`. Each pair has:
 *  - A canonical URL slug: `${a}-vs-${b}` (alphabetical by slug for de-dup)
 *  - A pre-written narrative so the page is dense at build time even
 *    before any dynamic data loads
 *  - A `question` framing that matches common searcher intent
 *
 * Keep pairs high-signal only — avoid filling the cartesian product.
 * Better to have 40 strong pages than 500 thin ones.
 */

export interface ComparePair {
  a: string;
  b: string;
  slug: string;
  question: string;
  headline: string;
  narrative: string;
  winner: "a" | "b" | "tie";
  winnerReason: string;
  keywords: string[];
}

function makePair(
  a: string,
  b: string,
  data: Omit<ComparePair, "a" | "b" | "slug">,
): ComparePair {
  const [x, y] = a < b ? [a, b] : [b, a];
  return { a: x, b: y, slug: `${x}-vs-${y}`, ...data };
}

const PAIRS: ComparePair[] = [
  makePair("sahm-rule", "yield-curve-2s10s", {
    question: "Which is the better recession indicator — Sahm Rule or 2s10s yield curve?",
    headline: "Sahm Rule vs Yield Curve (2s10s)",
    narrative:
      "These are the two most-cited recession indicators in modern macro writing. The 2s10s yield curve inverts typically 12-18 months before a recession and has the longer historical lead time. The Sahm Rule, based on the unemployment rate's rise from its 12-month low, triggers closer to the recession itself but has had a cleaner track record (no false positives until 2024's revision-driven trigger). Use them together: 2s10s for early warning, Sahm Rule for confirmation.",
    winner: "tie",
    winnerReason:
      "Yield curve wins on lead time; Sahm Rule wins on false-positive rate. Best used together.",
    keywords: ["sahm rule vs yield curve", "best recession indicator", "yield curve sahm rule"],
  }),
  makePair("sahm-rule", "unemployment-rate", {
    question: "Sahm Rule vs headline unemployment rate — which signals recession first?",
    headline: "Sahm Rule vs Unemployment Rate",
    narrative:
      "The Sahm Rule is a derivative of the unemployment rate — specifically, the 3-month average minus the 12-month low. It fires earlier than any rule based on the absolute level of unemployment, because it captures the second derivative (rate of change) rather than the level. Historically the Sahm Rule has led recessions by 2-4 months, while headline unemployment often crosses 5% well after the NBER peak.",
    winner: "a",
    winnerReason:
      "Sahm Rule wins decisively on timing: it captures the rate-of-change rather than the level.",
    keywords: ["sahm rule vs unemployment", "sahm rule explained", "best labor market recession signal"],
  }),
  makePair("yield-curve-2s10s", "yield-curve-2s30s", {
    question: "2s10s vs 2s30s — which yield curve spread is the better recession signal?",
    headline: "Yield Curve 2s10s vs 2s30s",
    narrative:
      "Both spreads have inverted before every post-war recession. The 2s10s is cited more often because it inverts earlier and more cleanly. The 2s30s is stickier — it rarely inverts and tends to stay inverted longer, making it useful for confirmation. For early warning, watch 2s10s; for judging the depth of the recession-pricing regime, watch 2s30s.",
    winner: "a",
    winnerReason:
      "2s10s is the primary signal in academic and practitioner literature; 2s30s is a useful confirmatory.",
    keywords: ["2s10s vs 2s30s", "yield curve spread comparison", "best yield curve recession indicator"],
  }),
  makePair("yield-curve-2s10s", "ny-fed-recession-prob", {
    question: "2s10s spread vs NY Fed Recession Probability model — which is more accurate?",
    headline: "Yield Curve (2s10s) vs NY Fed Recession Probability",
    narrative:
      "The NY Fed's recession-probability model is built on the 3m10y yield curve spread, which is closely correlated with 2s10s but slightly more sensitive at cyclical extremes. The NY Fed model converts the spread into a probability, making it easier to communicate than the raw spread. Above 50% probability, it has preceded every recession since 1968. Use the NY Fed model as a compressed, interpretable version of the 2s10s signal.",
    winner: "b",
    winnerReason:
      "NY Fed probability is easier to interpret and slightly more sensitive — cleaner for communication.",
    keywords: ["NY Fed recession probability", "yield curve recession model", "Estrella recession model"],
  }),
  makePair("conference-board-lei", "sahm-rule", {
    question: "Conference Board LEI vs Sahm Rule — which gives more lead time?",
    headline: "Conference Board LEI vs Sahm Rule",
    narrative:
      "The Conference Board LEI aggregates 10 components and typically leads recessions by 6-12 months using the 3Ds rule. The Sahm Rule is a single-indicator labor-market trigger that fires near the recession start. LEI wins on lead time; Sahm Rule wins on simplicity and real-time availability. In practice: use LEI 3Ds for macro forecasting, Sahm Rule for 'is it happening now?' decisions.",
    winner: "a",
    winnerReason:
      "LEI's 3Ds rule has 6-12 month lead time; Sahm Rule has ~2 month lead time.",
    keywords: ["LEI vs sahm rule", "conference board LEI recession", "leading vs coincident indicators"],
  }),
  makePair("ism-manufacturing", "conference-board-lei", {
    question: "ISM Manufacturing PMI vs Conference Board LEI — both have lead time, which wins?",
    headline: "ISM Manufacturing PMI vs Conference Board LEI",
    narrative:
      "ISM PMI is a single-month diffusion index; LEI is a 10-component composite. ISM new orders is actually a component of the LEI. The LEI wins on breadth and historical track record (85% accuracy with the 3Ds rule). ISM wins on timeliness — it releases the first business day of every month, while LEI lags by 3-4 weeks.",
    winner: "b",
    winnerReason:
      "LEI has the better composite record; ISM is a key input to it.",
    keywords: ["ISM vs LEI", "manufacturing PMI vs LEI", "composite vs single recession indicator"],
  }),
  makePair("credit-spreads", "vix", {
    question: "Credit spreads vs VIX — which is a better stress signal?",
    headline: "Credit Spreads vs VIX",
    narrative:
      "Credit spreads measure default-risk pricing in the high-yield bond market; VIX measures implied volatility on S&P 500 options. Credit spreads move more persistently and reflect balance-sheet-level stress. VIX spikes around events but normalizes quickly. Historically, credit spreads above 500 bps are the sharper recession tell; VIX above 30 is a necessary but not sufficient condition.",
    winner: "a",
    winnerReason:
      "Credit spreads capture solvency stress; VIX captures short-term event risk. For recession signaling, credit spreads win.",
    keywords: ["credit spreads vs VIX", "high yield spread", "best market stress indicator"],
  }),
  makePair("nfci", "credit-spreads", {
    question: "NFCI vs high-yield credit spreads — which captures financial conditions better?",
    headline: "NFCI vs Credit Spreads",
    narrative:
      "The NFCI aggregates 105 measures of financial conditions, including credit spreads, into a single standardized index. It captures conditions across money markets, debt, equity, and banking sectors. Credit spreads alone are one piece of the puzzle — the NFCI is the more complete picture. Use NFCI for a single dashboard number; use credit spreads for the underlying signal when NFCI moves.",
    winner: "a",
    winnerReason:
      "NFCI is broader and more complete; credit spreads are one of its components.",
    keywords: ["NFCI vs credit spreads", "financial conditions index", "chicago fed NFCI"],
  }),
  makePair("credit-card-delinquency", "personal-savings-rate", {
    question: "Credit card delinquencies vs personal savings rate — which warns first on consumer stress?",
    headline: "Credit Card Delinquency vs Personal Savings Rate",
    narrative:
      "Personal savings rate is a leading indicator: households run through cushion before missing payments. Credit card delinquencies are a coincident-to-lagging indicator: they show when stress has already hit the consumer balance sheet. A savings rate below 3% historically precedes rising delinquencies by 2-6 months.",
    winner: "b",
    winnerReason:
      "Savings rate leads; delinquencies confirm. Watch savings rate first.",
    keywords: ["credit card delinquency vs savings rate", "consumer stress indicators", "household stress"],
  }),
  makePair("initial-claims", "unemployment-rate", {
    question: "Initial jobless claims vs unemployment rate — which is more timely?",
    headline: "Initial Jobless Claims vs Unemployment Rate",
    narrative:
      "Initial claims are weekly and highly current — within 5 days of filing. The unemployment rate is monthly and uses the CPS household survey. Claims lead the unemployment rate by 2-4 weeks but are much noisier; use the 4-week moving average. Claims spiking above 300k sustained has preceded every post-WWII recession.",
    winner: "a",
    winnerReason:
      "Claims are 4x more frequent and lead by 2-4 weeks. Best high-frequency labor signal.",
    keywords: ["initial claims vs unemployment", "jobless claims recession", "labor market high frequency"],
  }),
  makePair("jolts-quits-rate", "initial-claims", {
    question: "JOLTS quits rate vs initial claims — which measures labor market heat?",
    headline: "JOLTS Quits Rate vs Initial Jobless Claims",
    narrative:
      "Quits rate measures voluntary separations — workers feel confident enough to leave. Claims measure involuntary separations — workers getting laid off. Quits rate falls in early slowdowns (workers sense weakness and stop quitting); claims rise in later-stage slowdowns (actual layoffs start). Quits rate wins on timing.",
    winner: "a",
    winnerReason:
      "Quits rate leads claims by 3-6 months; best early-warning labor signal.",
    keywords: ["JOLTS quits vs claims", "labor market heat", "quits rate recession"],
  }),
  makePair("building-permits", "housing-starts", {
    question: "Building permits vs housing starts — which is the better leading housing signal?",
    headline: "Building Permits vs Housing Starts",
    narrative:
      "Both are monthly Census Bureau housing releases. Permits are authorizations (intent); starts are actual groundbreakings (commitment). Permits lead starts by roughly one month and are a component of the Conference Board LEI. Sustained YoY permit declines of 10%+ have preceded every recession since the 1960s.",
    winner: "a",
    winnerReason:
      "Permits precede starts by a month and are a component of LEI. Use permits for leading signal.",
    keywords: ["building permits vs housing starts", "housing leading indicator", "residential construction"],
  }),
  makePair("fed-funds-rate", "yield-curve-2s10s", {
    question: "Fed Funds rate vs 2s10s spread — which drives recession risk?",
    headline: "Fed Funds Rate vs Yield Curve (2s10s)",
    narrative:
      "The Fed Funds rate is the policy tool; the 2s10s spread is the market's response to expected policy. When the Fed hikes aggressively, short rates rise faster than long rates and the curve inverts. Inversion is the market signaling the Fed has gone too far. Every Fed hiking cycle since 1955 except 1994-95 has produced either a recession or a significant financial-stress event.",
    winner: "tie",
    winnerReason:
      "Fed Funds is the cause; 2s10s is the market's forecast of the effect. Both are essential.",
    keywords: ["fed funds rate vs yield curve", "Fed policy recession", "monetary policy recession"],
  }),
  makePair("copper-gold-ratio", "vix", {
    question: "Copper-gold ratio vs VIX — which is a better growth signal?",
    headline: "Copper-Gold Ratio vs VIX",
    narrative:
      "Copper-gold ratio tracks cyclical growth expectations via commodity positioning. VIX tracks equity-market stress via options. In growth scares, copper-gold falls before VIX rises — commodity markets often front-run equity repricing. Gundlach has cited copper-gold as a proxy for 10-year Treasury yields.",
    winner: "a",
    winnerReason:
      "Copper-gold leads growth regime shifts; VIX reacts to them.",
    keywords: ["copper gold ratio vs VIX", "growth scare indicator", "gundlach copper gold"],
  }),
  makePair("gdpnow", "gdp-growth", {
    question: "GDPNow vs actual GDP growth — how accurate is the nowcast?",
    headline: "GDPNow Nowcast vs GDP Growth",
    narrative:
      "GDPNow is the Atlanta Fed's real-time model-based estimate of the current quarter's GDP. It updates 6-8 times per quarter as new data flows in. The final pre-release GDPNow estimate has historically been within 0.4 percentage points of the BEA's advance GDP print. For current-quarter reads, GDPNow is the only game in town; BEA advance doesn't arrive until the quarter is 4 weeks over.",
    winner: "a",
    winnerReason:
      "GDPNow is the best real-time estimate; BEA is the ground truth but lags 4-8 weeks.",
    keywords: ["GDPNow vs GDP", "Atlanta Fed nowcast", "real time GDP"],
  }),
  makePair("m2-money-supply", "fed-funds-rate", {
    question: "M2 money supply vs Fed Funds rate — which reflects Fed policy better?",
    headline: "M2 Money Supply vs Fed Funds Rate",
    narrative:
      "Fed Funds is the policy-rate tool; M2 is the aggregate-money response. M2 growth has historically led nominal GDP by 12 months. The 2022-23 M2 contraction (the first post-WWII) was the Fed's quantitative tightening showing up on bank balance sheets. Monetarists watch M2; Keynesians watch Fed Funds. Both tell part of the story.",
    winner: "tie",
    winnerReason:
      "Different tools for different questions: Fed Funds for policy stance, M2 for liquidity transmission.",
    keywords: ["M2 vs fed funds", "money supply vs interest rates", "monetary aggregates"],
  }),
  makePair("dxy-dollar-index", "emerging-markets", {
    question: "DXY dollar index vs emerging-markets equities — how do they interact?",
    headline: "DXY Dollar Index vs Emerging Markets",
    narrative:
      "DXY strength typically coincides with EM weakness — dollar-funded EM economies face debt-service stress when the dollar rallies. Historical DXY rallies (2014-16, 2022) have coincided with EM underperformance. Persistent EM equity weakness vs DM is a canary for global growth slowdowns.",
    winner: "tie",
    winnerReason:
      "They are two sides of the same coin: DXY up ⇒ EM down, and vice versa.",
    keywords: ["DXY vs emerging markets", "dollar strength EM", "global liquidity EM"],
  }),
  makePair("sp500-pe", "buffett-indicator", {
    question: "S&P 500 P/E ratio vs Buffett indicator — which signals overvaluation better?",
    headline: "S&P 500 P/E vs Buffett Indicator",
    narrative:
      "P/E ratios are earnings-normalized; the Buffett indicator (market cap to GDP) is economy-normalized. Both peaked at historic highs in 2000 and 2021. P/E captures near-term earnings dynamics; Buffett indicator captures long-run wealth concentration. Use P/E for cycle valuation; Buffett indicator for secular valuation.",
    winner: "tie",
    winnerReason:
      "Different normalizations answer different questions. Both flash red at major peaks.",
    keywords: ["P/E vs Buffett indicator", "market valuation", "stock market overvalued"],
  }),
  makePair("corporate-profits", "sp500", {
    question: "Corporate profits vs S&P 500 — what leads what?",
    headline: "Corporate Profits vs S&P 500",
    narrative:
      "The S&P 500 is a discount of future expected earnings, so in theory it should lead reported corporate profits. In practice, equities get ahead of profits at cyclical extremes. A 2-quarter YoY decline in NIPA corporate profits is the single cleanest business-side recession tell. The S&P 500 often rolls over 3-6 months before profits bottom.",
    winner: "tie",
    winnerReason:
      "S&P 500 leads at turning points; profits confirm. Use both.",
    keywords: ["corporate profits vs S&P 500", "earnings recession", "profits stocks correlation"],
  }),
  makePair("bank-unrealized-losses", "nfci", {
    question: "Bank unrealized losses vs NFCI — which warned about SVB?",
    headline: "Bank Unrealized Losses vs NFCI",
    narrative:
      "Bank unrealized losses on securities peaked at $650B in 2022-23, flagging solvency fragility that materialized at SVB, Signature, and First Republic in March 2023. NFCI captures aggregate financial-conditions tightening but did not single out bank-specific stress. For bank-system risk, watch unrealized losses; for general financial-conditions tightening, watch NFCI.",
    winner: "a",
    winnerReason:
      "Unrealized losses are the bank-specific risk metric; NFCI is the broader aggregate.",
    keywords: ["bank unrealized losses", "SVB indicators", "banking crisis signals"],
  }),
  makePair("debt-to-gdp-ratio", "us-interest-expense", {
    question: "US debt-to-GDP vs interest expense — which matters more for fiscal sustainability?",
    headline: "US Debt-to-GDP vs Interest Expense",
    narrative:
      "Debt-to-GDP measures the stock; interest expense measures the flow cost. A high debt level at low rates is manageable; a moderate debt level at high rates is not. Interest expense crossed $1T annualized in 2024, now exceeding defense spending. The interaction between high rates and high debt-to-GDP is what makes the post-pandemic fiscal trajectory structurally different from 2019.",
    winner: "b",
    winnerReason:
      "Interest expense is the current-year fiscal constraint; debt-to-GDP is context for it.",
    keywords: ["US debt to GDP vs interest expense", "fiscal sustainability", "national debt servicing"],
  }),
  makePair("gold-silver-ratio", "copper-gold-ratio", {
    question: "Gold-silver ratio vs copper-gold ratio — which is the better macro signal?",
    headline: "Gold-Silver Ratio vs Copper-Gold Ratio",
    narrative:
      "Gold-silver is a pure monetary/risk-sentiment metric (both metals hold store-of-value properties but silver has more industrial use). Copper-gold is a growth metric (copper cyclical, gold counter-cyclical). For recession signaling, copper-gold is cleaner. Gold-silver ratio spikes above 80 are risk-off markers but can be driven by idiosyncratic silver moves.",
    winner: "b",
    winnerReason:
      "Copper-gold has the cleaner growth-regime signal and tracks 10-year yields.",
    keywords: ["gold silver ratio vs copper gold", "commodity recession signals", "metals ratio analysis"],
  }),
  makePair("nfib-optimism", "consumer-sentiment", {
    question: "NFIB small-business optimism vs consumer sentiment — which drives hiring?",
    headline: "NFIB Optimism vs Consumer Sentiment",
    narrative:
      "NFIB captures business-owner expectations for hiring and capex — a direct input to actual hiring decisions. Consumer sentiment captures household attitudes about spending. NFIB has the more direct link to aggregate hiring; consumer sentiment has the more direct link to consumption. Both are sentiment surveys — use with actual behavioral indicators.",
    winner: "a",
    winnerReason:
      "Small businesses employ half the workforce; NFIB links more directly to hiring.",
    keywords: ["NFIB vs consumer sentiment", "small business optimism", "sentiment surveys recession"],
  }),
  makePair("inventory-sales-ratio", "ism-manufacturing", {
    question: "Inventory-to-sales ratio vs ISM PMI — which catches the inventory cycle?",
    headline: "Inventory-Sales Ratio vs ISM Manufacturing",
    narrative:
      "Both track inventory dynamics. Inventory-to-sales is an actual ratio from Census data; ISM inventories is a survey diffusion index. The Census ratio is the ground truth but lags 6 weeks; ISM inventories leads by 1-2 months. A rising Census I/S ratio combined with sub-50 ISM inventories is the sharpest inventory-liquidation signal available.",
    winner: "tie",
    winnerReason:
      "ISM leads; Census is the ground truth. Use both in sequence.",
    keywords: ["inventory sales ratio vs ISM", "inventory cycle", "destocking recession"],
  }),
  makePair("sloos-lending", "credit-spreads", {
    question: "SLOOS lending standards vs credit spreads — which matters more for the credit cycle?",
    headline: "SLOOS Lending Standards vs Credit Spreads",
    narrative:
      "SLOOS measures bank-lender behavior — actual lending standards. Credit spreads measure bond-market pricing of default risk. SLOOS leads by 6-9 months because loan-standard changes take time to translate into credit contractions. Credit spreads react in real-time to market events. Use SLOOS for forecasting; credit spreads for confirmation.",
    winner: "a",
    winnerReason:
      "SLOOS has 6-9 month lead over credit spreads. Better for early warning.",
    keywords: ["SLOOS vs credit spreads", "bank lending standards", "credit cycle indicators"],
  }),
  makePair("temp-help-services", "jolts-quits-rate", {
    question: "Temp help services employment vs JOLTS quits rate — which leads labor market turns?",
    headline: "Temp Help Services vs JOLTS Quits Rate",
    narrative:
      "Temp help employment is highly cyclical — employers adjust temp staffing before cutting permanent headcount. JOLTS quits rate measures voluntary leaves — workers feel confident enough to quit. Both lead nonfarm payrolls. Temp help tends to turn first at the aggregate level; quits rate is more sensitive to labor-market tightness.",
    winner: "a",
    winnerReason:
      "Temp help employment is the earliest signal of labor-market deterioration.",
    keywords: ["temp help vs JOLTS", "labor market leading indicators", "temporary employment recession"],
  }),
  makePair("freight-index", "ism-manufacturing", {
    question: "Cass freight index vs ISM Manufacturing — which leads the goods economy?",
    headline: "Cass Freight Index vs ISM Manufacturing",
    narrative:
      "Cass freight shipments measure actual goods movement; ISM measures manufacturing sentiment. Cass has historically led ISM by 2-3 months. Cass YoY declines of 5%+ have coincided with industrial slowdowns. For goods-economy forecasting, Cass leads; ISM confirms.",
    winner: "a",
    winnerReason:
      "Cass uses actual invoice data and leads ISM by 2-3 months.",
    keywords: ["Cass freight vs ISM", "freight recession", "goods economy indicators"],
  }),
  makePair("on-rrp-facility", "m2-money-supply", {
    question: "ON RRP facility vs M2 money supply — what's happening to system liquidity?",
    headline: "ON RRP Facility vs M2 Money Supply",
    narrative:
      "ON RRP balances are bank-reserve substitutes — when RRP drains, the cash either moves into bank reserves or flows into bills. M2 is the broad-money aggregate including household deposits. The 2022-24 RRP drain from $2.5T to near zero was the first leg of true QT; M2 contracted for the first time since WWII. Watch RRP for near-term liquidity; M2 for medium-term transmission.",
    winner: "tie",
    winnerReason:
      "Different slices of the liquidity picture. RRP is the Fed's buffer; M2 is the aggregate supply.",
    keywords: ["ON RRP vs M2", "system liquidity", "quantitative tightening"],
  }),
  makePair("nasdaq", "sp500", {
    question: "Nasdaq vs S&P 500 — which is more sensitive to recession?",
    headline: "Nasdaq vs S&P 500",
    narrative:
      "Nasdaq is tech-heavy and long-duration. S&P 500 is broader and more defensive. In recessions, Nasdaq typically drawdowns 50-80% (2001: -78%, 2008: -54%); S&P 500 drawdowns are 35-57% (2001: -49%, 2008: -57%). Nasdaq leads on the way up in recoveries and falls more on the way down in downturns. The Nasdaq/S&P 500 ratio is itself a risk-appetite signal.",
    winner: "b",
    winnerReason:
      "S&P 500 is the broader recession signal; Nasdaq amplifies both directions.",
    keywords: ["Nasdaq vs S&P 500", "tech stocks recession", "QQQ vs SPY"],
  }),
];

export const COMPARE_PAIRS: ComparePair[] = PAIRS;

export const COMPARE_PAIRS_BY_SLUG: Record<string, ComparePair> = Object.fromEntries(
  PAIRS.map((p) => [p.slug, p]),
);

export const COMPARE_SLUGS = PAIRS.map((p) => p.slug);

/**
 * Allow either ordering of the slug: `a-vs-b` OR `b-vs-a`.
 * Redirect non-canonical ordering to the canonical URL at the route level.
 */
export function findPair(a: string, b: string): ComparePair | undefined {
  const [x, y] = a < b ? [a, b] : [b, a];
  return COMPARE_PAIRS_BY_SLUG[`${x}-vs-${y}`];
}
