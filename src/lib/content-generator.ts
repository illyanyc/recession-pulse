import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

/**
 * Voice profile for @wallstphd (Illya Nayshevsky, Ph.D.)
 * All social media content is written in first-person from this persona.
 */
const PERSONA = `You are ghostwriting tweets for Illya Nayshevsky, Ph.D. (@wallstphd on X).
Illya is a data scientist, quant trader, and entrepreneur. He has a Ph.D. from CUNY, runs Alpha Inertia Capital (a quantitative trading firm), and built RecessionPulse (recessionpulse.com) — a tool that tracks 9+ recession indicators and sends daily SMS/email alerts to investors.

Voice guidelines:
- First person ("I", "my"). He's a builder sharing what he built and what the data shows.
- Sharp, direct, data-driven. No fluff, no corporate speak.
- Confident but not arrogant. Backs claims with numbers and historical data.
- Slightly contrarian — challenges mainstream narratives with evidence.
- Academic rigor meets trader pragmatism. Think "quant who explains things clearly."
- Never uses hashtags. Never sounds like a brand account or marketing bot.
- Casual but smart — like a sharp friend who happens to have a PhD and runs a trading firm.
- References building RecessionPulse naturally ("I built a tool...", "my recession tracker shows...", "I track this daily...").
- NEVER says "Follow @RecessionPulse" — instead says things like "I post these daily" or links to recessionpulse.com.`;

interface IndicatorSnapshot {
  name: string;
  slug: string;
  latest_value: string;
  status: string;
  signal: string;
  signal_emoji: string;
}

interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  keywords: string[];
}

interface RiskAssessmentResult {
  score: number;
  risk_level: "low" | "moderate" | "elevated" | "high" | "critical";
  summary: string;
  key_factors: string[];
  outlook: string;
  blog_article: GeneratedArticle;
}

interface HistoricalReading {
  slug: string;
  name: string;
  latest_value: string;
  numeric_value?: number;
  status: string;
  signal: string;
  reading_date: string;
}

interface ScoreHistoryRow {
  assessment_date: string;
  score: number;
  risk_level?: string;
}

interface StockSignalCtx {
  ticker: string;
  company_name: string;
  signal_type: string;
  forward_pe?: number;
  dividend_yield?: number;
  rsi_14?: number;
  market_cap?: number;
}

type CategoryCountsCtx = Record<string, { safe: number; watch: number; danger: number }>;

export interface BlogContext {
  scoreHistory?: ScoreHistoryRow[];
  stockSignals?: StockSignalCtx[];
  sources?: string[];
  categorySnapshot?: CategoryCountsCtx;
  assessmentDate?: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  primary: "Primary Indicators",
  secondary: "Secondary Indicators",
  liquidity: "Liquidity",
  market: "Market Signals",
  housing: "Housing & Construction",
  credit_stress: "Consumer Credit Stress",
  business_activity: "Business Activity",
  realtime: "Real-Time / High-Frequency",
};

