import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const platform = searchParams.get("platform") || "hackernews";

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const supabase = createServiceClient();

    const { data: readings } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, status, signal, signal_emoji")
      .order("reading_date", { ascending: false });

    const latestBySlug = new Map<string, typeof readings extends (infer T)[] | null ? T : never>();
    if (readings) {
      for (const r of readings) {
        if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
      }
    }
    const indicators = Array.from(latestBySlug.values());

    const indicatorBlock = indicators
      .map((i) => `${i.signal_emoji} ${i.name}: ${i.latest_value} (${i.status})`)
      .join("\n");

    const authorContext = `Written by Illya Nayshevsky, Ph.D. (@wallstphd on X).
Illya is a data scientist and quant trader with a PhD from CUNY. He runs Alpha Inertia Capital (quantitative trading firm) and built RecessionPulse as a tool for his own trading, then opened it up to other investors.
Tech stack: Next.js, Supabase, FRED API, OpenAI, Twilio, Vercel crons.
Write in first person as Illya.`;

    const prompts: Record<string, string> = {
      hackernews: `Write a Hacker News "Show HN" post from Illya about RecessionPulse (recessionpulse.com).
${authorContext}

RecessionPulse tracks 9+ recession indicators daily and sends SMS/email alerts.

Current indicators:
${indicatorBlock}

Focus on the technical angle: data pipeline from FRED API, cron-based indicator analysis, how signals are computed.
Format: Title line, then blank line, then body. Keep it concise and technical — HN audience.`,

      reddit: `Write a Reddit post for r/economics or r/finance from Illya about his weekly recession indicator analysis.
${authorContext}

Be genuinely informative and value-first. NOT promotional.

Current indicators:
${indicatorBlock}

Write a self-post with real analysis. Mention "I built recessionpulse.com to track these" naturally at the end.
Format: Title line, then blank line, then body.`,

      producthunt: `Write a Product Hunt launch description for RecessionPulse, launched by Illya Nayshevsky.
${authorContext}

Features:
- 9+ recession indicators tracked daily (Sahm Rule, yield curve, LEI, credit spreads, etc.)
- Daily email briefings at 7:15 AM ET (free) + SMS alerts (Pulse)
- Stock screener: stocks below 200 EMA, RSI <30, P/E <15
- AI-generated indicator summaries
- Real-time dashboard
- $6.99/mo (Pulse) or $9.99/mo (Pulse Pro with stock screener)

Write: tagline (short), description (2-3 sentences from Illya's perspective), and 3 maker comments for launch day.`,

      indiehackers: `Write an Indie Hackers post from Illya about building RecessionPulse.
${authorContext}

Focus on: why he built it (needed it for his own quant trading), technical decisions, business model, growth.

Current indicators being tracked:
${indicatorBlock}

Format as a "Show IH" post. Be authentic — he's a PhD/quant who built a SaaS, not a marketer.`,
    };

    const prompt = prompts[platform] || prompts.hackernews;

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: "You ghostwrite platform-appropriate content for a technical founder. Sound authentic, smart, and builder-minded. Never salesy.",
        },
        { role: "user", content: prompt },
      ],
    });

    const generatedContent = res.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      platform,
      content: generatedContent,
      indicatorCount: indicators.length,
    });
  } catch (error) {
    console.error("Generate post error:", error);
    return NextResponse.json(
      { error: "Failed to generate post", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
