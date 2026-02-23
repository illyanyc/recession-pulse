-- Fix category CHECK constraint to allow all indicator categories
ALTER TABLE public.indicator_readings
  DROP CONSTRAINT IF EXISTS indicator_readings_category_check;

ALTER TABLE public.indicator_readings
  ADD CONSTRAINT indicator_readings_category_check
  CHECK (category IN (
    'primary', 'secondary', 'liquidity', 'market',
    'housing', 'credit_stress', 'business_activity', 'realtime'
  ));

-- Ensure unique constraint exists (prevents duplicate rows per slug per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_indicator_readings_unique
  ON public.indicator_readings(slug, reading_date);

-- Remove any existing duplicate rows (keep the latest per slug+date)
DELETE FROM public.indicator_readings a
  USING public.indicator_readings b
  WHERE a.slug = b.slug
    AND a.reading_date = b.reading_date
    AND a.created_at < b.created_at;
