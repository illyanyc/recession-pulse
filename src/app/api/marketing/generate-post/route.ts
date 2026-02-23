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

    const prompts: Record<string, string> = {
      hackernews: `Write a Hacker News "Show HN" post for RecessionPulse (recessionpulse.com).
RecessionPulse tracks 15+ recession indicators daily and sends SMS/email alerts.
It's built with Next.js, Supabase, and uses the FRED API.

Current indicators:
${indicatorBlock}

Write a compelling HN post that focuses on the technical angle (data pipeline, API integration, indicator analysis).
Format: Title line, then blank line, then body. Keep it concise and technical — HN audience.`,

      reddit: `Write a Reddit post for r/economics or r/finance about a weekly recession indicator update.
Be genuinely informative and value-first. NOT promotional.

Current indicators:
${indicatorBlock}

Write a self-post that provides real analysis. Mention recessionpulse.com naturally at the end as the source.
Format: Title line, then blank line, then body.`,

      producthunt: `Write a Product Hunt launch description for RecessionPulse.
RecessionPulse tracks 15+ recession indicators daily and sends SMS/email alerts ($6.99/mo).
Built with Next.js, Supabase, FRED API, OpenAI for AI summaries.

Features:
- 15+ recession indicators tracked daily (Sahm Rule, yield curve, LEI, credit spreads, etc.)
- Daily SMS + email briefings at 8 AM ET
- Stock screener: stocks below 200 EMA, RSI <30, P/E <15
- AI-generated indicator summaries
- Real-time dashboard

Write: tagline (short), description (2-3 sentences), and 3 maker comments for launch day.`,

      indiehackers: `Write an Indie Hackers post about building RecessionPulse as a solo project.
Focus on the journey, technical decisions, and business model.

Current indicators being tracked:
${indicatorBlock}

Format as a "Show IH" post. Be authentic and share real details about building it.`,
    };

    const prompt = prompts[platform] || prompts.hackernews;

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: "You write compelling, platform-appropriate marketing copy. Be authentic, not salesy.",
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
