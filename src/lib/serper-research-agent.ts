import OpenAI from "openai";

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const MAX_TOOL_CALLS = 5;

interface ResearchResult {
  value: number;
  date: string;
  source_url: string;
  confidence: "high" | "medium" | "low";
}

interface IndicatorConfig {
  searchTemplate: string;
  latestSearchTemplate: string;
  expectedRange: [number, number];
  sourceDomains: string[];
  specialInstruction?: string;
}

const INDICATOR_CONFIGS: Record<string, IndicatorConfig> = {
  "nfib-optimism": {
    searchTemplate: "NFIB Small Business Optimism Index {date} value",
    latestSearchTemplate: "NFIB Small Business Optimism Index latest reading 2026 site:nfib.com OR site:tradingeconomics.com",
    expectedRange: [80, 120],
    sourceDomains: ["nfib.com", "tradingeconomics.com", "reuters.com"],
  },
  "gdpnow": {
    searchTemplate: "Atlanta Fed GDPNow estimate {date} site:atlantafed.org",
    latestSearchTemplate: "Atlanta Fed GDPNow latest estimate 2026 site:atlantafed.org",
    expectedRange: [-10, 15],
    sourceDomains: ["atlantafed.org", "reuters.com", "cnbc.com"],
  },
  "jpm-recession-probability": {
    searchTemplate: "JPMorgan recession probability {date} percent estimate",
    latestSearchTemplate: "JPMorgan JP Morgan recession probability 2026 latest percent",
    expectedRange: [0, 100],
    sourceDomains: ["reuters.com", "bloomberg.com", "cnbc.com", "jpmorgan.com"],
  },
  "emerging-markets": {
    searchTemplate: "MSCI Emerging Markets Index EEM ETF price {date}",
    latestSearchTemplate: "EEM ETF price today OR MSCI Emerging Markets Index latest value 2026",
    expectedRange: [15, 80],
    sourceDomains: ["finance.yahoo.com", "google.com/finance", "tradingeconomics.com"],
  },
  "conference-board-lei": {
    searchTemplate: "Conference Board Leading Economic Index {date} monthly change",
    latestSearchTemplate: "Conference Board Leading Economic Index latest monthly change 2026",
    expectedRange: [-5, 5],
    sourceDomains: ["conference-board.org", "reuters.com", "tradingeconomics.com"],
  },
  "us-interest-expense": {
    searchTemplate: "US federal government interest expense annualized {date} billions",
    latestSearchTemplate: "US federal government interest expense annualized 2026 billions latest",
    expectedRange: [500, 2000],
    sourceDomains: ["fiscal.treasury.gov", "fred.stlouisfed.org", "reuters.com"],
  },
  "bank-unrealized-losses": {
    searchTemplate: "FDIC bank unrealized losses securities {date} billions",
    latestSearchTemplate: "FDIC bank unrealized losses on securities latest quarterly billions 2026",
    expectedRange: [0, 1000],
    sourceDomains: ["fdic.gov", "reuters.com", "cnbc.com"],
  },
  "yield-curve-2s30s": {
    searchTemplate: "US Treasury 30 year minus 2 year yield spread {date}",
    latestSearchTemplate: "US Treasury 30 year yield minus 2 year yield spread today 2026",
    expectedRange: [-3, 5],
    sourceDomains: ["treasury.gov", "fred.stlouisfed.org", "cnbc.com"],
  },
  "silver-gold-ratio": {
    searchTemplate: "gold to silver ratio value {date}",
    latestSearchTemplate: "gold to silver ratio today 2026 current value",
    expectedRange: [50, 120],
    sourceDomains: ["longtermtrends.net", "goldprice.org", "macrotrends.net", "tradingeconomics.com"],
    specialInstruction: `The gold-to-silver ratio = gold price per oz / silver price per oz.
Example: if gold is $2,900/oz and silver is $32/oz, the ratio is 2900/32 = 90.6.
The result should be a number typically between 60 and 100. If you find both prices, DIVIDE gold by silver.`,
  },
  "copper-gold-ratio": {
    searchTemplate: "copper gold ratio value {date} site:longtermtrends.net OR site:macrotrends.net",
    latestSearchTemplate: "copper to gold price ratio current value 2026 (copper price per pound divided by gold price per ounce)",
    expectedRange: [0.0005, 0.005],
    sourceDomains: ["longtermtrends.net", "macrotrends.net", "tradingeconomics.com"],
    specialInstruction: `CRITICAL: The copper-to-gold ratio = (copper price in USD per pound) / (gold price in USD per troy ounce).
Example: if copper is $4.50/lb and gold is $2,900/oz, the ratio is 4.50/2900 = 0.00155.
The result MUST be a small decimal like 0.001 to 0.002. If you find individual prices, DIVIDE copper by gold.
DO NOT return the copper price alone (e.g. 4.32) — that is NOT the ratio.`,
  },
  "sp500-to-gdp": {
    searchTemplate: "S&P 500 to GDP ratio {date}",
    latestSearchTemplate: "S&P 500 to GDP ratio 2026 current Buffett indicator",
    expectedRange: [0.05, 0.40],
    sourceDomains: ["currentmarketvaluation.com", "longtermtrends.net", "macrotrends.net"],
    specialInstruction: `S&P 500 index value / GDP in billions. E.g. S&P at 6000, GDP at $29T → 6000/29000 ≈ 0.207. Return as a decimal.`,
  },
  "djia-to-gdp": {
    searchTemplate: "Dow Jones to GDP ratio {date}",
    latestSearchTemplate: "Dow Jones Industrial Average to GDP ratio 2026",
    expectedRange: [0.5, 2.5],
    sourceDomains: ["macrotrends.net", "longtermtrends.net", "tradingeconomics.com"],
    specialInstruction: `DJIA index value / GDP in billions. E.g. DJIA at 44000, GDP at $29T → 44000/29000 ≈ 1.52.`,
  },
  "nasdaq-to-gdp": {
    searchTemplate: "NASDAQ composite to GDP ratio {date}",
    latestSearchTemplate: "NASDAQ composite to GDP ratio 2026",
    expectedRange: [0.15, 1.0],
    sourceDomains: ["macrotrends.net", "longtermtrends.net", "tradingeconomics.com"],
    specialInstruction: `NASDAQ index value / GDP in billions. E.g. NASDAQ at 19000, GDP at $29T → 19000/29000 ≈ 0.655.`,
  },
  "sp500-pe-ratio": {
    searchTemplate: "S&P 500 PE ratio trailing {date}",
    latestSearchTemplate: "S&P 500 PE ratio current 2026 trailing twelve months",
    expectedRange: [10, 50],
    sourceDomains: ["multpl.com", "macrotrends.net", "currentmarketvaluation.com", "wsj.com"],
    specialInstruction: `Return the S&P 500 trailing twelve month (TTM) price-to-earnings ratio as a number (e.g. 26.5). Not the forward PE.`,
  },
  "djia-pe-ratio": {
    searchTemplate: "Dow Jones PE ratio {date}",
    latestSearchTemplate: "Dow Jones Industrial Average PE ratio current 2026",
    expectedRange: [8, 35],
    sourceDomains: ["macrotrends.net", "wsj.com", "barrons.com", "tradingeconomics.com"],
    specialInstruction: `Return the Dow Jones trailing PE ratio as a number (e.g. 22.1).`,
  },
  "nasdaq-pe-ratio": {
    searchTemplate: "NASDAQ composite PE ratio {date}",
    latestSearchTemplate: "NASDAQ composite PE ratio current 2026 trailing",
    expectedRange: [15, 80],
    sourceDomains: ["macrotrends.net", "wsj.com", "barrons.com", "tradingeconomics.com"],
    specialInstruction: `Return the NASDAQ Composite trailing PE ratio as a number (e.g. 33.5).`,
  },
};

