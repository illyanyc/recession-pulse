import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import {
  buildPromoEmail,
  buildPromoFollowUpEmail,
} from "@/lib/email-templates";
import { createTweet } from "@/lib/typefully-client";
import { verifyCronAuth } from "@/lib/cron-auth";

const WAVE_1_TWEET = `For a limited time, get your first month of Pulse Pro completely free.

What you get:
• Daily AI recession risk assessments
• Stock screener alerts (below 200 EMA + RSI <30 + P/E <15)
• Value dividend picks
• Sector rotation signals
• Portfolio defense positioning

More AI-powered features dropping this month.

Use coupon RPSPRING2026 at checkout.

recessionpulse.com/signup?plan=pulse_pro`;

const WAVE_2_TWEET = `Still haven't grabbed your free month of Pulse Pro?

Daily stock screener alerts, value picks, sector rotation signals — plus new AI features shipping this month.

Use code RPSPRING2026 at checkout before it's gone.

recessionpulse.com/signup?plan=pulse_pro`;

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

  const wave1At = "2026-03-26T22:00:00Z"; // 6pm EDT today
  const wave2At = "2026-03-27T19:00:00Z"; // 3pm EDT tomorrow

  if (action === "preview") {
    const promo = buildPromoEmail();
    const followUp = buildPromoFollowUpEmail();
    return NextResponse.json({
      message: "Preview mode — nothing scheduled",
      wave1: {
        scheduledFor: wave1At,
        tweet: WAVE_1_TWEET,
        email: { subject: promo.subject, htmlLength: promo.html.length },
      },
      wave2: {
        scheduledFor: wave2At,
        tweet: WAVE_2_TWEET,
        email: {
          subject: followUp.subject,
          htmlLength: followUp.html.length,
        },
      },
    });
  }

  if (action !== "schedule") {
    return NextResponse.json(
      { error: "Use ?action=preview or ?action=schedule" },
      { status: 400 }
    );
  }

  const stats = {
    wave1: { tweetScheduled: false, emailsScheduled: 0, emailsFailed: 0 },
    wave2: { tweetScheduled: false, emailsScheduled: 0, emailsFailed: 0 },
  };

  // --- Schedule tweets via Typefully ---
  try {
    await createTweet(WAVE_1_TWEET, wave1At, "Promo Wave 1 — Spring 2026");
    stats.wave1.tweetScheduled = true;
  } catch (err) {
    console.error("Wave 1 tweet scheduling failed:", err);
  }

  try {
    await createTweet(WAVE_2_TWEET, wave2At, "Promo Wave 2 — Spring 2026");
    stats.wave2.tweetScheduled = true;
  } catch (err) {
    console.error("Wave 2 tweet scheduling failed:", err);
  }

  // --- Schedule emails via Resend scheduledAt ---
  const recipients = await getRecipientEmails();
  const promo = buildPromoEmail();
  const followUp = buildPromoFollowUpEmail();

  for (const email of recipients) {
    try {
      const r1 = await sendEmail({
        to: email,
        subject: promo.subject,
        html: promo.html,
        scheduledAt: wave1At,
      });
      if (r1.success) stats.wave1.emailsScheduled++;
      else stats.wave1.emailsFailed++;
    } catch {
      stats.wave1.emailsFailed++;
    }

    try {
      const r2 = await sendEmail({
        to: email,
        subject: followUp.subject,
        html: followUp.html,
        scheduledAt: wave2At,
      });
      if (r2.success) stats.wave2.emailsScheduled++;
      else stats.wave2.emailsFailed++;
    } catch {
      stats.wave2.emailsFailed++;
    }

    await new Promise((r) => setTimeout(r, 150));
  }

  return NextResponse.json({
    message: "Promo campaign scheduled",
    totalRecipients: recipients.length,
    wave1: { scheduledFor: wave1At, ...stats.wave1 },
    wave2: { scheduledFor: wave2At, ...stats.wave2 },
  });
}
