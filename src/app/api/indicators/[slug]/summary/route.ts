import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserSummary, setUserSummary, getGlobalSummary } from "@/lib/redis";
import { streamIndicatorSummary } from "@/lib/ai";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Check per-user Redis cache
  const cached = await getUserSummary(user.id, slug);
  if (cached) {
    return NextResponse.json({ slug, summary: cached, source: "cache" });
  }

  // 2. Check global Redis cache (from cron)
  const globalCached = await getGlobalSummary(slug);
  if (globalCached) {
    return NextResponse.json({ slug, summary: globalCached, source: "global_cache" });
  }

  // 3. Check Supabase (cron-generated)
  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const service = createServiceClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: dbSummary } = await service
      .from("indicator_summaries")
      .select("summary")
      .eq("slug", slug)
      .eq("reading_date", today)
      .single();

    if (dbSummary?.summary) {
      return NextResponse.json({ slug, summary: dbSummary.summary, source: "supabase" });
    }
  } catch {
    // Supabase lookup failed — continue to generate
  }

  // 4. Generate fresh — stream via SSE
  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const service = createServiceClient();

    const { data: indicator } = await service
      .from("indicator_readings")
      .select("*")
      .eq("slug", slug)
      .order("reading_date", { ascending: false })
      .limit(1)
      .single();

    if (!indicator) {
      return NextResponse.json(
        { slug, summary: "No data available for this indicator yet. Try refreshing data first.", source: "empty" }
      );
    }

    // Fetch up to 90 days of history for trend analysis
    const { data: historyRows } = await service
      .from("indicator_readings")
      .select("reading_date, numeric_value")
      .eq("slug", slug)
      .order("reading_date", { ascending: true })
      .limit(90);

    const history = (historyRows || [])
      .filter((r) => r.numeric_value !== null)
      .map((r) => ({ date: r.reading_date, value: r.numeric_value as number }));

    let stream;
    try {
      stream = await streamIndicatorSummary({
        name: indicator.name,
        slug: indicator.slug,
        latestValue: indicator.latest_value,
        status: indicator.status,
        signal: indicator.signal,
        triggerLevel: indicator.trigger_level || "",
        history,
      });
    } catch {
      return NextResponse.json({
        slug,
        summary: "AI analysis temporarily unavailable. The indicator data is still accurate — check back shortly for the AI summary.",
        source: "ai_error",
      });
    }

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
            await setUserSummary(user.id, slug, fullText);
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
    console.error("Summary route error:", err);
    return NextResponse.json({
      slug,
      summary: "Unable to generate analysis right now. Please try again later.",
      source: "error",
    });
  }
}
