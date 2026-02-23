-- Expand indicator_readings category constraint to support all indicator groups
ALTER TABLE public.indicator_readings DROP CONSTRAINT IF EXISTS indicator_readings_category_check;
ALTER TABLE public.indicator_readings
  ADD CONSTRAINT indicator_readings_category_check
  CHECK (category IN ('primary', 'secondary', 'liquidity', 'market', 'housing', 'business_activity', 'credit_stress', 'realtime'));
