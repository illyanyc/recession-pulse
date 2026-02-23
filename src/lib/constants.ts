export const APP_NAME = "RecessionPulse";
export const APP_DESCRIPTION = "Real-time recession indicators delivered to your phone daily.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const FRED_BASE_URL = "https://api.stlouisfed.org/fred";

export const FRED_SERIES = {
  SAHM_RULE: "SAHMCURRENT",
  YIELD_CURVE_2S10S: "T10Y2Y",
  YIELD_CURVE_3M10Y: "T10Y3M",
  UNEMPLOYMENT_RATE: "UNRATE",
  ISM_PMI: "MANEMP",
  M2_MONEY_SUPPLY: "M2SL",
  INITIAL_CLAIMS: "ICSA",
  CONSUMER_CONFIDENCE: "UMCSENT",
  FED_FUNDS_RATE: "FEDFUNDS",
  CPI: "CPIAUCSL",
  REAL_GDP: "GDPC1",
  // Tier 1
  BUILDING_PERMITS: "PERMIT",
  REAL_PERSONAL_INCOME: "W875RX1",
  INDUSTRIAL_PRODUCTION: "INDPRO",
  JOLTS_QUITS_RATE: "JTSQUR",
  NFCI: "NFCI",
  TEMP_HELP_SERVICES: "TEMPHELPS",
  YIELD_CURVE_3M10Y_SPREAD: "T10Y3M",
  // Tier 2
  CORPORATE_PROFITS: "CP",
  PERSONAL_SAVINGS_RATE: "PSAVERT",
  CREDIT_CARD_DELINQUENCY: "DRCCLACBS",
  VIX: "VIXCLS",
  SLOOS_CI_TIGHTENING: "DRTSCILM",
  INSURED_UNEMPLOYMENT_RATE: "IURSA",
  // Tier 3
  FREIGHT_INDEX: "TSIFRGHTC",
  HOUSING_STARTS: "HOUST",
  INVENTORY_SALES_RATIO: "ISRATIO",
  DEBT_SERVICE_RATIO: "TDSP",
} as const;

