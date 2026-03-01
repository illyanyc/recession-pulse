import { describe, it, expect } from "vitest";
import { INDICATOR_DEFINITIONS } from "@/lib/constants";

describe("INDICATOR_DEFINITIONS", () => {
  it("should have at least 20 indicators", () => {
    expect(INDICATOR_DEFINITIONS.length).toBeGreaterThanOrEqual(20);
  });

  it("should have unique slugs", () => {
    const slugs = INDICATOR_DEFINITIONS.map((i) => i.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("should have valid categories", () => {
    const validCategories = [
      "primary", "secondary", "liquidity", "market",
      "housing", "business_activity", "credit_stress", "realtime",
    ];
    for (const ind of INDICATOR_DEFINITIONS) {
      expect(validCategories).toContain(ind.category);
    }
  });

  it("each indicator should have required fields", () => {
    for (const ind of INDICATOR_DEFINITIONS) {
      expect(ind.slug).toBeTruthy();
      expect(ind.name).toBeTruthy();
      expect(ind.category).toBeTruthy();
      // trigger_level may be undefined for some indicators
      expect(typeof ind.evaluate).toBe("function");
    }
  });

  it("evaluate functions should return valid status objects", () => {
    for (const ind of INDICATOR_DEFINITIONS) {
      const result = ind.evaluate(0);
      expect(result).toHaveProperty("status");
      expect(result).toHaveProperty("signal");
      expect(result).toHaveProperty("signal_emoji");
      expect(["safe", "watch", "warning", "danger"]).toContain(result.status);
    }
  });
});