function buildScoreTrajectoryBlock(history: ScoreHistoryRow[]): string {
  if (!history.length) return "No prior score history available.";
  const sorted = [...history].sort((a, b) => a.assessment_date.localeCompare(b.assessment_date));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const delta30d = last.score - first.score;
  const scores = sorted.map((s) => s.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const recent = sorted.slice(-10);
  const recentTrail = recent.map((s) => `  ${s.assessment_date}: ${s.score}`).join("\n");
  return `Window: ${first.assessment_date} → ${last.assessment_date}
Start: ${first.score} | End: ${last.score} | Δ: ${delta30d >= 0 ? "+" : ""}${delta30d}
Min: ${min} | Max: ${max} | Avg: ${avg} | Samples: ${sorted.length}
Last 10 readings:
${recentTrail}`;
}

function buildCategoryBreakdownBlock(snapshot: CategoryCountsCtx | undefined): string {
  if (!snapshot) return "No category breakdown available.";
  const rows: string[] = [];
  for (const [cat, counts] of Object.entries(snapshot)) {
    const total = counts.safe + counts.watch + counts.danger;
    if (total === 0) continue;
    const label = CATEGORY_NAMES[cat] || cat;
    rows.push(`- ${label}: ${counts.safe} safe / ${counts.watch} watch / ${counts.danger} danger`);
  }
  return rows.length ? rows.join("\n") : "No category breakdown available.";
}

function buildStockBlockCtx(stocks: StockSignalCtx[] | undefined): string {
  if (!stocks?.length) return "No stock screener signals today.";
  return stocks
    .slice(0, 10)
    .map((s) => {
      const parts = [`$${s.ticker} (${s.company_name}) — ${s.signal_type.replace(/_/g, " ")}`];
      if (s.forward_pe != null) parts.push(`P/E ${s.forward_pe.toFixed(1)}`);
      if (s.rsi_14 != null) parts.push(`RSI ${s.rsi_14.toFixed(0)}`);
      if (s.dividend_yield != null) parts.push(`Yield ${(s.dividend_yield * 100).toFixed(2)}%`);
      return `- ${parts.join(" | ")}`;
    })
    .join("\n");
}

function buildMoversBlock(history: HistoricalReading[], current: IndicatorSnapshot[]): string {
  if (!history.length) return "No recent history available for movers.";
  const bySlug = new Map<string, HistoricalReading[]>();
  for (const h of history) {
    const arr = bySlug.get(h.slug) || [];
    arr.push(h);
    bySlug.set(h.slug, arr);
  }

  const movers: { name: string; slug: string; delta1d: number | null; delta7d: number | null; latest: string }[] = [];
  for (const ind of current) {
    const readings = (bySlug.get(ind.slug) || []).sort((a, b) => a.reading_date.localeCompare(b.reading_date));
    if (readings.length < 2) continue;
    const latest = readings[readings.length - 1];
    const prev1 = readings.length >= 2 ? readings[readings.length - 2] : null;
    const prev7 = readings.find((r) => {
      const latestDate = new Date(latest.reading_date);
      const rDate = new Date(r.reading_date);
      const diffDays = (latestDate.getTime() - rDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 6 && diffDays <= 9;
    }) || readings[0];

    if (latest.numeric_value == null) continue;
    const base1 = prev1?.numeric_value;
    const base7 = prev7?.numeric_value;
    const delta1d = base1 != null && base1 !== 0 ? ((latest.numeric_value - base1) / Math.abs(base1)) * 100 : null;
    const delta7d = base7 != null && base7 !== 0 ? ((latest.numeric_value - base7) / Math.abs(base7)) * 100 : null;
    movers.push({
      name: ind.name,
      slug: ind.slug,
      delta1d,
      delta7d,
      latest: ind.latest_value,
    });
  }

  const top = movers
    .filter((m) => m.delta7d != null)
    .sort((a, b) => Math.abs(b.delta7d!) - Math.abs(a.delta7d!))
    .slice(0, 5);

  if (!top.length) return "No meaningful movers over the past 7 days.";

  return top
    .map((m) => {
      const d1 = m.delta1d != null ? `${m.delta1d >= 0 ? "+" : ""}${m.delta1d.toFixed(1)}% 1D` : "—";
      const d7 = m.delta7d != null ? `${m.delta7d >= 0 ? "+" : ""}${m.delta7d.toFixed(1)}% 7D` : "—";
      return `- ${m.name} (${m.latest}): ${d1} / ${d7}`;
    })
    .join("\n");
}

export async function generateRecessionRiskAssessment(
  indicators: IndicatorSnapshot[],
  history: HistoricalReading[]
): Promise<RiskAssessmentResult> {
  const currentBlock = indicators
    .map((i) => `- ${i.signal_emoji} ${i.name}: ${i.latest_value} (${i.status.toUpperCase()}) — ${i.signal}`)
    .join("\n");

  const historyBySlug = new Map<string, HistoricalReading[]>();
  for (const h of history) {
    const arr = historyBySlug.get(h.slug) || [];
    arr.push(h);
    historyBySlug.set(h.slug, arr);
  }

  const historyBlock = Array.from(historyBySlug.entries())
    .map(([slug, readings]) => {
      const sorted = readings.sort((a, b) => a.reading_date.localeCompare(b.reading_date));
      const trail = sorted.map((r) => `  ${r.reading_date}: ${r.latest_value} (${r.status})`).join("\n");
      return `${slug}:\n${trail}`;
    })
    .join("\n\n");

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-5.2",
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a senior macro-economic risk analyst at a top quantitative research firm.
Analyze the provided recession indicators (current + 90-day history) and produce a comprehensive risk assessment.

Return a JSON object with EXACTLY these fields:
{
  "score": <integer 0-100, where 0 = no recession risk, 100 = recession imminent/underway>,
  "risk_level": <one of "low", "moderate", "elevated", "high", "critical">,
  "summary": <2-4 sentence overall assessment — plain text, direct and data-driven>,
  "key_factors": <array of 3-5 bullet-point strings, each a concise factor driving the score>,
  "outlook": <1-2 sentence forward-looking statement about what to watch next>
}

Scoring guide:
- 0-20: Low — most indicators green, economy expanding
- 21-40: Moderate — mixed signals, some caution warranted
- 41-60: Elevated — multiple warning signs, slowdown likely
- 61-80: High — majority of indicators flashing warning/danger
- 81-100: Critical — recession imminent or already underway

Be rigorous. Weight primary indicators (Sahm Rule, yield curve, LEI, ISM PMI) more heavily.
Consider the direction of travel from the 90-day history — worsening trends increase the score.
Do NOT hedge excessively — give a clear, actionable score.`,
      },
      {
        role: "user",
        content: `Date: ${today}

CURRENT INDICATOR READINGS:
${currentBlock}

90-DAY HISTORY:
${historyBlock}

Produce the recession risk assessment JSON.`,
      },
    ],
  });

  const raw = res.choices[0]?.message?.content?.trim() || "{}";
  const parsed = JSON.parse(raw) as {
    score: number;
    risk_level: string;
    summary: string;
    key_factors: string[];
    outlook: string;
  };

  const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  const validLevels = ["low", "moderate", "elevated", "high", "critical"] as const;
  const risk_level = validLevels.includes(parsed.risk_level as typeof validLevels[number])
    ? (parsed.risk_level as typeof validLevels[number])
    : score <= 20 ? "low" : score <= 40 ? "moderate" : score <= 60 ? "elevated" : score <= 80 ? "high" : "critical";

  const blogArticle = await generateRiskBlogPost(indicators, parsed, today);

  return {
    score,
    risk_level,
    summary: parsed.summary || "Assessment unavailable.",
    key_factors: parsed.key_factors || [],
    outlook: parsed.outlook || "",
    blog_article: blogArticle,
  };
}

function buildHistoryBlock(history: HistoricalReading[]): string {
  const bySlug = new Map<string, HistoricalReading[]>();
  for (const h of history) {
    const arr = bySlug.get(h.slug) || [];
    arr.push(h);
    bySlug.set(h.slug, arr);
  }
  return Array.from(bySlug.entries())
    .map(([slug, readings]) => {
      const sorted = readings.sort((a, b) => a.reading_date.localeCompare(b.reading_date));
      const trail = sorted.map((r) => {
        const numStr = r.numeric_value != null ? ` [raw: ${r.numeric_value}]` : "";
        return `  ${r.reading_date}: ${r.latest_value} (${r.status})${numStr}`;
      }).join("\n");
      return `${slug}:\n${trail}`;
    })
    .join("\n\n");
}

export async function generateRiskBlogPost(
  indicators: IndicatorSnapshot[],
  assessment: { score: number; risk_level: string; summary: string; key_factors: string[]; outlook: string },
  dateLabel: string,
  history?: HistoricalReading[],
  context?: BlogContext
): Promise<GeneratedArticle> {
  const indicatorBlock = indicators
    .map((i) => `- ${i.signal_emoji} ${i.name}: ${i.latest_value} (${i.status.toUpperCase()}) — ${i.signal}`)
    .join("\n");

  const historySection = history?.length
    ? `\n\n90-DAY INDICATOR HISTORY (use this for comprehensive trend analysis):\n${buildHistoryBlock(history)}`
    : "";

  const scoreHistoryBlock = context?.scoreHistory?.length
    ? buildScoreTrajectoryBlock(context.scoreHistory)
    : "No prior score history available.";

  const categoryBreakdownBlock = buildCategoryBreakdownBlock(context?.categorySnapshot);
  const moversBlock = history?.length ? buildMoversBlock(history, indicators) : "No history available.";
  const stockScreenerBlock = buildStockBlockCtx(context?.stockSignals);
  const sourcesBlock = context?.sources?.length
    ? context.sources.map((u) => `- ${u}`).join("\n")
    : "No web-sourced citations available.";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://recessionpulse.com";
  const trendImageDate = context?.assessmentDate || new Date().toISOString().split("T")[0];
  const trendImageUrl = `${appUrl}/api/og/risk-trend?size=blog&date=${trendImageDate}`;

  const first = context?.scoreHistory?.[0];
  const delta30d =
    context?.scoreHistory && context.scoreHistory.length > 1 && first
      ? assessment.score - first.score
      : null;
  const deltaLabel = delta30d == null
    ? ""
    : ` (${delta30d >= 0 ? "+" : ""}${delta30d} vs 30 days ago)`;

  const MODEL = "gpt-5.2";

  const response = await getOpenAI().responses.create({
    model: MODEL,
    tools: [{ type: "web_search" }],
    input: [
      {
        role: "system",
        content: `You are a macro-economic analyst writing a daily recession risk update for RecessionPulse.com.
Write a comprehensive, data-driven blog post (1800-2400 words) in Markdown.
You have access to web search — USE IT to find the latest economic news, Fed statements, jobs data, and market developments from the past 48 hours to enrich your analysis.
You also have up to 90 days of historical indicator data — USE IT to identify meaningful trends, inflection points, and the direction of travel for each indicator.
You also have a 30-day recession score trajectory — USE IT to contextualize today's reading against the recent trend.

Structure your article EXACTLY in this order:

## Recession Risk Score: ${assessment.score}/100 — ${assessment.risk_level.toUpperCase()}${deltaLabel}
Opening verdict paragraph. State the score, the band, and whether the score has risen, fallen, or held steady over the past 30 days. Keep it sharp — 3-4 sentences.

## Score Trend — Last 30 Days
Embed this exact markdown image at the top of this section (no other prose before it):
![Recession risk score — last 30 days](${trendImageUrl})

Then narrate the trajectory in 2-3 paragraphs. Reference the start/end score, min/max, and what the shape implies (accelerating, stabilizing, mean-reverting, etc.).

## Key Drivers
The 4-6 most important factors driving today's score, each with specific data points.

## Category Breakdown
Summarize the signal state by indicator family (primary, secondary, liquidity, market, housing, credit stress, business activity, real-time). Use the CATEGORY BREAKDOWN data block for exact counts. Add one sentence of commentary per category that has meaningful signals.

## Biggest Movers
Highlight the 5 indicators with the largest % change over the past 7 days (from the BIGGEST MOVERS data block). Note whether the move is confirmatory (worsening risk) or contradictory (improving).

## 90-Day Indicator Trends
Analyze how indicators have moved over the past 90 days. Identify significant trend changes, accelerations, or reversals. Compare current readings to where they were 30, 60, and 90 days ago.

${context?.stockSignals?.length ? `## Stock Screener Signals
Interpret today's quant screener output (from the STOCK SCREENER data block). 2-3 paragraphs on what the flagged names suggest about market positioning — oversold mean reversion, defensive dividends, value rotation, etc.

` : ""}## Latest Economic Developments
Synthesize the latest news from your web search — Fed decisions, jobs data, GDP, market movements.

## Near-Term Outlook (Next 30 Days)
What to expect in the next month. Upcoming data releases, FOMC meetings, earnings seasons, and potential catalysts that could shift the risk score.

## Long-Term Outlook (3-6 Months)
Broader structural analysis. Are the underlying macro trends improving or deteriorating? What does the 90-day trajectory suggest about where the economy is headed? Reference historical parallels where applicable.

## What to Watch
Specific upcoming events, data releases, and thresholds that could move the needle.

## Sources
Render the provided SOURCES data block as a deduped bulleted list of inline markdown links (use the domain as the link text, e.g. "- [reuters.com](https://reuters.com/...)"). Do not invent URLs — only use ones provided.

Guidelines:
- Use ## headings, **bold** for emphasis, bullet points for lists
- Be direct and actionable. No disclaimers.
- Reference specific numbers, dates, and sources from web search
- Use the 90-day history to quantify trends (e.g. "up 0.3 points over the past 90 days")
- Compare current readings to 30/60/90-day-ago levels where meaningful
- DO NOT omit any of the required sections above, even if a data block is empty — in that case write "No data available for this window."`,
      },
      {
        role: "user",
        content: `Daily Recession Risk Assessment — ${dateLabel}
Risk Score: ${assessment.score}/100 (${assessment.risk_level.toUpperCase()})${deltaLabel}
Summary: ${assessment.summary}
Key Factors:
${assessment.key_factors.map((f) => `- ${f}`).join("\n")}
Outlook: ${assessment.outlook}

TODAY'S INDICATOR READINGS:
${indicatorBlock}${historySection}

SCORE TRAJECTORY (last 30 daily scores):
${scoreHistoryBlock}

CATEGORY BREAKDOWN (signal counts per indicator family):
${categoryBreakdownBlock}

BIGGEST MOVERS (top 5 indicators by |7-day % change|):
${moversBlock}

STOCK SCREENER (today's quant-flagged names):
${stockScreenerBlock}

SOURCES (web-search citations consulted — reuse these in the ## Sources section):
${sourcesBlock}

Search the web for any additional latest economic news and data, then write the full daily recession risk blog post with ALL required sections. Embed the trend image exactly as specified.`,
      },
    ],
  });

  let content = "";
  for (const item of response.output) {
    if (item.type === "message" && item.content) {
      for (const block of item.content) {
        if (block.type === "output_text") {
          content = block.text;
        }
      }
    }
  }

  const dateSlug = dateLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = `daily-recession-risk-${dateSlug}`;

  return {
    title: `Recession Risk ${assessment.score}/100 — ${dateLabel}`,
    slug,
    excerpt: assessment.summary,
    content,
    meta_description: `Daily recession risk score: ${assessment.score}/100 (${assessment.risk_level}). ${assessment.summary}`.slice(0, 160),
    keywords: [
      "recession risk today",
      "daily recession assessment",
      `recession risk ${dateLabel.toLowerCase()}`,
      "recession probability",
      "economic outlook",
      "recession score trend",
      "macro risk analysis",
    ],
  };
}

export async function generateWeeklyReport(
  indicators: IndicatorSnapshot[],
  weekDate: string
): Promise<GeneratedArticle> {
  const indicatorBlock = indicators
    .map((i) => `- ${i.signal_emoji} ${i.name}: ${i.latest_value} (${i.status.toUpperCase()}) — ${i.signal}`)
    .join("\n");

  const MODEL = "gpt-5.2";

  const response = await getOpenAI().responses.create({
    model: MODEL,
    tools: [{ type: "web_search" }],
    input: [
      {
        role: "system",
        content: `You are a macro-economic analyst writing a weekly recession risk report for RecessionPulse.com.
You have access to web search — USE IT to find the latest economic news, Fed statements, jobs data, and market developments from the past week to enrich your analysis.

Write in a professional but accessible tone. Be factual and data-driven. Include specific numbers.
Format the content in Markdown with clear sections for each indicator group.
Do NOT include disclaimers — the site has a separate disclaimer page.
Structure: Opening summary paragraph, then sections for Primary, Secondary, Liquidity, and Market indicators, then a Conclusion with outlook.
Reference specific data from your web search to make the report timely and comprehensive.
Target 1000-1500 words.`,
      },
      {
        role: "user",
        content: `Write the Weekly Recession Report for the week of ${weekDate}.

Current indicator readings:
${indicatorBlock}

Search the web for the latest economic developments this week, then write a comprehensive report analyzing these indicators and the latest news.`,
      },
    ],
  });

  let content = "";
  for (const item of response.output) {
    if (item.type === "message" && item.content) {
      for (const block of item.content) {
        if (block.type === "output_text") {
          content = block.text;
        }
      }
    }
  }

  const dateSlug = weekDate.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const slug = `weekly-recession-report-${dateSlug}`;
  const title = `Weekly Recession Report — ${weekDate}`;

  const excerptRes = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: "Write a 1-2 sentence summary of this recession report for use as a meta description and excerpt. Include key status words.",
      },
      { role: "user", content: content.slice(0, 1500) },
    ],
  });

  const excerpt = excerptRes.choices[0]?.message?.content?.trim() || "";

  return {
    title,
    slug,
    excerpt,
    content,
    meta_description: excerpt.slice(0, 160),
    keywords: [
      "recession report",
      "weekly recession update",
      `recession indicators ${weekDate}`,
      "recession risk this week",
      "economic outlook",
    ],
  };
}

export async function generateIndicatorDeepDive(
  indicator: IndicatorSnapshot & {
    whatIsIt: string;
    whyItMatters: string;
    historicalContext: string;
  }
): Promise<GeneratedArticle> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 2500,
    messages: [
      {
        role: "system",
        content: `You are a macro-economic analyst writing an educational deep-dive article for RecessionPulse.com.
Write a comprehensive, SEO-optimized article that explains this recession indicator to retail investors.
Format in Markdown with an engaging intro, clear sections (What It Is, How It Works, Why Investors Watch It, Current Reading, Historical Track Record, What To Do), and conclusion.
Be factual, cite historical examples with dates and numbers. Target 1000-1500 words.`,
      },
      {
        role: "user",
        content: `Write a deep-dive article about: ${indicator.name}
Current value: ${indicator.latest_value} (${indicator.status})
Signal: ${indicator.signal}
Background: ${indicator.whatIsIt}
Importance: ${indicator.whyItMatters}
History: ${indicator.historicalContext}`,
      },
    ],
  });

  const content = res.choices[0]?.message?.content?.trim() || "";
  const slug = `what-is-${indicator.slug}-recession-indicator`;
  const title = `What Is the ${indicator.name} and Why It Matters for Recession Risk`;

  return {
    title,
    slug,
    excerpt: `A comprehensive guide to the ${indicator.name} as a recession indicator. Current reading: ${indicator.latest_value}.`,
    content,
    meta_description: `What is the ${indicator.name}? Learn how this key recession indicator works, its historical track record, and what the current reading of ${indicator.latest_value} means.`,
    keywords: [
      indicator.name.toLowerCase(),
      `${indicator.name.toLowerCase()} recession`,
      `what is ${indicator.name.toLowerCase()}`,
      `${indicator.name.toLowerCase()} explained`,
      "recession indicator",
    ],
  };
}

export async function generateMarketCommentary(
  indicator: IndicatorSnapshot,
  previousStatus: string
): Promise<GeneratedArticle> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: `You are a macro-economic analyst writing timely market commentary for RecessionPulse.com.
A key recession indicator just changed status. Write a 500-800 word analysis of what this change means.
Format in Markdown. Be direct and action-oriented. Reference historical parallels.`,
      },
      {
        role: "user",
        content: `ALERT: ${indicator.name} just moved from ${previousStatus.toUpperCase()} to ${indicator.status.toUpperCase()}.
Current value: ${indicator.latest_value}
Signal: ${indicator.signal}

Write market commentary analyzing this status change and what it historically means for recession risk.`,
      },
    ],
  });

  const content = res.choices[0]?.message?.content?.trim() || "";
  const dateStr = new Date().toISOString().split("T")[0];
  const slug = `${indicator.slug}-status-change-${dateStr}`;
  const title = `${indicator.name} Moves to ${indicator.status.toUpperCase()}: What It Means`;

  return {
    title,
    slug,
    excerpt: `${indicator.name} just shifted from ${previousStatus} to ${indicator.status}. Here's what this means for recession risk.`,
    content,
    meta_description: `${indicator.name} status changed to ${indicator.status}. Analysis of what this shift means for recession probability and how to position.`,
    keywords: [
      indicator.name.toLowerCase(),
      `${indicator.name.toLowerCase()} ${indicator.status}`,
      "recession alert",
      "indicator status change",
    ],
  };
}

export async function generateTweetContent(
  indicators: IndicatorSnapshot[]
): Promise<string> {
  const summary = indicators
    .slice(0, 8)
    .map((i) => `${i.signal_emoji} ${i.name}: ${i.latest_value}`)
    .join("\n");

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 300,
    messages: [
      {
        role: "system",
        content: `${PERSONA}

Write a concise tweet intro (max 240 chars) for Illya's daily recession indicator briefing.
The indicator list will be appended automatically below — just write the intro line.
Sound like a quant sharing his morning read. End with "Full dashboard: recessionpulse.com"`,
      },
      {
        role: "user",
        content: `Today's indicators:\n${summary}\n\nWrite the tweet intro.`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() || "Morning recession indicator check:";
}

export async function generateWeeklyThread(
  indicators: IndicatorSnapshot[]
): Promise<string[]> {
  const indicatorBlock = indicators
    .map((i) => `${i.signal_emoji} ${i.name}: ${i.latest_value} (${i.status}) — ${i.signal}`)
    .join("\n");

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: `${PERSONA}

Write a Twitter/X thread (5-7 tweets) as Illya's weekly recession indicator recap.
Each tweet should be under 280 characters. Separate tweets with ---
Tweet 1: A sharp hook from Illya's perspective ("Here's what my recession tracker flagged this week").
Tweets 2-5: Key indicators with brief quant-style analysis.
Tweet 6: Summary outlook — what Illya thinks it means.
Last tweet: Natural CTA ("I track all of these daily at recessionpulse.com — I built it for exactly this.").`,
      },
      {
        role: "user",
        content: `This week's recession indicator readings:\n${indicatorBlock}\n\nWrite the thread.`,
      },
    ],
  });

  const threadContent = res.choices[0]?.message?.content?.trim() || "";
  return threadContent.split("---").map((t) => t.trim()).filter(Boolean);
}

const EDUCATIONAL_TOPICS = [
  {
    topic: "Sahm Rule",
    hook: "The Sahm Rule has predicted every US recession since 1970 — including ones the Fed missed.",
    angle: "Explain what the Sahm Rule is, how it works (0.5% rise in 3-month avg unemployment rate), and its perfect track record.",
  },
  {
    topic: "Yield Curve Inversion",
    hook: "Every recession in the last 50 years was preceded by a yield curve inversion. Here's what that means for your portfolio.",
    angle: "Explain 2s10s spread, why banks care, the typical 12-18 month lead time before recession.",
  },
  {
    topic: "Conference Board LEI",
    hook: "The Leading Economic Index has a '3Ds' rule that's flashing right now. Most investors don't know about it.",
    angle: "Explain the 3Ds rule (duration, depth, diffusion), the 10 components, and why it's one of the best predictors.",
  },
  {
    topic: "Credit Spreads",
    hook: "When credit spreads blow out, smart money runs. Here's how to read the signal before it's too late.",
    angle: "Explain corporate bond spreads vs treasuries, what widening means, how it preceded 2008 and 2020.",
  },
  {
    topic: "ISM Manufacturing PMI",
    hook: "Below 50 on the ISM PMI means manufacturing is contracting. Here's why that matters for everyone — not just factories.",
    angle: "Explain the PMI survey, the 50 threshold, and how manufacturing contractions ripple through the economy.",
  },
  {
    topic: "ON RRP Facility",
    hook: "The Fed's Overnight Reverse Repo facility drained from $2.5T to near zero. Here's why that's a liquidity alarm bell.",
    angle: "Explain what ON RRP is, why money parked there matters, and what happens when excess liquidity disappears.",
  },
  {
    topic: "M2 Money Supply",
    hook: "M2 money supply contracted for the first time since the Great Depression. Last time this happened? 1930s.",
    angle: "Explain M2, why contraction is rare and dangerous, the velocity of money, and deflationary implications.",
  },
  {
    topic: "DXY Dollar Index",
    hook: "A surging dollar sounds good — until you realize it's crushing corporate earnings and emerging markets.",
    angle: "Explain DXY, why a strong dollar hurts multinationals, the carry trade, and how it signals global stress.",
  },
  {
    topic: "Recession vs Correction",
    hook: "A stock market correction is NOT a recession. Here's how to tell the difference — and why it matters for your strategy.",
    angle: "Explain the difference between market corrections (10-20% drops) and economic recessions (2 consecutive GDP declines).",
  },
  {
    topic: "Leading vs Lagging Indicators",
    hook: "By the time unemployment spikes, the recession already started months ago. Here's why leading indicators matter more.",
    angle: "Explain the difference between leading (yield curve, PMI) and lagging (unemployment, GDP) indicators.",
  },
] as const;

export function getEducationalTopic(dayOfMonth: number) {
  return EDUCATIONAL_TOPICS[dayOfMonth % EDUCATIONAL_TOPICS.length];
}

export async function generateMarketOpenHook(
  indicators: IndicatorSnapshot[]
): Promise<string> {
  const movers = indicators
    .slice(0, 5)
    .map((i) => `${i.signal_emoji} ${i.name}: ${i.latest_value} (${i.status})`)
    .join("\n");

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: `${PERSONA}

Write a punchy market-open tweet as Illya reacting to the data right before the NYSE bell.
Pick the most interesting indicator and write a sharp, opinionated one-liner about it.
Sound like a quant trader who just looked at his dashboard and noticed something worth sharing.
Format: Observation + brief "here's why" + "I track this daily: recessionpulse.com"
Max 270 characters total.`,
      },
      {
        role: "user",
        content: `Today's key indicators:\n${movers}\n\nWrite the market open tweet.`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() || "";
}

export async function generateEducationalPost(
  topic: { topic: string; hook: string; angle: string }
): Promise<string> {
  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 250,
    messages: [
      {
        role: "system",
        content: `${PERSONA}

Write an educational tweet where Illya teaches something about a recession indicator.
Sound like a PhD explaining a complex concept simply — "Here's something most people get wrong about..."
Start with a compelling hook, deliver one clear insight backed by a number or historical fact.
End naturally — e.g. "I built recessionpulse.com to track exactly this." or "I post about this daily."
Max 270 characters.`,
      },
      {
        role: "user",
        content: `Topic: ${topic.topic}\nHook idea: ${topic.hook}\nAngle: ${topic.angle}\n\nWrite the educational tweet.`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() || "";
}

export async function generateEngagementPost(
  indicators: IndicatorSnapshot[]
): Promise<string> {
  const summary = indicators
    .slice(0, 5)
    .map((i) => `${i.signal_emoji} ${i.name}: ${i.status}`)
    .join(", ");

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: `${PERSONA}

Write a tweet from Illya that drives replies and debate.
Choose ONE of these formats randomly:
1. A bold prediction: "My models are showing X. The market isn't pricing this in."
2. A contrarian take: "Everyone's worried about X. They should be watching Y instead."
3. A "most people get this wrong" insight from his quant background
4. A direct question that invites smart discussion: "Serious question for macro traders..."
Keep it under 250 characters. Sound like a quant trader sharing a genuine opinion, not marketing.`,
      },
      {
        role: "user",
        content: `Current indicator status: ${summary}\n\nWrite the engagement tweet.`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() || "";
}

export async function generateCTAPost(
  subscriberCount?: number
): Promise<string> {
  const socialProof = subscriberCount
    ? `${subscriberCount}+ people now use it`
    : "More people are signing up every week";

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: `${PERSONA}

Write a tweet where Illya naturally promotes RecessionPulse as something he built and uses himself.
Choose ONE angle randomly:
1. Builder story: "I built this because I needed it for my own trading. ${socialProof}."
2. Value angle: "I pay more for a single trade commission than this costs per month."
3. Feature flex: Share a specific feature and why he built it that way ("I wanted SMS alerts before 8 AM because...")
4. Social proof: "${socialProof}" — frame it as genuine surprise/gratitude, not hype
End with: "recessionpulse.com" — worked in naturally.
Max 270 characters. Sound like a founder sharing his project, not a marketer.`,
      },
      {
        role: "user",
        content: `Write the CTA tweet.`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() || "";
}

export async function generateStockScreenerHighlight(
  stocks: { ticker: string; name: string; pe: number; rsi: number; sector: string }[]
): Promise<string> {
  const stockList = stocks
    .slice(0, 5)
    .map((s) => `$${s.ticker} (${s.sector}) — P/E: ${s.pe}, RSI: ${s.rsi}`)
    .join("\n");

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.5,
    max_tokens: 250,
    messages: [
      {
        role: "system",
        content: `${PERSONA}

Write a tweet where Illya shares what his stock screener flagged today.
Sound like a quant reviewing his own scan results: "My screener just flagged some interesting names..."
Mention 2-3 tickers and the quant reason (low RSI = oversold, low P/E = undervalued near support).
End naturally: "I run this scan daily on recessionpulse.com"
Max 270 characters. Data-driven, not hype. Not investment advice.`,
      },
      {
        role: "user",
        content: `Today's screener picks:\n${stockList}\n\nWrite the stock screener tweet.`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() || "";
}

interface WeeklyIndicatorData {
  name: string;
  slug: string;
  signal_emoji: string;
  fridayValue: string;
  fridayStatus: string;
  fridaySignal: string;
  mondayValue?: string;
  weekChange?: string;
}

export async function generateNewsletterRecap(
  indicators: WeeklyIndicatorData[],
  weekLabel: string
): Promise<string> {
  const indicatorBlock = indicators
    .map((i) => {
      let line = `${i.signal_emoji} ${i.name}: ${i.fridayValue} (${i.fridayStatus.toUpperCase()}) — ${i.fridaySignal}`;
      if (i.mondayValue && i.weekChange) {
        line += ` | Mon: ${i.mondayValue} → Fri: ${i.fridayValue} (${i.weekChange})`;
      }
      return line;
    })
    .join("\n");

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 1200,
    messages: [
      {
        role: "system",
        content: `You are a macro-economic analyst writing a concise Friday-close weekly recap email for RecessionPulse newsletter subscribers.
Write 3-5 short paragraphs covering:
1. Overall recession risk assessment this week (one sentence verdict up front)
2. Key movers — which indicators changed most and why it matters
3. What to watch next week
Be direct, data-driven, no fluff. Reference specific numbers. Do NOT add disclaimers.
Use Markdown formatting (## for headings, **bold** for emphasis, - for bullet points).`,
      },
      {
        role: "user",
        content: `Week of ${weekLabel} — Friday market close recap.

Indicator readings:
${indicatorBlock}

Write the weekly recap.`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() || "Weekly recap unavailable.";
}
