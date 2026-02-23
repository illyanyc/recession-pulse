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
  signal_emoji?: string;
  reading_date?: string;
}

interface StockSignalSnapshot {
  ticker: string;
  company_name: string;
  signal_type: string;
  pe_ratio?: number;
  dividend_yield?: number;
  rsi_14?: number;
  market_cap?: number;
}

interface HistoricalReading {
  slug: string;
  name: string;
  latest_value: string;
  status: string;
  signal: string;
  reading_date: string;
}

export interface AgenticRiskResult {
  score: number;
  risk_level: "low" | "moderate" | "elevated" | "high" | "critical";
  summary: string;
  key_factors: string[];
  outlook: string;
  sources: string[];
  model: string;
}

const RISK_SYSTEM_PROMPT = `You are a senior macro-economic risk analyst at a top quantitative hedge fund.
Your job: produce a precise RECESSION RISK SCORE (0-100) for the US economy over the next 90 days.

You have access to web search. USE IT AGGRESSIVELY to get the latest data on:
- Federal Reserve policy decisions, FOMC minutes, rate decisions
- Latest jobs report (NFP, unemployment rate, initial jobless claims)
- GDP growth estimates and nowcasts (Atlanta Fed GDPNow, NY Fed)
- Consumer confidence and spending data
- Corporate earnings trends and guidance
- Geopolitical risks affecting the economy
- Credit conditions, bank lending standards
- Housing market data (starts, permits, prices)
- Any breaking economic news from the past 48 hours

SCORING METHODOLOGY:
- 0-20: LOW — Economy expanding, most indicators green, no imminent risk
- 21-40: MODERATE — Mixed signals, some caution warranted, but growth continues
- 41-60: ELEVATED — Multiple warning signs, slowdown likely, defensive positioning warranted
- 61-80: HIGH — Majority of indicators warning/danger, recession probable within 90 days
- 81-100: CRITICAL — Recession imminent or already underway

WEIGHTING (in order of importance):
1. Sahm Rule trigger status (most reliable real-time indicator)
2. Yield curve (2s10s spread) — inversion history and current state
3. Conference Board LEI — 3Ds rule (duration, depth, diffusion)
4. ISM Manufacturing PMI — above/below 50
5. Credit spreads — widening = stress
6. Initial jobless claims trend
7. Stock market signals (RSI, breadth)
8. Liquidity indicators (M2, ON RRP)
9. Web-sourced current economic news and Fed guidance

CRITICAL RULES:
- Search the web for the LATEST economic data and news before scoring
- Weight the DIRECTION of travel heavily — worsening trends increase score
- Be rigorous and data-driven. Do NOT hedge or be wishy-washy
- If indicators conflict, explain the tension and lean toward the preponderance of evidence
- Reference specific numbers and dates from your research

After your analysis, return ONLY a valid JSON object (no markdown, no code fences):
{
  "score": <integer 0-100>,
  "risk_level": <"low" | "moderate" | "elevated" | "high" | "critical">,
  "summary": <3-5 sentence assessment — direct, data-driven, no disclaimers>,
  "key_factors": <array of 4-6 concise bullet-point strings>,
  "outlook": <2-3 sentence forward-looking statement about what to watch>
}`;

function buildIndicatorBlock(indicators: IndicatorSnapshot[]): string {
  return indicators
    .map((i) => `- ${i.signal_emoji || "📊"} ${i.name}: ${i.latest_value} (${i.status.toUpperCase()}) — ${i.signal}`)
    .join("\n");
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
      const trail = sorted.map((r) => `  ${r.reading_date}: ${r.latest_value} (${r.status})`).join("\n");
      return `${slug}:\n${trail}`;
    })
    .join("\n\n");
}

function buildStockBlock(stocks: StockSignalSnapshot[]): string {
  if (!stocks.length) return "No stock signals available.";
  return stocks
    .slice(0, 20)
    .map((s) => {
      const parts = [`$${s.ticker} (${s.company_name}): ${s.signal_type}`];
      if (s.pe_ratio) parts.push(`P/E: ${s.pe_ratio.toFixed(1)}`);
      if (s.dividend_yield) parts.push(`Yield: ${(s.dividend_yield * 100).toFixed(2)}%`);
      if (s.rsi_14) parts.push(`RSI: ${s.rsi_14.toFixed(1)}`);
      return `- ${parts.join(" | ")}`;
    })
    .join("\n");
}

export async function runAgenticRiskAssessment(
  indicators: IndicatorSnapshot[],
  history: HistoricalReading[],
  stocks: StockSignalSnapshot[]
): Promise<AgenticRiskResult> {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const userPrompt = `Date: ${today}

CURRENT RECESSION INDICATOR READINGS (from RecessionPulse tracker):
${buildIndicatorBlock(indicators)}

7-DAY INDICATOR HISTORY:
${buildHistoryBlock(history)}

CURRENT STOCK SCREENER SIGNALS (value/oversold picks):
${buildStockBlock(stocks)}

NOW: Search the web for the latest economic data, Fed decisions, jobs numbers, GDP estimates, and breaking economic news. Then synthesize ALL of this information into your recession risk assessment JSON.`;

  const openai = getOpenAI();

  const MODEL = "gpt-5.2";

  // Use the Responses API with web_search for agentic research
  const response = await openai.responses.create({
    model: MODEL,
    tools: [{ type: "web_search" }],
    input: [
      { role: "system", content: RISK_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  // Extract text content and sources from the response
  let textContent = "";
  const sources: string[] = [];

  for (const item of response.output) {
    if (item.type === "message" && item.content) {
      for (const block of item.content) {
        if (block.type === "output_text") {
          textContent = block.text;
          if (block.annotations) {
            for (const ann of block.annotations) {
              if (ann.type === "url_citation" && ann.url) {
                sources.push(ann.url);
              }
            }
          }
        }
      }
    }
  }

  // Parse the JSON from the response — strip markdown fences if present
  let cleaned = textContent.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  let parsed: {
    score: number;
    risk_level: string;
    summary: string;
    key_factors: string[];
    outlook: string;
  };

  try {
    parsed = JSON.parse(cleaned);
  } catch (parseErr) {
    throw new Error(`Failed to parse risk assessment JSON: ${parseErr instanceof Error ? parseErr.message : "Unknown"}`);
  }

  const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
  const validLevels = ["low", "moderate", "elevated", "high", "critical"] as const;
  const risk_level = validLevels.includes(parsed.risk_level as typeof validLevels[number])
    ? (parsed.risk_level as typeof validLevels[number])
    : score <= 20 ? "low" : score <= 40 ? "moderate" : score <= 60 ? "elevated" : score <= 80 ? "high" : "critical";

  return {
    score,
    risk_level,
    summary: parsed.summary || "Assessment unavailable.",
    key_factors: parsed.key_factors || [],
    outlook: parsed.outlook || "",
    sources: [...new Set(sources)].slice(0, 10),
    model: `${MODEL} + web_search`,
  };
}
