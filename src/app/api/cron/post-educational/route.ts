import { NextResponse } from "next/server";
import { generateEducationalPost, getEducationalTopic } from "@/lib/content-generator";
import { postMarketingTweet } from "@/lib/social-poster";
import { verifyCronAuth } from "@/lib/cron-auth";

// Runs at 17:00 UTC (12:00 PM ET) — midday educational content.
// Rotates through recession indicator explainers to build authority.
export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  try {
    const dayOfMonth = new Date().getDate();
    const topic = getEducationalTopic(dayOfMonth);

    const tweet = await generateEducationalPost(topic);
    if (!tweet) {
      return NextResponse.json({ message: "Empty content generated" });
    }

    const posted = await postMarketingTweet(tweet, "educational", "Educational");

    return NextResponse.json({
      message: posted ? "Educational tweet posted" : "Educational tweet failed",
      posted,
      topic: topic.topic,
    });
  } catch (error) {
    console.error("Educational cron error:", error);
    return NextResponse.json(
      { error: "Educational cron failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
