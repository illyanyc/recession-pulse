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
      signal_emoji: value >= 0.5 ? "🔴" : value >= 0.3 ? "🟡" : "🟢",
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
      signal_emoji: value < 0 ? "🔴" : value < 0.5 ? "🟡" : "🟢",
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
      signal_emoji: value < 45 ? "🔴" : value < 50 ? "⚠️" : value < 52 ? "🟡" : "🟢",
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
      signal_emoji: value > 350000 ? "🔴" : value > 300000 ? "⚠️" : value > 250000 ? "🟡" : "🟢",
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
      signal_emoji: value < 55 ? "🔴" : value < 65 ? "⚠️" : value < 75 ? "🟡" : "🟢",
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
      signal_emoji: value > 5 ? "⚠️" : value > 4 ? "🟡" : "🟢",
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
      signal_emoji: "🟡",
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
      signal_emoji: value > 5 ? "🔴" : value > 4.5 ? "⚠️" : value > 4 ? "🟡" : "🟢",
      signal: value > 5 ? "Recession-level unemployment" : value > 4.5 ? "Rising significantly" : value > 4 ? "Ticking up" : "Strong labor market",
    }),
  },
] as const;

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
