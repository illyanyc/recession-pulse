export type IndicatorStatus = "safe" | "watch" | "warning" | "danger";

export type IndicatorCategory =
  | "primary"
  | "secondary"
  | "liquidity"
  | "market"
  | "housing"
  | "credit_stress"
  | "business_activity"
  | "realtime";

export const CATEGORY_LABELS: Record<IndicatorCategory, string> = {
  primary: "Primary Indicators",
  secondary: "Secondary Indicators",
  liquidity: "Liquidity",
  market: "Market Signals",
  housing: "Housing & Construction",
  credit_stress: "Consumer Credit Stress",
  business_activity: "Business Activity",
  realtime: "Real-Time / High-Frequency",
};

export const CATEGORY_ORDER: IndicatorCategory[] = [
  "primary",
  "secondary",
  "housing",
  "business_activity",
  "credit_stress",
  "market",
  "liquidity",
  "realtime",
];

export interface RecessionIndicator {
  id: string;
  name: string;
  slug: string;
  latest_value: string;
  numeric_value?: number;
  trigger_level: string;
  status: IndicatorStatus;
  status_text: string;
  signal: string;
  signal_emoji: string;
  source_url?: string;
  category: IndicatorCategory;
  reading_date?: string;
  updated_at: string;
}

export type TrendDirection = "up" | "down" | "flat";

export interface IndicatorTrend {
  slug: string;
  direction_1d: TrendDirection;
  direction_7d: TrendDirection;
  value_change_1d: number | null;
  value_change_7d: number | null;
  pct_change_1d: number | null;
  pct_change_7d: number | null;
  status_changed_1d: boolean;
  status_changed_7d: boolean;
  prev_status_1d: IndicatorStatus | null;
  prev_status_7d: IndicatorStatus | null;
}

export interface IndicatorWithTrend extends RecessionIndicator {
  trend: IndicatorTrend;
}

export interface StockSignal {
  id: string;
  ticker: string;
  company_name: string;
  price: number;
  ema_200: number;
  rsi_14: number;
  forward_pe: number;
  market_cap: number;
  avg_volume: number;
  dividend_yield?: number;
  sector: string;
  signal_type: "value_dividend" | "oversold_growth" | "defensive";
  passes_filter: boolean;
  notes: string;
  screened_at: string;
}

export type ViewMode = "grid" | "list";
export type CardDisplayMode = "card" | "chart";

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  full_name?: string;
  subscription_tier: "free" | "pulse" | "pulse_pro";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  sms_enabled: boolean;
  email_alerts_enabled: boolean;
  preferred_alert_time: string;
  timezone: string;
  dashboard_view_mode: ViewMode;
  card_display_mode: CardDisplayMode;
  created_at: string;
  updated_at: string;
}

export interface MessageQueueItem {
  id: string;
  user_id: string;
  message_type: "recession_alert" | "stock_alert" | "welcome" | "confirmation";
  channel: "sms" | "email";
  recipient: string;
  content: string;
  status: "pending" | "processing" | "sent" | "failed";
  attempts: number;
  max_attempts: number;
  scheduled_for: string;
  sent_at?: string;
  error?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan: "free" | "pulse" | "pulse_pro";
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface RecessionRiskAssessment {
  id: string;
  score: number;
  risk_level: "low" | "moderate" | "elevated" | "high" | "critical";
  summary: string;
  key_factors: string[];
  outlook: string | null;
  model: string;
  assessment_date: string;
  created_at: string;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    description: "Real-time recession dashboard — no credit card required",
    features: [
      "42 recession & macro indicators tracked",
      "Real-time dashboard access",
      "Indicator status, signals & trends",
      "Historical context for every reading",
      "Weekly recession risk score",
    ],
  },
  pulse: {
    name: "Pulse",
    price: 6.99,
    description: "Email & SMS recession alerts delivered daily",
    features: [
      "Everything in Free",
      "Daily email recession briefing",
      "Morning SMS with signal status",
      "Threshold breach notifications",
      "Customizable alert preferences",
      "Priority alert delivery",
    ],
  },
  pulse_pro: {
    name: "Pulse Pro",
    price: 9.99,
    description: "Full quant toolkit — indicators + stock screener",
    features: [
      "Everything in Pulse",
      "Daily stock screener alerts",
      "Stocks below 200 EMA + RSI <30 + P/E <15",
      "Value dividend picks (P/E <12, near 200 EMA)",
      "Sector rotation signals",
      "AI recession risk assessment",
      "Portfolio defense positioning",
    ],
  },
} as const;
