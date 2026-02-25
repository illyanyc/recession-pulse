import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/sms";
import { sendEmail } from "@/lib/resend";
import { formatRecessionSMS, formatStockAlertSMS } from "@/lib/message-formatter";
import { buildDailyBriefingEmail } from "@/lib/email-templates";
import { fetchIndicatorTrends, mergeWithTrends } from "@/lib/indicator-history";
import { verifyCronAuth } from "@/lib/cron-auth";
import type { RecessionIndicator, StockSignal } from "@/types";

export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const supabase = createServiceClient();
  const stats = { queued: 0, sent: 0, failed: 0, processed: 0 };

  try {
    // 1. Get latest indicators
    const today = new Date().toISOString().split("T")[0];
    const { data: indicators } = await supabase
      .from("indicator_readings")
      .select("*")
      .eq("reading_date", today)
      .order("created_at", { ascending: false });

    // Deduplicate by slug AND name to handle any DB-level duplicates
    const latestIndicators: RecessionIndicator[] = indicators
      ? (() => {
          const seenSlugs = new Set<string>();
          const seenNames = new Set<string>();
          const unique: RecessionIndicator[] = [];
          for (const ind of indicators as RecessionIndicator[]) {
            const slug = ind.slug?.trim();
            const name = ind.name?.trim();
            if (slug && seenSlugs.has(slug)) continue;
            if (name && seenNames.has(name)) continue;
            if (slug) seenSlugs.add(slug);
            if (name) seenNames.add(name);
            unique.push(ind);
          }
          return unique;
        })()
      : [];

    // 2. Fetch historical trends from Supabase (past week)
    const trends = await fetchIndicatorTrends(latestIndicators);
    const indicatorsWithTrends = mergeWithTrends(latestIndicators, trends);

    // 3. Get latest stock signals
    const { data: stockSignals } = await supabase
      .from("stock_signals")
      .select("*")
      .eq("screened_at", today);

    // 4. Get active subscribers
    const { data: subscribers } = await supabase
      .from("profiles")
      .select("*, subscriptions!inner(plan, status)")
      .eq("subscriptions.status", "active");

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: "No active subscribers", stats });
    }

    // 5. Format messages (with trend context)
    const recessionMessage = formatRecessionSMS(indicatorsWithTrends);
    const stockMessage = formatStockAlertSMS((stockSignals as StockSignal[]) || []);

    // 5. Queue messages for each subscriber
    const messagesToInsert: {
      user_id: string;
      message_type: string;
      channel: string;
      recipient: string;
      content: string;
      scheduled_for: string;
    }[] = [];

    for (const sub of subscribers) {
      const plan = sub.subscriptions?.[0]?.plan || "pulse";

      // SMS — disabled until toll-free verification completes
      // TODO: re-enable SMS alerts once Twilio toll-free is verified

      // Email alerts (branded HTML with trend data)
      if (sub.email && sub.email_alerts_enabled) {
        const emailPlan = plan === "pulse_pro" ? "pulse_pro" : "pulse";
        const { html: emailHtml } = buildDailyBriefingEmail(
          indicatorsWithTrends,
          (stockSignals as StockSignal[]) || [],
          emailPlan
        );
        messagesToInsert.push({
          user_id: sub.id,
          message_type: "recession_alert",
          channel: "email",
          recipient: sub.email,
          content: emailHtml,
          scheduled_for: new Date().toISOString(),
        });
      }
    }

    // Insert into queue
    if (messagesToInsert.length > 0) {
      await supabase.from("message_queue").insert(messagesToInsert);
      stats.queued = messagesToInsert.length;
    }

    // 6. Process the queue
    const { data: pendingMessages } = await supabase
      .from("message_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("created_at")
      .limit(100);

    if (pendingMessages) {
      for (const msg of pendingMessages) {
        // Mark as processing
        await supabase
          .from("message_queue")
          .update({ status: "processing", attempts: msg.attempts + 1 })
          .eq("id", msg.id);

        let success = false;
        let errorMsg = "";

        try {
          if (msg.channel === "sms") {
            const result = await sendSMS(msg.recipient, msg.content);
            success = result.success;
            errorMsg = result.error || "";
          } else if (msg.channel === "email") {
            const isHtml = msg.content.includes("<!DOCTYPE") || msg.content.includes("<html");
            const subject = msg.message_type === "recession_alert"
              ? `RecessionPulse Daily Briefing — ${new Date().toLocaleDateString()}`
              : "RecessionPulse Alert";
            const result = await sendEmail({
              to: msg.recipient,
              subject,
              html: isHtml ? msg.content : `<div style="font-family:monospace;white-space:pre-wrap;background:#0a0a0f;color:#e5e7eb;padding:24px;border-radius:0px;">${msg.content}</div>`,
            });
            success = result.success;
            errorMsg = result.error || "";
          }
        } catch (err) {
          errorMsg = err instanceof Error ? err.message : "Send failed";
        }

        if (success) {
          await supabase
            .from("message_queue")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", msg.id);

          // Log to message history
          await supabase.from("message_log").insert({
            user_id: msg.user_id,
            message_type: msg.message_type,
            channel: msg.channel,
            content: msg.content,
            sent_at: new Date().toISOString(),
          });

          stats.sent++;
        } else {
          const newStatus = msg.attempts >= msg.max_attempts ? "failed" : "pending";
          await supabase
            .from("message_queue")
            .update({ status: newStatus, error: errorMsg })
            .eq("id", msg.id);
          stats.failed++;
        }

        stats.processed++;

        // Small delay between sends to avoid rate limiting
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    return NextResponse.json({
      message: `Alert cycle complete`,
      stats,
      subscribers: subscribers.length,
      indicators: latestIndicators.length,
    });
  } catch (error) {
    console.error("Send alerts error:", error);
    return NextResponse.json(
      { error: "Alert sending failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
