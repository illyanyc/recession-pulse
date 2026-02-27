import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatRecessionSMS, formatStockAlertSMS } from "@/lib/message-formatter";
import type { RecessionIndicator, IndicatorWithTrend } from "@/types";

const BASE_INDICATOR: RecessionIndicator = {
  id: "1",
  name: "Sahm Rule",
  slug: "sahm-rule",
  latest_value: "0.50%",
  status: "watch",
  status_text: "Watch",
  signal: "Approaching threshold",
  signal_emoji: "🟡",
  category: "primary",
  trigger_level: "0.50%",
  updated_at: "2026-02-24T00:00:00Z",
};

function makeIndicator(overrides: Partial<RecessionIndicator>): RecessionIndicator {
  return { ...BASE_INDICATOR, ...overrides };
}

function makeIndicatorWithTrend(
  overrides: Partial<RecessionIndicator>,
  trendOverrides: Partial<IndicatorWithTrend["trend"]> = {}
): IndicatorWithTrend {
  return {
    ...BASE_INDICATOR,
    ...overrides,
    trend: {
      slug: overrides.slug || BASE_INDICATOR.slug,
      direction_1d: "flat",
      direction_7d: "flat",
      value_change_1d: null,
      value_change_7d: null,
      pct_change_1d: null,
      pct_change_7d: null,
      status_changed_1d: false,
      status_changed_7d: false,
      prev_status_1d: null,
      prev_status_7d: null,
      ...trendOverrides,
    },
  };
}

describe("formatRecessionSMS spacing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-24T12:00:00Z"));
  });

  it("has blank line before ALERTS section", () => {
    const indicators = [
      makeIndicator({ name: "Copper/Gold", slug: "copper-gold", status: "warning", signal: "Below crisis level" }),
      makeIndicator({ name: "ISM PMI", slug: "ism-pmi", status: "safe", signal: "Above 50" }),
    ];
    const sms = formatRecessionSMS(indicators);
    expect(sms).toContain("\n\nALERTS:");
  });

  it("has blank line before WATCHING section", () => {
    const indicators = [
      makeIndicator({ name: "Sahm Rule", slug: "sahm-rule", status: "watch", signal: "Near threshold" }),
      makeIndicator({ name: "ISM PMI", slug: "ism-pmi", status: "safe", signal: "Above 50" }),
    ];
    const sms = formatRecessionSMS(indicators);
    expect(sms).toContain("\n\nWATCHING:");
  });

  it("has blank line before score bar", () => {
    const indicators = [
      makeIndicator({ name: "ISM PMI", slug: "ism-pmi", status: "safe", signal: "Above 50" }),
    ];
    const sms = formatRecessionSMS(indicators);
    expect(sms).toMatch(/\n\n\d+ safe \/ \d+ watch \/ \d+ alert/);
  });

  it("has blank line before dashboard link", () => {
    const indicators = [
      makeIndicator({ name: "ISM PMI", slug: "ism-pmi", status: "safe", signal: "Above 50" }),
    ];
    const sms = formatRecessionSMS(indicators);
    expect(sms).toContain("\n\nrecessionpulse.com/dashboard");
  });

  it("has spaces in score bar (safe / watch / alert)", () => {
    const indicators = [
      makeIndicator({ name: "A", slug: "a", status: "safe", signal: "OK" }),
      makeIndicator({ name: "B", slug: "b", status: "watch", signal: "Hmm" }),
      makeIndicator({ name: "C", slug: "c", status: "warning", signal: "Bad" }),
    ];
    const sms = formatRecessionSMS(indicators);
    expect(sms).toContain("1 safe / 1 watch / 1 alert");
  });

  it("has blank line before CHANGES section with trends", () => {
    const indicators = [
      makeIndicatorWithTrend(
        { name: "Sahm Rule", slug: "sahm-rule", status: "warning", signal: "Triggered" },
        { status_changed_1d: true, prev_status_1d: "watch" }
      ),
    ];
    const sms = formatRecessionSMS(indicators);
    expect(sms).toContain("\n\nCHANGES:");
  });

  it("full SMS has proper section spacing", () => {
    const indicators = [
      makeIndicatorWithTrend(
        { name: "Sahm Rule", slug: "sahm-rule", status: "warning", signal: "Triggered at 0.50%" },
        { status_changed_1d: true, prev_status_1d: "watch" }
      ),
      makeIndicatorWithTrend(
        { name: "ISM PMI", slug: "ism-pmi", status: "watch", signal: "Below 50" },
        {}
      ),
      makeIndicatorWithTrend(
        { name: "VIX", slug: "vix", status: "safe", signal: "Normal range" },
        {}
      ),
    ];
    const sms = formatRecessionSMS(indicators);
    const sections = sms.split("\n\n");
    expect(sections.length).toBeGreaterThanOrEqual(5);
    expect(sections[0]).toContain("RECESSION PULSE");
    expect(sms).toContain("\n\nCHANGES:");
    expect(sms).toContain("\n\nALERTS:");
    expect(sms).toContain("\n\nWATCHING:");
    expect(sms).toContain("\n\nrecessionpulse.com/dashboard");
  });
});
