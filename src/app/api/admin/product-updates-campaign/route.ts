import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { buildProductUpdatesEmail } from "@/lib/email-templates";
import { verifyCronAuth } from "@/lib/cron-auth";
import { Redis } from "@upstash/redis";

const CAMPAIGN_REDIS_KEY = "campaign:product-updates:scheduled-ids";

function getRedisClient(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

async function getRecipientEmails(): Promise<string[]> {
  const supabase = createServiceClient();
  const emailSet = new Set<string>();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("email")
    .eq("email_alerts_enabled", true);

  if (profiles) {
    for (const p of profiles) {
      if (p.email) emailSet.add(p.email.toLowerCase());
    }
  }

  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "active");

  if (subscribers) {
    for (const s of subscribers) {
      if (s.email) emailSet.add(s.email.toLowerCase());
    }
  }

  return Array.from(emailSet);
}

export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "preview";
  const scheduledAtOverride = searchParams.get("scheduledAt");

  // Default: today at 3:00 PM ET. In April we are on EDT (UTC-4), so 19:00 UTC.
  const scheduledAt = scheduledAtOverride ?? "2026-04-29T19:00:00Z";

  const email = buildProductUpdatesEmail();

  if (action === "preview") {
    const recipients = await getRecipientEmails();
    return NextResponse.json({
      message: "Preview mode — nothing scheduled",
      scheduledFor: scheduledAt,
      totalRecipients: recipients.length,
      sampleRecipients: recipients.slice(0, 5),
      email: {
        subject: email.subject,
        htmlLength: email.html.length,
      },
    });
  }

  if (action === "html") {
    return new Response(email.html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (action === "test") {
    const to = searchParams.get("to");
    if (!to) {
      return NextResponse.json(
        { error: "Provide ?to=<email> for test sends" },
        { status: 400 },
      );
    }
    const result = await sendEmail({
      to,
      subject: `[TEST] ${email.subject}`,
      html: email.html,
    });
    return NextResponse.json({ message: "Test email sent", to, ...result });
  }

  if (action === "cancel-last") {
    const redis = getRedisClient();
    const ids = ((await redis.get<string[]>(CAMPAIGN_REDIS_KEY)) ?? []) as string[];
    const resend = new Resend(process.env.RESEND_API_KEY!);
    let cancelled = 0;
    let failed = 0;
    for (const id of ids) {
      try {
        await resend.emails.cancel(id);
        cancelled++;
      } catch {
        failed++;
      }
      await new Promise((r) => setTimeout(r, 80));
    }
    await redis.del(CAMPAIGN_REDIS_KEY);
    return NextResponse.json({
      message: "Cancelled previous scheduled batch",
      total: ids.length,
      cancelled,
      failed,
    });
  }

  if (action === "cancel-all-scheduled") {
    // One-off recovery path for scheduled emails whose IDs were not stored.
    // Requires a temporary Resend FULL ACCESS API key (the default send-only
    // key cannot list or cancel). Pass via ?resendKey=re_... or set
    // RESEND_ADMIN_API_KEY in env.
    const adminKey =
      searchParams.get("resendKey") || process.env.RESEND_ADMIN_API_KEY;
    if (!adminKey) {
      return NextResponse.json(
        {
          error:
            "Provide a full-access Resend key via ?resendKey=re_... (or set RESEND_ADMIN_API_KEY). The default RESEND_API_KEY is restricted to send-only.",
        },
        { status: 400 },
      );
    }
    const subjectMatch =
      searchParams.get("subject") || "What's new on RecessionPulse";

    const resend = new Resend(adminKey);
    const stats = {
      listed: 0,
      matched: 0,
      cancelled: 0,
      failed: 0,
      ids: [] as string[],
    };

    // Page through Resend's list endpoint; cancel every scheduled email
    // whose subject starts with `subjectMatch`.
    // Resend rate limit is 5 req/s — we pace conservatively at ~4 req/s.
    const RESEND_MIN_SPACING_MS = 260;

    async function resendListRetry(url: string): Promise<Response> {
      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${adminKey}` },
        });
        if (res.status !== 429) return res;
        const backoff = 1000 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, backoff));
      }
      return fetch(url, { headers: { Authorization: `Bearer ${adminKey}` } });
    }

    async function cancelWithRetry(id: string): Promise<boolean> {
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const r = await resend.emails.cancel(id);
          if ((r as { error?: { name?: string } })?.error?.name === "rate_limit_exceeded") {
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
            continue;
          }
          return true;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "";
          if (msg.includes("rate_limit") || msg.includes("429")) {
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
            continue;
          }
          return false;
        }
      }
      return false;
    }

    let cursor: string | undefined;
    let pages = 0;
    const MAX_PAGES = 10;

    try {
      while (pages < MAX_PAGES) {
        const url = new URL("https://api.resend.com/emails");
        url.searchParams.set("limit", "100");
        if (cursor) url.searchParams.set("after", cursor);

        const res = await resendListRetry(url.toString());
        if (!res.ok) {
          const body = await res.text();
          return NextResponse.json(
            { error: `Resend list failed: ${res.status} ${body}`, ...stats },
            { status: 500 },
          );
        }
        const page = (await res.json()) as {
          data?: Array<{
            id: string;
            subject?: string;
            last_event?: string;
            scheduled_at?: string | null;
          }>;
          has_more?: boolean;
        };

        const items = page.data ?? [];
        stats.listed += items.length;

        for (const item of items) {
          const isScheduled =
            (item.last_event === "scheduled" || item.scheduled_at) &&
            (item.subject ?? "").startsWith(subjectMatch);
          if (!isScheduled) continue;
          stats.matched++;
          const ok = await cancelWithRetry(item.id);
          if (ok) {
            stats.cancelled++;
            stats.ids.push(item.id);
          } else {
            stats.failed++;
          }
          await new Promise((r) => setTimeout(r, RESEND_MIN_SPACING_MS));
        }

        if (!page.has_more || items.length === 0) break;
        cursor = items[items.length - 1]?.id;
        pages++;
        await new Promise((r) => setTimeout(r, RESEND_MIN_SPACING_MS));
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "unknown error", ...stats },
        { status: 500 },
      );
    }

    // Clear any stored batch IDs from the previous run.
    try {
      await getRedisClient().del(CAMPAIGN_REDIS_KEY);
    } catch {
      // non-fatal
    }

    return NextResponse.json({
      message: "Scheduled batch cancelled",
      subjectMatch,
      ...stats,
    });
  }

  if (action !== "schedule") {
    return NextResponse.json(
      {
        error:
          "Use ?action=preview, ?action=html, ?action=test&to=..., ?action=schedule, or ?action=cancel-last",
      },
      { status: 400 },
    );
  }

  const recipients = await getRecipientEmails();
  const stats = { emailsScheduled: 0, emailsFailed: 0 };
  const scheduledIds: string[] = [];

  for (const to of recipients) {
    try {
      const r = await sendEmail({
        to,
        subject: email.subject,
        html: email.html,
        scheduledAt,
      });
      if (r.success) {
        stats.emailsScheduled++;
        if (r.id) scheduledIds.push(r.id);
      } else {
        stats.emailsFailed++;
      }
    } catch {
      stats.emailsFailed++;
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  try {
    await getRedisClient().set(CAMPAIGN_REDIS_KEY, JSON.stringify(scheduledIds), {
      ex: 60 * 60 * 24 * 7,
    });
  } catch {
    // non-fatal
  }

  return NextResponse.json({
    message: "Product updates campaign scheduled",
    scheduledFor: scheduledAt,
    totalRecipients: recipients.length,
    ...stats,
    batchIdsStored: scheduledIds.length,
  });
}
