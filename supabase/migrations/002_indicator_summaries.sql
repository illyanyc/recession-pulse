-- AI-generated indicator summaries (produced by daily cron)
CREATE TABLE public.indicator_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL,
  summary TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reading_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE UNIQUE INDEX idx_indicator_summaries_unique ON public.indicator_summaries(slug, reading_date);
CREATE INDEX idx_indicator_summaries_date ON public.indicator_summaries(reading_date DESC);

ALTER TABLE public.indicator_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view summaries"
  ON public.indicator_summaries FOR SELECT
  TO authenticated
  USING (true);
