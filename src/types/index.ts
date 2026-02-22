export type IndicatorStatus = "safe" | "watch" | "warning" | "danger";

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
  category: "primary" | "secondary" | "liquidity" | "market";
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
  plan: "pulse" | "pulse_pro";
  status: "active" | "canceled" | "past_due" | "trialing";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export const PLANS = {
  pulse: {
    name: "Pulse",
    price: 9.99,
    description: "Daily recession indicator alerts via SMS",
    features: [
      "9 key recession indicators tracked daily",
      "Morning SMS briefing with signal status",
      "Real-time dashboard access",
      "Yield curve & Sahm Rule monitoring",
      "Conference Board LEI tracking",
      "Liquidity & dollar index alerts",
    ],
  },
  pulse_pro: {
    name: "Pulse Pro",
    price: 14.99,
    description: "Everything in Pulse + daily stock screener alerts",
    features: [
      "Everything in Pulse plan",
      "Daily stock screener alerts",
      "Stocks below 200 EMA + RSI <30 + P/E <15",
      "Value dividend picks (P/E <12, near 200 EMA)",
      "Market cap & volume filtered",
      "Sector rotation signals",
      "Portfolio defense positioning",
    ],
  },
} as const;