async function serperSearch(query: string): Promise<string> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 8 }),
  });
  if (!res.ok) throw new Error(`Serper search failed: ${res.status}`);
  const data = await res.json();

  const parts: string[] = [];

  if (data.answerBox) {
    parts.push(`Answer Box: ${data.answerBox.answer || data.answerBox.snippet || JSON.stringify(data.answerBox)}`);
  }
  if (data.knowledgeGraph) {
    parts.push(`Knowledge Graph: ${data.knowledgeGraph.description || JSON.stringify(data.knowledgeGraph).slice(0, 500)}`);
  }
  if (data.organic) {
    for (const r of data.organic.slice(0, 5)) {
      parts.push(`[${r.title}](${r.link}): ${r.snippet || ""}`);
    }
  }

  return parts.join("\n\n") || "No results found.";
}

async function serperNews(query: string): Promise<string> {
  const res = await fetch("https://google.serper.dev/news", {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });
  if (!res.ok) throw new Error(`Serper news failed: ${res.status}`);
  const data = await res.json();

  if (!data.news?.length) return "No news results found.";

  return data.news
    .slice(0, 5)
    .map((n: { title: string; link: string; snippet?: string; date?: string }) =>
      `[${n.title}](${n.link}) (${n.date || "recent"}): ${n.snippet || ""}`
    )
    .join("\n\n");
}

async function serperScrape(url: string): Promise<string> {
  const res = await fetch("https://scrape.serper.dev", {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error(`Serper scrape failed: ${res.status}`);
  const data = await res.json();
  const text = data.text || data.content || JSON.stringify(data);
  return text.slice(0, 8000);
}

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "serper_search",
      description: "Search Google for information. Returns top organic results with snippets.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The Google search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "serper_news",
      description: "Search Google News for recent articles. Good for finding latest published values of economic indicators.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The news search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "serper_scrape",
      description: "Scrape a specific webpage URL to read its full text content. Use this to extract exact numeric values from a page found via search.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The URL to scrape" },
        },
        required: ["url"],
      },
    },
  },
];

