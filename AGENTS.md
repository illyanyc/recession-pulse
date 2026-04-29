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

## Data Pipeline
- `indicator_readings` table in Supabase is the **single source of truth** for all indicator history
- FRED API is the primary data source (~42 indicators); Serper research agent is fallback for non-FRED indicators
- Data inconsistency between FRED and Serper fallback values causes percentage-change artifacts — a `MAX_REASONABLE_PCT_CHANGE = 200` guard in `pctChange()` suppresses outliers
- AI analysis must always use **90 days of history** including today's data
- Always audit data consistency between plots, preview cards, modals, and email values

## Cron Jobs (Vercel)
- Auth: shared `verifyCronAuth()` in `src/lib/cron-auth.ts` — checks both `Authorization: Bearer` header (Vercel sends automatically) and `?secret=` query param (for manual/internal calls)
- **Vercel does NOT interpolate environment variables in cron paths** — never put `${ENV_VAR}` in `vercel.json` cron paths
- Daily schedule (UTC / ET):
  - 11:00 / 6:00 AM — fetch-indicators
  - 11:05 / 6:05 AM — screen-stocks
  - 11:30 / 6:30 AM — analyze-risk + generate daily blog post
  - 12:15 / 7:15 AM — send-alerts (email + SMS)
- Social posting crons throughout the day via Typefully API

## Subscription Tiers
- **Free**: dashboard + 42 indicators + daily email briefing
- **Pulse** ($6.99): + SMS alerts + AI recession risk assessment (RecessionRiskBanner)
- **Pulse Pro** ($9.99): + stock screener + stock picks in email
- RecessionRiskBanner shows locked/blurred preview for free users with upgrade CTA

## Email Templates
- Use **table-based layout** (not CSS `flex`/`gap`) for email client compatibility (Gmail, Outlook strip flex)
- Templates live in `src/lib/email-templates.ts` and are also pushed to Supabase Auth via Management API
- Supabase auth email templates: `getSupabaseEmailTemplates()` — branded dark theme with orange CTA

## SMS Formatting
- Blank lines between every section (header, CHANGES, ALERTS, WATCHING, score bar, dashboard link)
- Score bar format: `17 safe / 8 watch / 3 alert` (with spaces)

## User Preferences
- **No newsletter features** — only daily emails for subscribers; remove any newsletter signup UI
- When user reports screenshot issues, the screenshot may be from the email template (not the web dashboard)
- SEO: JSON-LD schemas — only Organization + WebSite in root layout; FAQ + SoftwareApplication on homepage only
- Locked indicator pages must have crawlable `<Link>` elements (not plain `<div>`) for SEO
