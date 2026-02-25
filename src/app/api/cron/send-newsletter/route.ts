import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { buildWeeklyRecapEmail } from "@/lib/email-templates";
import { generateNewsletterRecap } from "@/lib/content-generator";
import { verifyCronAuth } from "@/lib/cron-auth";
import type { RecessionIndicator } from "@/types";

// Runs Friday at 21:15 UTC (4:15 PM ET) — 15 minutes after market close.
// Fetches the full week's indicator data, generates an AI recap, and emails
// every active newsletter subscriber.
export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const supabase = createServiceClient();
  const stats = { subscribers: 0, sent: 0, failed: 0 };

  try {
    // Calculate Monday-Friday date range for this week
    const now = new Date();
    const friday = new Date(now);
    const dayOfWeek = friday.getDay();
    // If not Friday, adjust (shouldn't happen in cron, but for manual testing)
    if (dayOfWeek !== 5) {
      friday.setDate(friday.getDate() - ((dayOfWeek + 2) % 7));
    }
    const monday = new Date(friday);
    monday.setDate(friday.getDate() - 4);

    const mondayStr = monday.toISOString().split("T")[0];
    const fridayStr = friday.toISOString().split("T")[0];

    const weekLabel = `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${friday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    // Fetch all readings from this week
    const { data: weekReadings } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, numeric_value, status, signal, signal_emoji, reading_date")
      .gte("reading_date", mondayStr)
      .lte("reading_date", fridayStr)
      .order("reading_date", { ascending: true });

    if (!weekReadings || weekReadings.length === 0) {
      return NextResponse.json({ message: "No indicator data for this week", stats });
    }

    // Group by slug: get Monday (earliest) and Friday (latest) readings
    const bySlug = new Map<string, typeof weekReadings>();
    for (const r of weekReadings) {
      const existing = bySlug.get(r.slug) || [];
      existing.push(r);
      bySlug.set(r.slug, existing);
    }

    const weeklyData = Array.from(bySlug.entries()).map(([slug, readings]) => {
      const earliest = readings[0];
      const latest = readings[readings.length - 1];
      const mondayVal = earliest.numeric_value ?? parseFloat(earliest.latest_value);
      const fridayVal = latest.numeric_value ?? parseFloat(latest.latest_value);
      let weekChange = "";
      if (!isNaN(mondayVal) && !isNaN(fridayVal) && mondayVal !== 0) {
        const pct = ((fridayVal - mondayVal) / Math.abs(mondayVal)) * 100;
        weekChange = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
      }

      return {
        name: latest.name,
        slug,
        signal_emoji: latest.signal_emoji,
        fridayValue: latest.latest_value,
        fridayStatus: latest.status,
        fridaySignal: latest.signal,
        mondayValue: readings.length > 1 ? earliest.latest_value : undefined,
        weekChange: readings.length > 1 ? weekChange : undefined,
      };
    });

    // Build the friday-close indicator list for email template
    const fridayIndicators: RecessionIndicator[] = weeklyData.map((w) => {
      const readings = bySlug.get(w.slug)!;
      const latest = readings[readings.length - 1];
      return {
        id: latest.slug,
        name: latest.name,
        slug: latest.slug,
        latest_value: latest.latest_value,
        trigger_level: "",
        status: latest.status,
        status_text: latest.status,
        signal: latest.signal,
        signal_emoji: latest.signal_emoji,
        category: "primary",
        updated_at: latest.reading_date,
      } as RecessionIndicator;
    });

    // Generate AI recap using the full week's data
    const aiRecap = await generateNewsletterRecap(weeklyData, weekLabel);

    // Build the email
    const { subject, html: emailTemplate } = buildWeeklyRecapEmail(
      aiRecap,
      fridayIndicators,
      weekLabel
    );

    // Get active newsletter subscribers
    const { data: subscribers } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("status", "active");

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: "No active newsletter subscribers", stats, weekLabel });
    }

    stats.subscribers = subscribers.length;

    // Send to each subscriber (with their email in unsubscribe link)
    for (const sub of subscribers) {
      try {
        const personalizedHtml = emailTemplate.replace("{{email}}", encodeURIComponent(sub.email));

        const result = await sendEmail({
          to: sub.email,
          subject,
          html: personalizedHtml,
        });

        if (result.success) {
          stats.sent++;
        } else {
          stats.failed++;
          console.error(`Newsletter send failed for ${sub.email}:`, result.error);
        }
      } catch (err) {
        stats.failed++;
        console.error(`Newsletter send error for ${sub.email}:`, err);
      }

      // Rate limit: small delay between sends
      await new Promise((r) => setTimeout(r, 100));
    }

    return NextResponse.json({
      message: "Newsletter sent",
      stats,
      weekLabel,
      indicatorCount: weeklyData.length,
    });
  } catch (error) {
    console.error("Newsletter cron error:", error);
    return NextResponse.json(
      { error: "Newsletter failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
