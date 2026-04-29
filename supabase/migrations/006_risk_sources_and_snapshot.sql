-- Enrich recession_risk_assessments with web-search sources and per-category snapshot
-- (used by the daily blog generator + 30-day score trend plot)

ALTER TABLE public.recession_risk_assessments
  ADD COLUMN IF NOT EXISTS sources JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS category_snapshot JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.recession_risk_assessments.sources IS
  'Deduped list of web_search URLs consulted by the risk assessment agent. JSON array of strings.';

COMMENT ON COLUMN public.recession_risk_assessments.category_snapshot IS
  'Per-category counts of indicator statuses at assessment time: { primary: { safe: N, watch: N, danger: N }, ... }';
