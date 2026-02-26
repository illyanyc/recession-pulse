import { describe, it, expect, vi, beforeEach } from "vitest";

const MOCK_INDICATORS = [
  { name: "Sahm Rule", slug: "sahm-rule", latest_value: "0.43%", status: "watch", signal: "Below threshold", signal_emoji: "🟡" },
  { name: "Yield Curve 2s10s", slug: "yield-curve-2s10s", latest_value: "-0.12%", status: "warning", signal: "Inverted", signal_emoji: "🔴" },
  { name: "ISM Manufacturing PMI", slug: "ism-pmi", latest_value: "49.2", status: "watch", signal: "Below 50", signal_emoji: "🟡" },
];

const MOCK_HISTORY = [
  { slug: "sahm-rule", name: "Sahm Rule", latest_value: "0.40%", status: "watch", signal: "Below threshold", reading_date: "2026-02-17" },
  { slug: "sahm-rule", name: "Sahm Rule", latest_value: "0.43%", status: "watch", signal: "Below threshold", reading_date: "2026-02-24" },
  { slug: "yield-curve-2s10s", name: "Yield Curve 2s10s", latest_value: "-0.15%", status: "warning", signal: "Inverted", reading_date: "2026-02-17" },
  { slug: "yield-curve-2s10s", name: "Yield Curve 2s10s", latest_value: "-0.12%", status: "warning", signal: "Inverted", reading_date: "2026-02-24" },
];

const MOCK_ASSESSMENT = {
  score: 42,
  risk_level: "elevated",
  summary: "Multiple indicators suggest elevated recession risk with yield curve inversion persisting.",
  key_factors: ["Yield curve inverted", "ISM PMI below 50", "Sahm Rule approaching threshold"],
  outlook: "Watch for labor market deterioration in the coming weeks.",
};

const mockResponsesCreate = vi.fn().mockResolvedValue({
  output: [
    {
      type: "message",
      content: [
        {
          type: "output_text",
          text: "## Recession Risk Score: 42/100 — ELEVATED\n\nThe US economy shows elevated recession risk...",
          annotations: [{ type: "url_citation", url: "https://example.com/fed-news" }],
        },
      ],
    },
  ],
});

const mockChatCreate = vi.fn().mockResolvedValue({
  choices: [{ message: { content: "Weekly report content here..." } }],
});

vi.mock("openai", () => {
  class MockOpenAI {
    responses = { create: mockResponsesCreate };
    chat = { completions: { create: mockChatCreate } };
  }
  return { default: MockOpenAI };
});

describe("generateRiskBlogPost", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    mockResponsesCreate.mockClear();
  });

  it("produces correct slug format from date label", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    const article = await generateRiskBlogPost(
      MOCK_INDICATORS,
      MOCK_ASSESSMENT,
      "February 24, 2026"
    );

    expect(article.slug).toBe("daily-recession-risk-february-24-2026");
  });

  it("includes score in the title", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    const article = await generateRiskBlogPost(
      MOCK_INDICATORS,
      MOCK_ASSESSMENT,
      "February 24, 2026"
    );

    expect(article.title).toContain("42/100");
    expect(article.title).toContain("February 24, 2026");
  });

  it("uses assessment summary as excerpt", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    const article = await generateRiskBlogPost(
      MOCK_INDICATORS,
      MOCK_ASSESSMENT,
      "February 24, 2026"
    );

    expect(article.excerpt).toBe(MOCK_ASSESSMENT.summary);
  });

  it("generates content from model response", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    const article = await generateRiskBlogPost(
      MOCK_INDICATORS,
      MOCK_ASSESSMENT,
      "February 24, 2026"
    );

    expect(article.content).toContain("Recession Risk Score");
  });

  it("includes recession-related SEO keywords", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    const article = await generateRiskBlogPost(
      MOCK_INDICATORS,
      MOCK_ASSESSMENT,
      "February 24, 2026"
    );

    expect(article.keywords).toContain("recession risk today");
    expect(article.keywords).toContain("daily recession assessment");
  });

  it("accepts optional history parameter without error", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    const article = await generateRiskBlogPost(
      MOCK_INDICATORS,
      MOCK_ASSESSMENT,
      "February 24, 2026",
      MOCK_HISTORY
    );

    expect(article.slug).toBe("daily-recession-risk-february-24-2026");
    expect(article.content.length).toBeGreaterThan(0);
  });

  it("caps meta_description at 160 characters", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    const article = await generateRiskBlogPost(
      MOCK_INDICATORS,
      MOCK_ASSESSMENT,
      "February 24, 2026"
    );

    expect(article.meta_description.length).toBeLessThanOrEqual(160);
  });
});

describe("generateWeeklyReport", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    mockResponsesCreate.mockClear();
    mockChatCreate.mockClear();
  });

  it("produces correct slug format from week date", async () => {
    const { generateWeeklyReport } = await import("@/lib/content-generator");
    const article = await generateWeeklyReport(MOCK_INDICATORS, "February 24, 2026");

    expect(article.slug).toBe("weekly-recession-report-february-24-2026");
  });

  it("includes week date in the title", async () => {
    const { generateWeeklyReport } = await import("@/lib/content-generator");
    const article = await generateWeeklyReport(MOCK_INDICATORS, "February 24, 2026");

    expect(article.title).toContain("February 24, 2026");
    expect(article.title).toContain("Weekly Recession Report");
  });

  it("includes recession-related keywords", async () => {
    const { generateWeeklyReport } = await import("@/lib/content-generator");
    const article = await generateWeeklyReport(MOCK_INDICATORS, "February 24, 2026");

    expect(article.keywords).toContain("recession report");
    expect(article.keywords).toContain("weekly recession update");
  });
});

describe("TYPE_LABELS coverage", () => {
  it("blog index page includes daily_risk_assessment label", async () => {
    const TYPE_LABELS: Record<string, string> = {
      daily_risk_assessment: "Daily Risk Assessment",
      weekly_report: "Weekly Report",
      deep_dive: "Deep Dive",
      market_commentary: "Market Commentary",
    };

    expect(TYPE_LABELS["daily_risk_assessment"]).toBe("Daily Risk Assessment");
    expect(TYPE_LABELS["weekly_report"]).toBe("Weekly Report");
  });
});

describe("content-generator uses gpt-5.2", () => {
  beforeEach(() => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    mockResponsesCreate.mockClear();
    mockChatCreate.mockClear();
  });

  it("generateRiskBlogPost calls responses.create with gpt-5.2", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    await generateRiskBlogPost(MOCK_INDICATORS, MOCK_ASSESSMENT, "February 24, 2026");

    expect(mockResponsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-5.2" })
    );
  });

  it("generateWeeklyReport calls responses.create with gpt-5.2", async () => {
    const { generateWeeklyReport } = await import("@/lib/content-generator");
    await generateWeeklyReport(MOCK_INDICATORS, "February 24, 2026");

    expect(mockResponsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-5.2" })
    );
  });

  it("generateRiskBlogPost includes web_search tool", async () => {
    const { generateRiskBlogPost } = await import("@/lib/content-generator");
    await generateRiskBlogPost(MOCK_INDICATORS, MOCK_ASSESSMENT, "February 24, 2026");

    expect(mockResponsesCreate).toHaveBeenCalledWith(
      expect.objectContaining({ tools: [{ type: "web_search" }] })
    );
  });
});
