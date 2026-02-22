import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

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
        content: `Write a concise Twitter post (max 240 chars before the indicator list) for RecessionPulse's daily briefing. 
Be professional but engaging. No hashtags. End with the URL recessionpulse.com`,
      },
      {
        role: "user",
        content: `Today's indicators:\n${summary}\n\nWrite the tweet intro (the indicator list will be appended automatically).`,
      },
    ],
  });

  return res.choices[0]?.message?.content?.trim() || "RecessionPulse Daily Update";
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
        content: `Write a Twitter/X thread (5-7 tweets) for RecessionPulse's weekly recap.
Each tweet should be under 280 characters. Separate tweets with ---
Tweet 1: Hook/headline. Tweets 2-5: Key indicators with analysis. Tweet 6: Summary outlook. Last tweet: CTA to recessionpulse.com
Be professional, data-driven, and engaging. No hashtags.`,
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
