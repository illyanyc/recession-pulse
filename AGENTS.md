# AGENTS.md — RecessionPulse Workspace Memory

## Git Workflow
- User always says "push to main" — direct fast-forward merge from feature branches, no PRs
- Commit and push when asked; don't ask for confirmation

## Tech Stack
- Next.js 15 (App Router) + TypeScript, hosted on Vercel
- Supabase (Postgres + Auth + RLS)
- Resend for transactional email
- Twilio for SMS (pending A2P 10DLC verification — messages may be blocked until approved)
- Typefully API for X/Twitter posting (@wallstphd)
- OpenAI API: `gpt-5.2` with Responses API + `web_search` for blog posts and risk assessments; `gpt-4o-mini` for lightweight tasks (tweets, excerpts)
- `INDICATOR_COUNT` exported from `src/lib/indicators-metadata.ts` (derived from `ALL_INDICATOR_SLUGS.length`) is the single source of truth for the public indicator count — never hardcode numbers in marketing copy, JSON-LD, or metadata

## Data Pipeline
- `indicator_readings` table in Supabase is the **single source of truth** for all indicator history
- FRED API is the primary data source (~42 indicators); Serper research agent is fallback for non-FRED indicators
- Data inconsistency between FRED and Serper fallback values causes percentage-change artifacts — a `MAX_REASONABLE_PCT_CHANGE = 200` guard in `pctChange()` suppresses outliers
- AI analysis must always use **90 days of history** including today's data
- Always audit data consistency between plots, preview cards, modals, and email values
- `recession_risk_assessments` stores `sources` JSONB (web_search URLs) and `category_snapshot` JSONB (per-category breakdown) populated by the analyze-risk cron (migration 006) — used by blog generator + 30-day score trend plot
- Daily briefing email embeds today's `daily_risk_assessment` blog post (title + excerpt + 30d score trend PNG) above the indicator table, fetched from `blog_posts` at send time

## Cron Jobs (Vercel)
- Auth: shared `verifyCronAuth()` in `src/lib/cron-auth.ts` — checks both `Authorization: Bearer` header (Vercel sends automatically) and `?secret=` query param (for manual/internal calls)
- **Vercel does NOT interpolate environment variables in cron paths** — never put `${ENV_VAR}` in `vercel.json` cron paths
- Daily schedule (UTC / ET):
  - 11:00 / 6:00 AM — fetch-indicators
  - 11:05 / 6:05 AM — screen-stocks
  - 11:30 / 6:30 AM — analyze-risk + generate daily blog post
  - 12:15 / 7:15 AM — send-alerts (email + SMS)
- Social posting crons throughout the day via Typefully API
- One-off campaigns live under `/api/admin/*` (e.g. `announce-feature`, `product-updates-campaign`) — always preview first with `?secret=$CRON_SECRET`, then fire with `&channel=tweet|email|both`

## Subscription Tiers
- **Free**: dashboard + 42 indicators + daily email briefing
- **Pulse** ($6.99): + SMS alerts + AI recession risk assessment (RecessionRiskBanner)
- **Pulse Pro** ($9.99): + stock screener + stock picks in email
- RecessionRiskBanner shows locked/blurred preview for free users with upgrade CTA

## Email Templates
- Use **table-based layout** (not CSS `flex`/`gap`) for email client compatibility (Gmail, Outlook strip flex)
- Templates live in `src/lib/email-templates.ts` and are also pushed to Supabase Auth via Management API
- Supabase auth email templates: `getSupabaseEmailTemplates()` — branded dark theme with orange CTA
- Hardcode `https://recessionpulse.com` for logos, images, and CTA links — never use `NEXT_PUBLIC_APP_URL` / `APP_URL` (they resolve to `http://localhost:3000` from `.env.local` and break images/links in real inboxes)
- Resend bakes HTML at `scheduledAt` — post-schedule template edits don't propagate; must cancel and reschedule if the template changes (track batch IDs in Supabase/Redis)

## SMS Formatting
- Blank lines between every section (header, CHANGES, ALERTS, WATCHING, score bar, dashboard link)
- Score bar format: `17 safe / 8 watch / 3 alert` (with spaces)

## User Preferences
- **No newsletter features** — only daily emails for subscribers; remove any newsletter signup UI
- When user reports screenshot issues, the screenshot may be from the email template (not the web dashboard)
- SEO: JSON-LD schemas — only Organization + WebSite in root layout; FAQ + SoftwareApplication on homepage only
- Locked indicator pages must have crawlable `<Link>` elements (not plain `<div>`) for SEO
- Spinning loaders must be circular — use lucide's `Loader2`/`Clock` or the CSS border spinner (`rounded-full border-2 border-t-pulse-green animate-spin`); never apply `animate-spin` to non-round icons like `Activity`
