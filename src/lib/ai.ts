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

const SYSTEM_PROMPT =
  "You are a concise macro-economic analyst writing a daily briefing. Write a 2-3 sentence plain-English summary of this recession indicator for a retail investor. Reference the current value and date. Be factual, cite the numbers, mention the trend direction, and state clearly what it means for recession risk right now. No disclaimers or hedging — just the signal.";

function buildUserPrompt(ctx: IndicatorContext): string {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const historyBlock = ctx.history?.length
    ? `\nRecent readings:\n${ctx.history.map((h) => `  ${h.date}: ${h.value}`).join("\n")}`
    : "";
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
