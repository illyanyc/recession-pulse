import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

interface ResearchRequest {
  slug: string;
  name: string;
  description: string;
}

interface ResearchResult {
  value: number;
  date: string;
  source_url: string;
  confidence: "high" | "medium" | "low";
  raw_text: string;
}

const INDICATOR_SEARCH_HINTS: Record<string, string> = {
  "conference-board-lei":
    "Conference Board Leading Economic Index latest monthly change value site:conference-board.org OR site:reuters.com",
  "jpm-recession-probability":
    "JPMorgan recession probability 2026 latest estimate percent",
  "emerging-markets":
    "MSCI Emerging Markets Index OR EEM ETF latest price today",
  "bank-unrealized-losses":
    "FDIC bank unrealized losses billions latest quarterly report",
  "us-interest-expense":
    "US federal government interest expense annualized billions latest",
  "gdpnow":
    "Atlanta Fed GDPNow latest estimate site:atlantafed.org",
  "nfib-optimism":
    "NFIB Small Business Optimism Index latest reading site:nfib.com",
  "sos-recession":
    "SOS recession indicator Richmond Fed latest value OR insured unemployment rate trend",
};

async function searchWeb(query: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a financial data research assistant. Your job is to find the latest value of economic indicators.
You have access to web search via the search tool. Use it to find the most recent published value.
Always return the actual numeric value, the date it was published, and the source URL.
If you cannot find a reliable value, say so clearly.`,
        },
        {
          role: "user",
          content: `Search for: ${query}

Return ONLY a JSON object (no markdown, no code fences) with these fields:
- "value": the numeric value (number, not string)
- "date": the publication date in YYYY-MM-DD format
- "source_url": the URL where you found this data
- "confidence": "high" if from official source, "medium" if from reputable news, "low" if estimated
- "raw_text": a brief excerpt of the source text confirming the value`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "web_search",
            description: "Search the web for current information",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      web_search_options: {
        search_context_size: "medium",
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenAI API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function parseResearchResult(raw: string): ResearchResult | null {
  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (typeof parsed.value !== "number" || isNaN(parsed.value)) {
      return null;
    }

    return {
      value: parsed.value,
      date: parsed.date || new Date().toISOString().split("T")[0],
      source_url: parsed.source_url || "",
      confidence: parsed.confidence || "low",
      raw_text: parsed.raw_text || "",
    };
  } catch {
    const numberMatch = raw.match(/-?\d+\.?\d*/);
    if (numberMatch) {
      return {
        value: parseFloat(numberMatch[0]),
        date: new Date().toISOString().split("T")[0],
        source_url: "",
        confidence: "low",
        raw_text: raw.slice(0, 200),
      };
    }
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body: ResearchRequest = await req.json();
    const { slug, name, description } = body;

    if (!slug || !name) {
      return new Response(
        JSON.stringify({ error: "slug and name are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const searchHint = INDICATOR_SEARCH_HINTS[slug] || `${name} latest value ${description}`;
    const query = `What is the latest value of "${name}"? ${searchHint}`;

    const rawResponse = await searchWeb(query);
    const result = parseResearchResult(rawResponse);

    if (!result) {
      return new Response(
        JSON.stringify({
          error: "Could not parse a numeric value from research",
          raw: rawResponse.slice(0, 500),
          slug,
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        slug,
        name,
        ...result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
