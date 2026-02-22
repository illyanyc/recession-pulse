-- RecessionPulse Database Schema
-- Run this in your Supabase SQL editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  full_name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pulse', 'pulse_pro')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT true,
  email_alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  preferred_alert_time TEXT NOT NULL DEFAULT '08:00',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_price_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pulse', 'pulse_pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================
-- INDICATOR READINGS (daily snapshots)
-- ============================================
CREATE TABLE public.indicator_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  latest_value TEXT NOT NULL,
  numeric_value DOUBLE PRECISION,
  trigger_level TEXT,
  status TEXT NOT NULL CHECK (status IN ('safe', 'watch', 'warning', 'danger')),
  status_text TEXT,
  signal TEXT NOT NULL,
  signal_emoji TEXT NOT NULL,
  source_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('primary', 'secondary', 'liquidity', 'market')),
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_indicator_readings_date ON public.indicator_readings(reading_date DESC);
CREATE INDEX idx_indicator_readings_slug ON public.indicator_readings(slug);
CREATE UNIQUE INDEX idx_indicator_readings_unique ON public.indicator_readings(slug, reading_date);

-- ============================================
-- STOCK SIGNALS (daily screener results)
-- ============================================
CREATE TABLE public.stock_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  ema_200 DOUBLE PRECISION NOT NULL,
  rsi_14 DOUBLE PRECISION NOT NULL,
  forward_pe DOUBLE PRECISION,
  market_cap BIGINT,
  avg_volume BIGINT,
  dividend_yield DOUBLE PRECISION,
  sector TEXT,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('value_dividend', 'oversold_growth', 'defensive')),
  passes_filter BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  screened_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_signals_date ON public.stock_signals(screened_at DESC);
CREATE INDEX idx_stock_signals_type ON public.stock_signals(signal_type);

-- ============================================
-- MESSAGE QUEUE
-- ============================================
CREATE TABLE public.message_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('recession_alert', 'stock_alert', 'welcome', 'confirmation')),
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  recipient TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_queue_status ON public.message_queue(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_message_queue_scheduled ON public.message_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_message_queue_user ON public.message_queue(user_id);

-- ============================================
-- MESSAGE LOG (sent history)
-- ============================================
CREATE TABLE public.message_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  content TEXT NOT NULL,
  external_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_log_user ON public.message_log(user_id, sent_at DESC);

-- ============================================
-- SMS CONSENT (TCPA compliance)
-- ============================================
CREATE TABLE public.sms_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  phone_number TEXT NOT NULL,
  verification_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'revoked')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  proof_record JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sms_consents_user ON public.sms_consents(user_id);
CREATE INDEX idx_sms_consents_status ON public.sms_consents(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles: users can read/update their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Subscriptions: users can view their own
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Indicator readings: public read access
ALTER TABLE public.indicator_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view indicators"
  ON public.indicator_readings FOR SELECT
  TO authenticated
  USING (true);

-- Stock signals: authenticated read access
ALTER TABLE public.stock_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view stock signals"
  ON public.stock_signals FOR SELECT
  TO authenticated
  USING (true);

-- Message queue: users can view their own
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.message_queue FOR SELECT
  USING (auth.uid() = user_id);

-- SMS consents: users can view their own
ALTER TABLE public.sms_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sms consent"
  ON public.sms_consents FOR SELECT
  USING (auth.uid() = user_id);

-- Message log: users can view their own
ALTER TABLE public.message_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own message log"
  ON public.message_log FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Latest indicators (most recent reading per slug)
CREATE OR REPLACE VIEW public.latest_indicators AS
SELECT DISTINCT ON (slug) *
FROM public.indicator_readings
ORDER BY slug, reading_date DESC;

-- Latest stock signals (today's screener results)
CREATE OR REPLACE VIEW public.latest_stock_signals AS
SELECT *
FROM public.stock_signals
WHERE screened_at = CURRENT_DATE
ORDER BY signal_type, forward_pe ASC;

-- Active subscribers needing alerts
CREATE OR REPLACE VIEW public.active_alert_subscribers AS
SELECT
  p.id,
  p.email,
  p.phone,
  p.subscription_tier,
  p.sms_enabled,
  p.email_alerts_enabled,
  p.preferred_alert_time,
  p.timezone,
  s.plan,
  s.status as sub_status
FROM public.profiles p
INNER JOIN public.subscriptions s ON s.user_id = p.id
WHERE s.status = 'active'
  AND (p.sms_enabled = true OR p.email_alerts_enabled = true);