function buildSystemPrompt(config: IndicatorConfig): string {
  const specialBlock = config.specialInstruction
    ? `\n\nSPECIAL INSTRUCTIONS FOR THIS INDICATOR:\n${config.specialInstruction}\n`
    : "";

  return `You are a financial data research agent. Your job is to find the EXACT numeric value of a specific economic indicator.
${specialBlock}
You have 3 tools:
- serper_search: Google search for finding pages with data
- serper_news: Google News search for recent articles
- serper_scrape: Scrape a URL to read its full content

STRATEGY:
1. Start with a targeted search query
2. Look at the snippets — if a value is clearly stated, you may have enough
3. If you need to verify or the snippets are unclear, scrape the most promising URL
4. Cross-reference with a news search if needed

VALIDATION:
- The expected value range for this indicator is ${config.expectedRange[0]} to ${config.expectedRange[1]}
- Trusted source domains: ${config.sourceDomains.join(", ")}
- If your found value is outside the expected range, double-check by searching again

When you have the value, respond with ONLY a JSON object (no markdown, no code fences):
{
  "value": <number>,
  "date": "<YYYY-MM-DD>",
  "source_url": "<url where you found this>",
  "confidence": "<high|medium|low>"
}

- "high" = from an official/primary source (e.g., nfib.com, atlantafed.org, fdic.gov)
- "medium" = from a reputable secondary source (reuters, cnbc, tradingeconomics)
- "low" = estimated or from an unverified source`;
}

async function executeToolCall(
  name: string,
  args: Record<string, string>
): Promise<string> {
  switch (name) {
    case "serper_search":
      return serperSearch(args.query);
    case "serper_news":
      return serperNews(args.query);
    case "serper_scrape":
      return serperScrape(args.url);
    default:
      return `Unknown tool: ${name}`;
  }
}

function parseAgentResponse(content: string): ResearchResult | null {
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.value !== "number" || isNaN(parsed.value)) return null;

    return {
      value: parsed.value,
      date: parsed.date || new Date().toISOString().split("T")[0],
      source_url: parsed.source_url || "",
      confidence: parsed.confidence || "low",
    };
  } catch {
    const numberMatch = content.match(/"value"\s*:\s*(-?\d+\.?\d*)/);
    if (numberMatch) {
      return {
        value: parseFloat(numberMatch[1]),
        date: new Date().toISOString().split("T")[0],
        source_url: "",
        confidence: "low",
      };
    }
    return null;
  }
}

/**
 * Run the agentic research loop to find an indicator value.
 * @param slug - indicator slug (used for config lookup)
 * @param name - human-readable indicator name
 * @param targetDate - optional "March 2025" style date for historical backfill
 * @returns { value, date, source_url, confidence } or null
 */
export async function researchIndicatorValue(
  slug: string,
  name: string,
  targetDate?: string
): Promise<ResearchResult | null> {
  if (!SERPER_API_KEY) {
    console.warn(`[SerperAgent] SERPER_API_KEY not set, cannot research ${slug}`);
    return null;
  }

  if (!process.env.OPENAI_API_KEY) {
    console.warn(`[SerperAgent] OPENAI_API_KEY not set, cannot research ${slug}`);
    return null;
  }

  const config = INDICATOR_CONFIGS[slug];
  if (!config) {
    console.warn(`[SerperAgent] No config for slug: ${slug}`);
    return null;
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const searchQuery = targetDate
    ? config.searchTemplate.replace("{date}", targetDate)
    : config.latestSearchTemplate;

  const userMessage = targetDate
    ? `Find the value of "${name}" for ${targetDate}. Search: ${searchQuery}`
    : `Find the latest value of "${name}". Search: ${searchQuery}`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: buildSystemPrompt(config) },
    { role: "user", content: userMessage },
  ];

  let toolCallCount = 0;

  for (let iteration = 0; iteration < MAX_TOOL_CALLS + 1; iteration++) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools: toolCallCount < MAX_TOOL_CALLS ? TOOLS : undefined,
        temperature: 0,
      });

      const choice = response.choices[0];
      if (!choice?.message) break;

      messages.push(choice.message);

      if (choice.message.tool_calls?.length && toolCallCount < MAX_TOOL_CALLS) {
        for (const tc of choice.message.tool_calls) {
          if (tc.type !== "function") continue;
          toolCallCount++;
          const args = JSON.parse(tc.function.arguments);

          let toolResult: string;
          try {
            toolResult = await executeToolCall(tc.function.name, args);
          } catch (err) {
            toolResult = `Error: ${err instanceof Error ? err.message : "Tool call failed"}`;
          }

          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: toolResult.slice(0, 12000),
          });
        }
        continue;
      }

      if (choice.message.content) {
        const result = parseAgentResponse(choice.message.content);
        if (result) {
          const [min, max] = config.expectedRange;
          if (result.value >= min && result.value <= max) {
            console.log(`[SerperAgent] ${slug}: ${result.value} (${result.confidence}) from ${result.source_url}`);
            return result;
          }
          console.warn(`[SerperAgent] ${slug}: value ${result.value} outside range [${min}, ${max}], but returning anyway`);
          return result;
        }
      }

      break;
    } catch (err) {
      console.error(`[SerperAgent] Error in iteration ${iteration} for ${slug}:`, err instanceof Error ? err.message : err);
      break;
    }
  }

  console.warn(`[SerperAgent] Failed to extract value for ${slug}`);
  return null;
}
