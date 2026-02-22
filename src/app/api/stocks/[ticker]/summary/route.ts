import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserSummary, setUserSummary } from "@/lib/redis";
import OpenAI from "openai";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const price = searchParams.get("price") || "N/A";
  const ema200 = searchParams.get("ema200") || "N/A";
  const rsi = searchParams.get("rsi") || "N/A";
  const pe = searchParams.get("pe") || "N/A";
  const divYield = searchParams.get("yield") || "0";
  const sector = searchParams.get("sector") || "Unknown";
  const signalType = searchParams.get("signal") || "unknown";
  const company = searchParams.get("company") || ticker;

  const cacheKey = `stock:${ticker}`;

  // Check Redis cache
  const cached = await getUserSummary(user.id, cacheKey);
  if (cached) {
    return NextResponse.json({ ticker, summary: cached, source: "cache" });
  }

  // Stream from OpenAI
  const pctBelow = ema200 !== "N/A" && price !== "N/A"
    ? (((parseFloat(price) - parseFloat(ema200)) / parseFloat(ema200)) * 100).toFixed(1)
    : "N/A";

  const prompt = `Stock: ${company} (${ticker})
Sector: ${sector}
Signal type: ${signalType === "value_dividend" ? "Value / Dividend Pick" : "Oversold Growth"}
Current price: $${price}
200-day EMA: $${ema200} (${pctBelow}% ${parseFloat(pctBelow) < 0 ? "below" : "above"})
RSI(14): ${rsi}
Forward P/E: ${pe}
Dividend yield: ${divYield}%`;

  try {
    const stream = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 350,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are a concise stock analyst for recession-defensive investing. Write a 3-4 sentence analysis of this stock considering its technical setup (EMA, RSI) and valuation (P/E, yield). Mention whether it looks like a value trap or genuine opportunity. Note recession-specific risks for the sector. Be direct — no disclaimers.",
        },
        { role: "user", content: prompt },
      ],
    });

    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();

          if (fullText) {
            await setUserSummary(user.id, cacheKey, fullText);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream interrupted";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error(`Stock summary error for ${ticker}:`, err);
    return NextResponse.json({
      ticker,
      summary: "AI analysis temporarily unavailable. The stock data above is still accurate.",
      source: "error",
    });
  }
}
