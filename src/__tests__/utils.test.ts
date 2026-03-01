import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatNumber, timeAgo } from "@/lib/utils";

describe("cn (class name merger)", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("should handle undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("should merge tailwind conflicts", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });
});

describe("formatCurrency", () => {
  it("should format USD values", () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain("1,234");
  });

  it("should handle zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });
});

describe("formatNumber", () => {
  it("should format large numbers with commas", () => {
    expect(formatNumber(1234567)).toBe("1,234,567.00");
  });

  it("should handle small numbers", () => {
    expect(formatNumber(42)).toBe("42.00");
  });

  it("should handle decimals", () => {
    const result = formatNumber(3.14);
    expect(result).toBe("3.14");
  });
});

describe("timeAgo", () => {
  it("should return 'just now' for recent dates", () => {
    const result = timeAgo(new Date().toISOString());
    expect(result).toMatch(/just now|seconds? ago|1m ago/i);
  });

  it("should return hours ago for past hours", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(twoHoursAgo);
    expect(result).toMatch(/2h ago/i);
  });

  it("should return days ago for past days", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const result = timeAgo(threeDaysAgo);
    expect(result).toMatch(/3d ago/i);
  });
});
