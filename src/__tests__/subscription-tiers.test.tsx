import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PLANS } from "@/types";
import { RecessionRiskBanner } from "@/components/dashboard/RecessionRiskBanner";

const mockAssessment = {
  id: "test-1",
  score: 42,
  risk_level: "moderate" as const,
  summary: "Economic indicators suggest moderate recession risk. Key factors include tightening credit conditions.",
  key_factors: ["Yield curve inverted", "ISM PMI declining"],
  outlook: "Watch closely for further deterioration",
  model: "gpt-4",
  assessment_date: "2026-02-24",
  created_at: "2026-02-24T00:00:00Z",
};

describe("PLANS tier definitions", () => {
  it("Free tier includes daily email briefing", () => {
    expect(PLANS.free.features).toContain("Daily email recession briefing");
  });

  it("Free tier shows 'Daily recession risk score' not 'Weekly'", () => {
    const hasWeekly = PLANS.free.features.some((f) => f.toLowerCase().includes("weekly"));
    expect(hasWeekly).toBe(false);
    expect(PLANS.free.features).toContain("Daily recession risk score");
  });

  it("Pulse tier includes AI recession risk assessment", () => {
    expect(PLANS.pulse.features).toContain("AI recession risk assessment");
  });

  it("Pulse tier includes SMS alerts", () => {
    expect(PLANS.pulse.features).toContain("Morning SMS with signal status");
  });

  it("Pulse Pro does NOT duplicate AI recession risk (it inherits from Pulse via 'Everything in Pulse')", () => {
    const hasAIRisk = PLANS.pulse_pro.features.some((f) =>
      f.toLowerCase().includes("ai recession risk")
    );
    expect(hasAIRisk).toBe(false);
    expect(PLANS.pulse_pro.features).toContain("Everything in Pulse");
  });

  it("Pulse Pro includes stock screener features", () => {
    expect(PLANS.pulse_pro.features).toContain("Daily stock screener alerts");
  });

  it("Free tier does NOT include SMS", () => {
    const hasSMS = PLANS.free.features.some((f) =>
      f.toLowerCase().includes("sms")
    );
    expect(hasSMS).toBe(false);
  });

  it("Free tier does NOT include AI risk assessment", () => {
    const hasAI = PLANS.free.features.some((f) =>
      f.toLowerCase().includes("ai recession risk")
    );
    expect(hasAI).toBe(false);
  });
});

describe("RecessionRiskBanner gating", () => {
  it("renders full content for subscribed users", () => {
    render(<RecessionRiskBanner assessment={mockAssessment} hasSubscription={true} />);
    expect(screen.getByText("Overall Recession Risk")).toBeInTheDocument();
    expect(screen.getByText(/Economic indicators suggest/)).toBeInTheDocument();
    expect(screen.queryByText("Upgrade to Pulse")).not.toBeInTheDocument();
  });

  it("renders locked state for free users", () => {
    render(<RecessionRiskBanner assessment={mockAssessment} hasSubscription={false} />);
    expect(screen.getByText("AI Recession Risk Assessment")).toBeInTheDocument();
    expect(screen.getByText(/Upgrade to Pulse/)).toBeInTheDocument();
  });

  it("renders nothing when assessment is null", () => {
    const { container } = render(<RecessionRiskBanner assessment={null} hasSubscription={true} />);
    expect(container.innerHTML).toBe("");
  });

  it("defaults to showing full content when hasSubscription is omitted", () => {
    render(<RecessionRiskBanner assessment={mockAssessment} />);
    expect(screen.getByText("Overall Recession Risk")).toBeInTheDocument();
    expect(screen.queryByText("Upgrade to Pulse")).not.toBeInTheDocument();
  });
});
