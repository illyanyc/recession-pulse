import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend";
import { buildFeatureAnnouncementEmail } from "@/lib/email-templates";
import { postMarketingTweet } from "@/lib/social-poster";
import { verifyCronAuth } from "@/lib/cron-auth";

const TWEET_TEXT = `New feature: your daily RecessionPulse email now includes the full AI risk analysis with a direct link to the blog post — right above the indicator table.

Every morning you get the recession risk score, key factors, and a deep-dive write-up delivered to your inbox.

recessionpulse.com`;

export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const { searchParams } = new URL(request.url);
  const channel = searchParams.get("channel") || "preview";

  if (channel === "preview") {
    const { subject, html } = buildFeatureAnnouncementEmail();
    return NextResponse.json({
      message: "Preview mode — no messages sent",
      tweet: TWEET_TEXT,
      email: { subject, htmlLength: html.length },
    });
  }

  const stats = { tweet: false, emailsSent: 0, emailsFailed: 0, totalRecipients: 0 };

  if (channel === "tweet" || channel === "both") {
    stats.tweet = await postMarketingTweet(
      TWEET_TEXT,
      "manual",
      "Feature Announcement"
    );
  }

  if (channel === "email" || channel === "both") {
    const supabase = createServiceClient();
    const { subject, html } = buildFeatureAnnouncementEmail();

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

    const recipients = Array.from(emailSet);
    stats.totalRecipients = recipients.length;

    for (const email of recipients) {
      try {
        const result = await sendEmail({ to: email, subject, html });
        if (result.success) {
          stats.emailsSent++;
        } else {
          stats.emailsFailed++;
          console.error(`Announcement email failed for ${email}:`, result.error);
        }
      } catch (err) {
        stats.emailsFailed++;
        console.error(`Announcement email error for ${email}:`, err);
      }

      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return NextResponse.json({
    message: "Feature announcement sent",
    channel,
    stats,
  });
}