export const INDICATOR_DEFINITIONS = [
  {
    slug: "sahm-rule",
    name: "Sahm Rule",
    fred_series: "SAHMCURRENT",
    category: "primary" as const,
    trigger_description: ">=0.50 triggers recession signal",
    evaluate: (value: number) => ({
      status: value >= 0.5 ? "danger" : value >= 0.3 ? "watch" : "safe",
      signal_emoji: value >= 0.5 ? "DANGER" : value >= 0.3 ? "WATCH" : "SAFE",
      signal: value >= 0.5 ? "TRIGGERED — recession likely" : value >= 0.3 ? "Elevated — monitor closely" : "Safe — below trigger",
    }),
  },
  {
    slug: "yield-curve-2s10s",
    name: "Yield Curve (2s10s)",
    fred_series: "T10Y2Y",
    category: "primary" as const,
    trigger_description: "Inversion (<0) precedes recession",
    evaluate: (value: number) => ({
      status: value < 0 ? "danger" : value < 0.5 ? "watch" : "safe",
      signal_emoji: value < 0 ? "DANGER" : value < 0.5 ? "WATCH" : "SAFE",
      signal: value < 0 ? "INVERTED — recession signal" : value < 0.5 ? "Watch — steepening after inversion" : "Normal spread",
    }),
  },
  {
    slug: "ism-manufacturing",
    name: "ISM Manufacturing PMI",
    fred_series: "MANEMP",
    category: "primary" as const,
    trigger_description: "Sub-50 = contraction",
    evaluate: (value: number) => ({
      status: value < 45 ? "danger" : value < 50 ? "warning" : value < 52 ? "watch" : "safe",
      signal_emoji: value < 45 ? "DANGER" : value < 50 ? "WARNING" : value < 52 ? "WATCH" : "SAFE",
      signal: value < 45 ? "Deep contraction" : value < 50 ? "Contraction territory" : value < 52 ? "Barely expanding" : "Expansion",
    }),
  },
  {
    slug: "initial-claims",
    name: "Initial Jobless Claims",
    fred_series: "ICSA",
    category: "secondary" as const,
    trigger_description: ">300K sustained = weakening labor",
    evaluate: (value: number) => ({
      status: value > 350000 ? "danger" : value > 300000 ? "warning" : value > 250000 ? "watch" : "safe",
      signal_emoji: value > 350000 ? "DANGER" : value > 300000 ? "WARNING" : value > 250000 ? "WATCH" : "SAFE",
      signal: value > 350000 ? "Surging claims" : value > 300000 ? "Elevated claims" : value > 250000 ? "Rising — monitor" : "Healthy labor market",
    }),
  },
  {
    slug: "consumer-sentiment",
    name: "Consumer Sentiment (UMich)",
    fred_series: "UMCSENT",
    category: "secondary" as const,
    trigger_description: "<60 = recessionary sentiment",
    evaluate: (value: number) => ({
      status: value < 55 ? "danger" : value < 65 ? "warning" : value < 75 ? "watch" : "safe",
      signal_emoji: value < 55 ? "DANGER" : value < 65 ? "WARNING" : value < 75 ? "WATCH" : "SAFE",
      signal: value < 55 ? "Crisis-level pessimism" : value < 65 ? "Weak confidence" : value < 75 ? "Below average" : "Consumer confident",
    }),
  },
  {
    slug: "fed-funds-rate",
    name: "Fed Funds Rate",
    fred_series: "FEDFUNDS",
    category: "secondary" as const,
    trigger_description: "Rate cuts after hiking cycle = late cycle",
    evaluate: (value: number) => ({
      status: value > 5 ? "warning" : value > 4 ? "watch" : "safe",
      signal_emoji: value > 5 ? "WARNING" : value > 4 ? "WATCH" : "SAFE",
      signal: value > 5 ? "Restrictive — stress building" : value > 4 ? "Elevated — monitoring" : "Accommodative",
    }),
  },
  {
    slug: "m2-money-supply",
    name: "M2 Money Supply",
    fred_series: "M2SL",
    category: "liquidity" as const,
    trigger_description: "Declining M2 = deflationary signal",
    evaluate: (_value: number, _yoyChange?: number) => ({
      status: "watch" as const,
      signal_emoji: "WATCH",
      signal: "Monitor YoY growth rate",
    }),
  },
  {
    slug: "unemployment-rate",
    name: "Unemployment Rate",
    fred_series: "UNRATE",
    category: "primary" as const,
    trigger_description: "Rising >0.5% from cycle low",
    evaluate: (value: number) => ({
      status: value > 5 ? "danger" : value > 4.5 ? "warning" : value > 4 ? "watch" : "safe",
      signal_emoji: value > 5 ? "DANGER" : value > 4.5 ? "WARNING" : value > 4 ? "WATCH" : "SAFE",
      signal: value > 5 ? "Recession-level unemployment" : value > 4.5 ? "Rising significantly" : value > 4 ? "Ticking up" : "Strong labor market",
    }),
  },
  // --- Tier 1: NBER Core & Leading ---
  {
    slug: "building-permits",
    name: "Building Permits",
    fred_series: "PERMIT",
    category: "housing" as const,
    trigger_description: "Declining permits = housing-led slowdown",
    evaluate: (value: number) => {
      const k = value / 1000;
      return {
        status: k < 1.2 ? "danger" : k < 1.4 ? "warning" : k < 1.6 ? "watch" : "safe",
        signal_emoji: k < 1.2 ? "DANGER" : k < 1.4 ? "WARNING" : k < 1.6 ? "WATCH" : "SAFE",
        signal: k < 1.2 ? "Sharply declining — housing recession risk" : k < 1.4 ? "Below trend — monitor" : k < 1.6 ? "Moderate — slowing" : `Healthy at ${k.toFixed(0)}K`,
      };
    },
  },
  {
    slug: "real-personal-income",
    name: "Real Personal Income (ex Transfers)",
    fred_series: "W875RX1",
    category: "primary" as const,
    trigger_description: "Declining = organic income contraction",
    evaluate: (value: number) => ({
      status: "watch",
      signal_emoji: "WATCH",
      signal: `$${(value / 1000).toFixed(1)}T annualized — monitor trend`,
    }),
  },
  {
    slug: "industrial-production",
    name: "Industrial Production Index",
    fred_series: "INDPRO",
    category: "primary" as const,
    trigger_description: "Declining = manufacturing/mining weakness",
    evaluate: (value: number) => ({
      status: value < 98 ? "danger" : value < 100 ? "warning" : value < 102 ? "watch" : "safe",
      signal_emoji: value < 98 ? "DANGER" : value < 100 ? "WARNING" : value < 102 ? "WATCH" : "SAFE",
      signal: value < 98 ? "Significant decline in output" : value < 100 ? "Below baseline — contracting" : value < 102 ? "Stagnant output" : "Production expanding",
    }),
  },
  {
    slug: "jolts-quits-rate",
    name: "JOLTS Quits Rate",
    fred_series: "JTSQUR",
    category: "primary" as const,
    trigger_description: "<2.0% = workers afraid to quit",
    evaluate: (value: number) => ({
      status: value < 1.8 ? "danger" : value < 2.0 ? "warning" : value < 2.3 ? "watch" : "safe",
      signal_emoji: value < 1.8 ? "DANGER" : value < 2.0 ? "WARNING" : value < 2.3 ? "WATCH" : "SAFE",
      signal: value < 1.8 ? "Workers frozen — recession fear" : value < 2.0 ? "Below pre-pandemic norm" : value < 2.3 ? "Moderating — monitor" : "Healthy labor confidence",
    }),
  },
  {
    slug: "nfci",
    name: "Chicago Fed NFCI",
    fred_series: "NFCI",
    category: "market" as const,
    trigger_description: ">0 = tighter-than-average financial conditions",
    evaluate: (value: number) => ({
      status: value > 0.5 ? "danger" : value > 0 ? "warning" : value > -0.5 ? "watch" : "safe",
      signal_emoji: value > 0.5 ? "DANGER" : value > 0 ? "WARNING" : value > -0.5 ? "WATCH" : "SAFE",
      signal: value > 0.5 ? "Tight conditions — stress rising" : value > 0 ? "Above average — tightening" : value > -0.5 ? "Near normal" : "Loose financial conditions",
    }),
  },
  {
    slug: "temp-help-services",
    name: "Temporary Help Services",
    fred_series: "TEMPHELPS",
    category: "primary" as const,
    trigger_description: "Declining temp jobs = earliest labor signal",
    evaluate: (value: number) => {
      const k = value / 1000;
      return {
        status: k < 2.6 ? "danger" : k < 2.8 ? "warning" : k < 3.0 ? "watch" : "safe",
        signal_emoji: k < 2.6 ? "DANGER" : k < 2.8 ? "WARNING" : k < 3.0 ? "WATCH" : "SAFE",
        signal: k < 2.6 ? "Sharp decline — recession leading signal" : k < 2.8 ? "Declining — employers cutting flex labor" : k < 3.0 ? "Below trend — watch" : `${k.toFixed(0)}K — stable`,
      };
    },
  },
  // --- Tier 2: Business & Consumer ---
  {
    slug: "corporate-profits",
    name: "Corporate Profits (After Tax)",
    fred_series: "CP",
    category: "business_activity" as const,
    trigger_description: "Declining profits preceded 81% of recessions",
    evaluate: (value: number) => {
      const b = value / 1000;
      return {
        status: b < 2.5 ? "danger" : b < 2.8 ? "warning" : b < 3.0 ? "watch" : "safe",
        signal_emoji: b < 2.5 ? "DANGER" : b < 2.8 ? "WARNING" : b < 3.0 ? "WATCH" : "SAFE",
        signal: b < 2.5 ? "Profits contracting — recession risk" : b < 2.8 ? "Profits declining" : b < 3.0 ? "Moderate — monitor trend" : `$${b.toFixed(1)}T — healthy`,
      };
    },
  },
  {
    slug: "personal-savings-rate",
    name: "Personal Savings Rate",
    fred_series: "PSAVERT",
    category: "credit_stress" as const,
    trigger_description: "<4% = consumers have no buffer",
    evaluate: (value: number) => ({
      status: value < 3.0 ? "danger" : value < 4.0 ? "warning" : value < 6.0 ? "watch" : "safe",
      signal_emoji: value < 3.0 ? "DANGER" : value < 4.0 ? "WARNING" : value < 6.0 ? "WATCH" : "SAFE",
      signal: value < 3.0 ? "Critically low — consumers tapped out" : value < 4.0 ? `${value.toFixed(1)}% — very low cushion` : value < 6.0 ? `${value.toFixed(1)}% — below average` : "Healthy savings buffer",
    }),
  },
  {
    slug: "credit-card-delinquency",
    name: "Credit Card Delinquency Rate",
    fred_series: "DRCCLACBS",
    category: "credit_stress" as const,
    trigger_description: ">4% = GFC-level consumer stress",
    evaluate: (value: number) => ({
      status: value > 4.5 ? "danger" : value > 3.5 ? "warning" : value > 2.5 ? "watch" : "safe",
      signal_emoji: value > 4.5 ? "DANGER" : value > 3.5 ? "WARNING" : value > 2.5 ? "WATCH" : "SAFE",
      signal: value > 4.5 ? "Crisis-level delinquencies" : value > 3.5 ? `${value.toFixed(1)}% — GFC territory` : value > 2.5 ? "Elevated — rising stress" : "Normal range",
    }),
  },
  // --- Tier 3 ---
  {
    slug: "housing-starts",
    name: "Housing Starts",
    fred_series: "HOUST",
    category: "housing" as const,
    trigger_description: "Declining starts lead cycle by 3-5 quarters",
    evaluate: (value: number) => {
      const k = value / 1000;
      return {
        status: k < 1.1 ? "danger" : k < 1.3 ? "warning" : k < 1.5 ? "watch" : "safe",
        signal_emoji: k < 1.1 ? "DANGER" : k < 1.3 ? "WARNING" : k < 1.5 ? "WATCH" : "SAFE",
        signal: k < 1.1 ? "Housing starts collapsing" : k < 1.3 ? "Below trend — weakness" : k < 1.5 ? "Moderate — slowing" : `${k.toFixed(0)}K — healthy`,
      };
    },
  },
  {
    slug: "freight-index",
    name: "Freight Transportation Index",
    fred_series: "TSIFRGHTC",
    category: "realtime" as const,
    trigger_description: "Declining = slowing real economic activity",
    evaluate: (value: number) => ({
      status: value < 110 ? "danger" : value < 115 ? "warning" : value < 120 ? "watch" : "safe",
      signal_emoji: value < 110 ? "DANGER" : value < 115 ? "WARNING" : value < 120 ? "WATCH" : "SAFE",
      signal: value < 110 ? "Freight in decline — goods economy weakening" : value < 115 ? "Below trend" : value < 120 ? "Moderate — monitor" : "Freight activity healthy",
    }),
  },
  {
    slug: "inventory-sales-ratio",
    name: "Inventory-to-Sales Ratio",
    fred_series: "ISRATIO",
    category: "business_activity" as const,
    trigger_description: "Rising ratio = goods piling up unsold",
    evaluate: (value: number) => ({
      status: value > 1.5 ? "danger" : value > 1.4 ? "warning" : value > 1.35 ? "watch" : "safe",
      signal_emoji: value > 1.5 ? "DANGER" : value > 1.4 ? "WARNING" : value > 1.35 ? "WATCH" : "SAFE",
      signal: value > 1.5 ? "Inventory glut — production cuts coming" : value > 1.4 ? "Building up — demand weakening" : value > 1.35 ? "Slightly elevated" : `${value.toFixed(2)} — well-managed`,
    }),
  },
  {
    slug: "debt-service-ratio",
    name: "Household Debt Service Ratio",
    fred_series: "TDSP",
    category: "credit_stress" as const,
    trigger_description: ">13% = debt payments crowding out spending",
    evaluate: (value: number) => ({
      status: value > 14 ? "danger" : value > 13 ? "warning" : value > 11 ? "watch" : "safe",
      signal_emoji: value > 14 ? "DANGER" : value > 13 ? "WARNING" : value > 11 ? "WATCH" : "SAFE",
      signal: value > 14 ? "Crushing debt burden" : value > 13 ? `${value.toFixed(1)}% — straining consumers` : value > 11 ? "Moderate — rising" : "Manageable debt levels",
    }),
  },
  // --- Tier 1: NY Fed Recession Probability ---
  {
    slug: "ny-fed-recession-prob",
    name: "NY Fed Recession Probability",
    fred_series: "T10Y3M",
    category: "market" as const,
    trigger_description: ">50% = recession likely within 12 months",
    evaluate: (value: number) => {
      const prob = value < 0 ? Math.min(90, 50 + Math.abs(value) * 20) : Math.max(5, 30 - value * 10);
      return {
        status: prob > 50 ? "danger" : prob > 30 ? "warning" : prob > 20 ? "watch" : "safe",
        signal_emoji: prob > 50 ? "DANGER" : prob > 30 ? "WARNING" : prob > 20 ? "WATCH" : "SAFE",
        signal: prob > 50 ? `~${prob.toFixed(0)}% — recession likely` : prob > 30 ? `~${prob.toFixed(0)}% — elevated risk` : `~${prob.toFixed(0)}% — moderate`,
      };
    },
  },
  // --- Tier 2: VIX ---
  {
    slug: "vix",
    name: "VIX Volatility Index",
    fred_series: "VIXCLS",
    category: "market" as const,
    trigger_description: ">30 = extreme fear, >20 = elevated uncertainty",
    evaluate: (value: number) => ({
      status: value > 35 ? "danger" : value > 25 ? "warning" : value > 20 ? "watch" : "safe",
      signal_emoji: value > 35 ? "DANGER" : value > 25 ? "WARNING" : value > 20 ? "WATCH" : "SAFE",
      signal: value > 35 ? "Extreme fear — crisis levels" : value > 25 ? "Elevated volatility — stress building" : value > 20 ? "Above average uncertainty" : `${value.toFixed(1)} — complacency zone`,
    }),
  },
  // --- Tier 2: GDPNow ---
  {
    slug: "gdpnow",
    name: "Atlanta Fed GDPNow",
    fred_series: "",
    category: "realtime" as const,
    trigger_description: "<0% = economy may already be contracting",
    evaluate: (value: number) => ({
      status: value < -1 ? "danger" : value < 0 ? "warning" : value < 1.5 ? "watch" : "safe",
      signal_emoji: value < -1 ? "DANGER" : value < 0 ? "WARNING" : value < 1.5 ? "WATCH" : "SAFE",
      signal: value < -1 ? `${value.toFixed(1)}% — deep contraction` : value < 0 ? `${value.toFixed(1)}% — negative growth` : value < 1.5 ? `${value.toFixed(1)}% — below trend` : `${value.toFixed(1)}% — healthy growth`,
    }),
  },
  // --- Tier 2: NFIB ---
  {
    slug: "nfib-optimism",
    name: "NFIB Small Business Optimism",
    fred_series: "",
    category: "business_activity" as const,
    trigger_description: "<93 = recessionary, <98 = below 52-year average",
    evaluate: (value: number) => ({
      status: value < 90 ? "danger" : value < 93 ? "warning" : value < 98 ? "watch" : "safe",
      signal_emoji: value < 90 ? "DANGER" : value < 93 ? "WARNING" : value < 98 ? "WATCH" : "SAFE",
      signal: value < 90 ? "Crisis-level pessimism" : value < 93 ? "Recession-territory optimism" : value < 98 ? "Below 52-year average" : "Small business confident",
    }),
  },
  // --- Tier 2: Copper-Gold Ratio ---
  {
    slug: "copper-gold-ratio",
    name: "Copper-to-Gold Ratio",
    fred_series: "",
    category: "market" as const,
    trigger_description: "Falling ratio = fear outpacing industrial demand",
    evaluate: (value: number) => ({
      status: value < 0.0008 ? "danger" : value < 0.001 ? "warning" : value < 0.0012 ? "watch" : "safe",
      signal_emoji: value < 0.0008 ? "DANGER" : value < 0.001 ? "WARNING" : value < 0.0012 ? "WATCH" : "SAFE",
      signal: value < 0.0008 ? "Below 2008 crisis level — deep fear" : value < 0.001 ? "Below GFC levels — risk aversion" : value < 0.0012 ? "Below average — cautious" : "Healthy industrial demand",
    }),
  },
  // --- Tier 3: SLOOS ---
  {
    slug: "sloos-lending",
    name: "Senior Loan Officer Survey (SLOOS)",
    fred_series: "DRTSCILM",
    category: "credit_stress" as const,
    trigger_description: ">20% net tightening = credit contraction",
    evaluate: (value: number) => ({
      status: value > 40 ? "danger" : value > 20 ? "warning" : value > 0 ? "watch" : "safe",
      signal_emoji: value > 40 ? "DANGER" : value > 20 ? "WARNING" : value > 0 ? "WATCH" : "SAFE",
      signal: value > 40 ? "Severe credit tightening" : value > 20 ? `${value.toFixed(0)}% net tightening — stress` : value > 0 ? "Mild tightening — monitor" : "Lending standards easing",
    }),
  },
  // --- Tier 3: SOS Indicator ---
  {
    slug: "sos-recession",
    name: "SOS Recession Indicator",
    fred_series: "IURSA",
    category: "primary" as const,
    trigger_description: "26-wk avg rises 0.2+ ppts above 52-wk low",
    evaluate: (value: number) => ({
      status: value > 2.0 ? "danger" : value > 1.5 ? "warning" : value > 1.2 ? "watch" : "safe",
      signal_emoji: value > 2.0 ? "DANGER" : value > 1.5 ? "WARNING" : value > 1.2 ? "WATCH" : "SAFE",
      signal: value > 2.0 ? "Insured unemployment surging — recession signal" : value > 1.5 ? "Rising claims — elevated stress" : value > 1.2 ? "Ticking up — monitor" : "Low insured unemployment",
    }),
  },
] as const;

