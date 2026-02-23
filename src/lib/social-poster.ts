import { createServiceClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/sms";
import { generateTweetContent, generateWeeklyThread } from "@/lib/content-generator";
import {
  postTweetNow,
  postThreadNow,
} from "@/lib/typefully-client";

export interface IndicatorSnapshot {
  name: string;
  slug: string;
  latest_value: string;
  status: string;
  signal: string;
  signal_emoji: string;
}

function isTypefullyConfigured(): boolean {
  return !!(process.env.TYPEFULLY_API_KEY && process.env.TYPEFULLY_SOCIAL_SET_ID);
}

async function notifyOwnerSMS(label: string, content: string): Promise<void> {
  try {
    const phone = process.env.OWNER_PHONE_NUMBER;
    if (!phone) return;
    const trimmed = content.length > 280 ? content.slice(0, 277) + "..." : content;
    await sendSMS(phone, `[RP ${label}] ${trimmed}`);
  } catch {
    // SMS notification is best-effort
  }
}

async function logSocialPost(
  postType: string,
  content: string,
  status: string,
  error?: string,
  blogPostId?: string,
  externalId?: string
) {
  try {
    const supabase = createServiceClient();
    await supabase.from("social_posts").insert({
      platform: "twitter",
      post_type: postType,
      content: content.slice(0, 5000),
      external_id: externalId || null,
      blog_post_id: blogPostId || null,
      status,
      error: error || null,
      posted_at: status === "posted" ? new Date().toISOString() : null,
    });
  } catch (err) {
    console.error("Failed to log social post:", err);
  }
}

/**
 * Post a single tweet via Typefully. Falls back to SMS if Typefully isn't configured.
 */
async function publishTweet(
  text: string,
  label: string,
  postType: string,
  blogPostId?: string
): Promise<boolean> {
  const finalTweet = text.length > 280 ? text.slice(0, 277) + "..." : text;

  if (!isTypefullyConfigured()) {
    await notifyOwnerSMS(label, finalTweet);
    await logSocialPost(postType, finalTweet, "sent_sms", undefined, blogPostId);
    return true;
  }

  try {
    const res = await postTweetNow(finalTweet, `RP ${label}`);
    await logSocialPost(
      postType,
      finalTweet,
      "posted",
      undefined,
      blogPostId,
      String(res.id)
    );
    await notifyOwnerSMS(label, `[Posted] ${finalTweet}`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    console.error(`Typefully post failed (${label}):`, message);
    await logSocialPost(postType, finalTweet, "failed", message, blogPostId);
    await notifyOwnerSMS(label, `[FAILED] ${finalTweet}`);
    return false;
  }
}

/**
 * Post a thread via Typefully. Falls back to SMS if Typefully isn't configured.
 */
async function publishThread(
  tweets: string[],
  label: string,
  postType: string
): Promise<boolean> {
  const threadContent = tweets
    .map((t, i) => `Tweet ${i + 1}/${tweets.length}:\n${t}`)
    .join("\n\n---\n\n");

  if (!isTypefullyConfigured()) {
    await notifyOwnerSMS(label, threadContent);
    await logSocialPost(postType, threadContent, "sent_sms");
    return true;
  }

  try {
    const res = await postThreadNow(tweets, `RP ${label}`);
    await logSocialPost(postType, threadContent, "posted", undefined, undefined, String(res.id));
    await notifyOwnerSMS(label, `[Posted thread] ${tweets[0]?.slice(0, 100)}...`);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown";
    console.error(`Typefully thread failed (${label}):`, message);
    await logSocialPost(postType, threadContent, "failed", message);
    await notifyOwnerSMS(label, `[FAILED thread] ${tweets[0]?.slice(0, 100)}...`);
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
    return await publishTweet(tweet, "Daily Tweet", "daily_briefing");
  } catch (error) {
    console.error("Daily briefing failed:", error);
    return false;
  }
}

export async function postStatusChangeAlert(
  indicator: IndicatorSnapshot,
  previousStatus: string
): Promise<boolean> {
  try {
    const tweet = `${indicator.signal_emoji} ${indicator.name} just flipped from ${previousStatus.toUpperCase()} to ${indicator.status.toUpperCase()}.

Current reading: ${indicator.latest_value}
${indicator.signal}

I track this daily: recessionpulse.com/indicators/${indicator.slug}`;

    return await publishTweet(tweet, "Status Alert", "status_change");
  } catch (error) {
    console.error("Status change alert failed:", error);
    return false;
  }
}

export async function postWeeklyThreadFromIndicators(
  indicators: IndicatorSnapshot[]
): Promise<boolean> {
  try {
    const tweets = await generateWeeklyThread(indicators);
    if (tweets.length === 0) return false;
    return await publishThread(tweets, "Weekly Thread", "weekly_thread");
  } catch (error) {
    console.error("Weekly thread failed:", error);
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
    const tweet = `New write-up: ${title}

${excerpt.slice(0, 150)}${excerpt.length > 150 ? "..." : ""}

recessionpulse.com/blog/${slug}`;

    return await publishTweet(tweet, "Blog Promo", "blog_promo", blogPostId);
  } catch (error) {
    console.error("Blog promo failed:", error);
    return false;
  }
}

/**
 * Post a single marketing tweet (used by new cron jobs for varied content).
 */
export async function postMarketingTweet(
  text: string,
  postType: string,
  label: string
): Promise<boolean> {
  try {
    return await publishTweet(text, label, postType);
  } catch (error) {
    console.error(`Marketing tweet failed (${label}):`, error);
    return false;
  }
}
