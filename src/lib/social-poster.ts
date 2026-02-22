import { createServiceClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/sms";
import { generateTweetContent, generateWeeklyThread } from "@/lib/content-generator";

interface IndicatorSnapshot {
  name: string;
  slug: string;
  latest_value: string;
  status: string;
  signal: string;
  signal_emoji: string;
}

function getOwnerPhone(): string {
  const phone = process.env.OWNER_PHONE_NUMBER;
  if (!phone) throw new Error("OWNER_PHONE_NUMBER not configured");
  return phone;
}

async function logSocialPost(
  postType: string,
  content: string,
  status: string,
  error?: string,
  blogPostId?: string
) {
  try {
    const supabase = createServiceClient();
    await supabase.from("social_posts").insert({
      platform: "twitter",
      post_type: postType,
      content: content.slice(0, 5000),
      external_id: null,
      blog_post_id: blogPostId || null,
      status,
      error: error || null,
      posted_at: status === "posted" ? new Date().toISOString() : null,
    });
  } catch (err) {
    console.error("Failed to log social post:", err);
  }
}

async function smsToOwner(label: string, content: string): Promise<boolean> {
  try {
    const phone = getOwnerPhone();
    const trimmed = content.length > 280 ? content.slice(0, 277) + "..." : content;
    const message = `[RP ${label}] ${trimmed}`;

    const result = await sendSMS(phone, message);
    return result.success;
  } catch (error) {
    console.error("SMS to owner failed:", error);
    return false;
  }
}

export async function postDailyBriefing(
  indicators: IndicatorSnapshot[]
): Promise<boolean> {
  try {
    const intro = await generateTweetContent(indicators);
    const indicatorLines = indicators
      .slice(0, 8)
      .map((i) => `${i.signal_emoji} ${i.name}: ${i.latest_value}`)
      .join("\n");

    const tweet = `${intro}\n\n${indicatorLines}\n\nFull dashboard: recessionpulse.com`;
    const finalTweet = tweet.length > 280 ? tweet.slice(0, 277) + "..." : tweet;

    const sent = await smsToOwner("Daily Tweet", finalTweet);

    await logSocialPost(
      "daily_briefing",
      finalTweet,
      sent ? "posted" : "failed"
    );

    return sent;
  } catch (error) {
    console.error("Daily briefing SMS failed:", error);
    return false;
  }
}

export async function postStatusChangeAlert(
  indicator: IndicatorSnapshot,
  previousStatus: string
): Promise<boolean> {
  try {
    const tweet = `${indicator.signal_emoji} ${indicator.name} just moved from ${previousStatus.toUpperCase()} to ${indicator.status.toUpperCase()}

Current value: ${indicator.latest_value}
${indicator.signal}

Track all indicators: recessionpulse.com/indicators/${indicator.slug}`;

    const finalTweet = tweet.length > 280 ? tweet.slice(0, 277) + "..." : tweet;
    const sent = await smsToOwner("Status Alert", finalTweet);

    await logSocialPost(
      "status_change",
      finalTweet,
      sent ? "posted" : "failed"
    );

    return sent;
  } catch (error) {
    console.error("Status change SMS failed:", error);
    return false;
  }
}

export async function postWeeklyThreadFromIndicators(
  indicators: IndicatorSnapshot[]
): Promise<boolean> {
  try {
    const tweets = await generateWeeklyThread(indicators);
    if (tweets.length === 0) return false;

    const threadContent = tweets
      .map((t, i) => `Tweet ${i + 1}/${tweets.length}:\n${t}`)
      .join("\n\n---\n\n");

    const sent = await smsToOwner("Weekly Thread", threadContent);

    await logSocialPost(
      "weekly_thread",
      threadContent,
      sent ? "posted" : "failed"
    );

    return sent;
  } catch (error) {
    console.error("Weekly thread SMS failed:", error);
    return false;
  }
}

export async function postBlogPromo(
  title: string,
  slug: string,
  excerpt: string,
  blogPostId?: string
): Promise<boolean> {
  try {
    const tweet = `New analysis: ${title}

${excerpt.slice(0, 150)}${excerpt.length > 150 ? "..." : ""}

Read: recessionpulse.com/blog/${slug}`;

    const finalTweet = tweet.length > 280 ? tweet.slice(0, 277) + "..." : tweet;
    const sent = await smsToOwner("Blog Promo", finalTweet);

    await logSocialPost(
      "blog_promo",
      finalTweet,
      sent ? "posted" : "failed",
      undefined,
      blogPostId
    );

    return sent;
  } catch (error) {
    console.error("Blog promo SMS failed:", error);
    return false;
  }
}
