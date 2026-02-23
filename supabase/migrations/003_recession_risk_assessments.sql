-- Recession risk assessments: daily AI-generated overall risk score + analysis
CREATE TABLE public.recession_risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'elevated', 'high', 'critical')),
  summary TEXT NOT NULL,
  key_factors TEXT[] NOT NULL DEFAULT '{}',
  outlook TEXT,
  indicators_snapshot JSONB NOT NULL DEFAULT '[]',
  model TEXT NOT NULL DEFAULT 'gpt-4o',
  assessment_date DATE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_assessments_date ON public.recession_risk_assessments(assessment_date DESC);

ALTER TABLE public.recession_risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read risk assessments"
  ON public.recession_risk_assessments FOR SELECT USING (true);

-- Add 'daily_risk_assessment' to blog_posts content_type constraint
ALTER TABLE public.blog_posts DROP CONSTRAINT IF EXISTS blog_posts_content_type_check;
ALTER TABLE public.blog_posts
  ADD CONSTRAINT blog_posts_content_type_check
  CHECK (content_type IN ('weekly_report', 'deep_dive', 'market_commentary', 'daily_risk_assessment'));