export const TOTAL_INDICATORS = INDICATOR_DEFINITIONS.length;

export const STOCK_SCREENER_CONFIG = {
  // Value dividend criteria
  value_dividend: {
    max_pe: 12,
    min_dividend_yield: 2.5,
    min_market_cap: 10_000_000_000, // $10B
    min_avg_volume: 1_000_000,
  },
  // Oversold growth criteria
  oversold_growth: {
    max_pe: 15,
    max_rsi: 30,
    min_market_cap: 5_000_000_000, // $5B
    min_avg_volume: 500_000,
  },
  // Universe of tickers to screen
  watchlist: [
    // Large cap value/dividend
    "VZ", "BMY", "T", "PFE", "MO", "INTC", "CVX", "PM", "GILD", "KHC",
    "WBA", "PARA", "LUMN", "MPW", "OKE", "EPD", "ET",
    // Mega cap tech
    "MSFT", "AAPL", "GOOGL", "AMZN", "META", "NVDA", "TSM", "NFLX",
    // Growth tech
    "NOW", "UBER", "CRM", "ADBE", "PYPL", "SQ", "SHOP", "SNOW",
    "NET", "DDOG", "CRWD", "ZS", "PANW",
    // Defensive/utilities
    "DUK", "NEE", "SO", "D", "AEP", "XEL", "WEC",
    // Consumer staples
    "PG", "KO", "PEP", "MDLZ", "CLX", "GIS", "SJM", "CPB",
    // Financials
    "JPM", "BAC", "WFC", "GS", "MS", "BLK",
    // Gold/miners
    "GLD", "GDX", "NEM", "GOLD", "AEM",
    // Crypto-related
    "MSTR", "COIN", "MARA", "RIOT",
    // Healthcare
    "JNJ", "ABBV", "MRK", "LLY", "UNH",
    // REITs
    "O", "VICI", "SPG", "AMT",
    // ETFs
    "SPY", "QQQ", "IWM", "EEM", "TLT", "HYG",
  ],
};
