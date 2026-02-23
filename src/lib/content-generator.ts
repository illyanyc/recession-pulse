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
  status: string;
  signal: string;
  reading_date: string;
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
    model: "gpt-4o",
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a senior macro-economic risk analyst at a top quantitative research firm.
Analyze the provided recession indicators (current + 7-day history) and produce a comprehensive risk assessment.

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
Consider the direction of travel from the 7-day history — worsening trends increase the score.
Do NOT hedge excessively — give a clear, actionable score.`,
      },
      {
        role: "user",
        content: `Date: ${today}

CURRENT INDICATOR READINGS:
${currentBlock}

7-DAY HISTORY:
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

async function generateRiskBlogPost(
  indicators: IndicatorSnapshot[],
  assessment: { score: number; risk_level: string; summary: string; key_factors: string[]; outlook: string },
  dateLabel: string
): Promise<GeneratedArticle> {
  const indicatorBlock = indicators
    .map((i) => `- ${i.signal_emoji} ${i.name}: ${i.latest_value} (${i.status.toUpperCase()}) — ${i.signal}`)
    .join("\n");

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You are a macro-economic analyst writing a daily recession risk update for RecessionPulse.com.
Write a concise, data-driven blog post (600-900 words) in Markdown.
Start with the risk score prominently, then analyze the key factors.
Use ## headings, **bold** for emphasis, and bullet points for lists.
Be direct and actionable. Do NOT include disclaimers.
Structure: Risk Score + Verdict, Key Drivers, Indicator Breakdown, What to Watch.`,
      },
      {
        role: "user",
        content: `Daily Recession Risk Assessment — ${dateLabel}
Risk Score: ${assessment.score}/100 (${assessment.risk_level.toUpperCase()})
Summary: ${assessment.summary}
Key Factors:
${assessment.key_factors.map((f) => `- ${f}`).join("\n")}
Outlook: ${assessment.outlook}

Indicator readings:
${indicatorBlock}

Write the daily risk assessment blog post.`,
      },
    ],
  });

  const content = res.choices[0]?.message?.content?.trim() || "";
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

  const res = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You are a macro-economic analyst writing a weekly recession risk report for RecessionPulse.com. 
Write in a professional but accessible tone. Be factual and data-driven. Include specific numbers.
Format the content in Markdown with clear sections for each indicator group.
Do NOT include disclaimers — the site has a separate disclaimer page.
Structure: Opening summary paragraph, then sections for Primary, Secondary, Liquidity, and Market indicators, then a Conclusion with outlook.`,
      },
      {
        role: "user",
        content: `Write the Weekly Recession Report for the week of ${weekDate}.

Current indicator readings:
${indicatorBlock}

Write a comprehensive 800-1200 word report analyzing these indicators and what they mean for recession risk.`,
      },
    ],
  });

  const content = res.choices[0]?.message?.content?.trim() || "";

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
3. Feature flex: Share a specific feature and why he built it that way ("I wanted SMS alerts at 8 AM because...")
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
