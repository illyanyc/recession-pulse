import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

vi.mock("@/lib/sms", () => ({
  sendSMS: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/content-generator", () => ({
  generateTweetContent: vi.fn().mockResolvedValue("Test tweet content 🚀"),
  generateWeeklyThread: vi.fn().mockResolvedValue(["Tweet 1", "Tweet 2"]),
}));

vi.mock("@/lib/typefully-client", () => ({
  postTweetNow: vi.fn().mockResolvedValue({ id: "123" }),
  postThreadNow: vi.fn().mockResolvedValue({ id: "456" }),
}));

describe("social-poster", () => {
  beforeEach(() => {
    vi.stubEnv("TYPEFULLY_API_KEY", "");
    vi.stubEnv("TYPEFULLY_SOCIAL_SET_ID", "");
    vi.stubEnv("OWNER_PHONE_NUMBER", "+10000000000");
  });

  it("should post daily briefing via SMS fallback", async () => {
    const { postDailyBriefing } = await import("@/lib/social-poster");
    const indicators = [
      {
        name: "Test Indicator",
        slug: "test",
        latest_value: "1.5%",
        status: "safe",
        signal: "All clear",
        signal_emoji: "✅",
      },
    ];

    const result = await postDailyBriefing(indicators);
    expect(result).toBe(true);
  });

  it("should export postMarketingTweet", async () => {
    const { postMarketingTweet } = await import("@/lib/social-poster");
    expect(typeof postMarketingTweet).toBe("function");
  });

  it("should export postBlogPromo", async () => {
    const { postBlogPromo } = await import("@/lib/social-poster");
    expect(typeof postBlogPromo).toBe("function");
  });

  it("source should not contain 'sent_sms' as status value", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/lib/social-poster.ts", "utf-8");
    expect(source).not.toContain('"sent_sms"');
  });
});
