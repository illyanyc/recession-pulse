import OpenAI from "openai";

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

interface IndicatorContext {
  name: string;
  slug: string;
  latestValue: string;
  status: string;
  signal: string;
  triggerLevel: string;
  history?: { date: string; value: number }[];
}

const SYSTEM_PROMPT = `You are a concise macro-economic analyst writing a daily briefing for retail investors.

You will receive the indicator's current value AND up to 90 days of historical readings. You MUST analyze the full trend — identify direction changes, acceleration, inflection points, and how today's value compares to the recent range.

Write 2-3 sentences:
1. State today's value, its trend over the past weeks/months (rising, falling, flat, reversing), and the magnitude of change.
2. Explain what this trend means for recession risk right now — not just the level, but the direction.

Be factual. Cite specific numbers from the history. No disclaimers or hedging — just the signal.`;

function buildUserPrompt(ctx: IndicatorContext): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let historyBlock = "";
  if (ctx.history?.length) {
    const sorted = [...ctx.history].sort((a, b) => a.date.localeCompare(b.date));
    const oldest = sorted[0];
    const newest = sorted[sorted.length - 1];
    const mid = sorted[Math.floor(sorted.length / 2)];
    const values = sorted.map((h) => h.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    historyBlock = `\n\n--- Historical data (${sorted.length} readings, ${oldest.date} to ${newest.date}) ---`;
    historyBlock += `\nRange: ${min} to ${max}`;
    historyBlock += `\nMidpoint reading (${mid.date}): ${mid.value}`;
    historyBlock += `\nOldest (${oldest.date}): ${oldest.value} → Latest (${newest.date}): ${newest.value}`;
    historyBlock += `\n\nFull time series:\n${sorted.map((h) => `  ${h.date}: ${h.value}`).join("\n")}`;
  }

  return `Date: ${today}\nIndicator: ${ctx.name}\nCurrent value: ${ctx.latestValue}\nStatus: ${ctx.status}\nSignal: ${ctx.signal}\nTrigger: ${ctx.triggerLevel}${historyBlock}`;
}

export async function generateIndicatorSummary(ctx: IndicatorContext): Promise<string> {
  try {
    const res = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 300,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(ctx) },
      ],
    });
    return res.choices[0]?.message?.content?.trim() || "Summary unavailable.";
  } catch (err) {
    console.error("OpenAI generateIndicatorSummary failed:", err instanceof Error ? err.message : err);
    return "AI summary temporarily unavailable.";
  }
}

export async function streamIndicatorSummary(ctx: IndicatorContext) {
  try {
    return await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 300,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(ctx) },
      ],
    });
  } catch (err) {
    console.error("OpenAI streamIndicatorSummary failed:", err instanceof Error ? err.message : err);
    throw err;
  }
}
