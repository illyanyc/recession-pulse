-- Dashboard display preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dashboard_view_mode TEXT NOT NULL DEFAULT 'grid'
    CHECK (dashboard_view_mode IN ('grid', 'list')),
  ADD COLUMN IF NOT EXISTS card_display_mode TEXT NOT NULL DEFAULT 'card'
    CHECK (card_display_mode IN ('card', 'chart'));
