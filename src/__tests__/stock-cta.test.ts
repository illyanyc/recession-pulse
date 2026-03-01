import { describe, it, expect, beforeAll } from "vitest";

const readSource = async (relPath: string) => {
  const { readFileSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  return readFileSync(resolve(relPath), "utf-8");
};

describe("post-cta route", () => {
  let source: string;
  
  beforeAll(async () => {
    source = await readSource("src/app/api/cron/post-cta/route.ts");
  });

  it("should query stock_signals (not stock_screens)", () => {
    expect(source).toContain('.from("stock_signals")');
    expect(source).not.toContain('.from("stock_screens")');
  });

  it("should use correct column names", () => {
    expect(source).toContain("company_name");
    expect(source).toContain("forward_pe");
    expect(source).toContain("rsi_14");
  });

  it("should order by screened_at", () => {
    expect(source).toContain('"screened_at"');
  });
});

describe("analyze-risk route", () => {
  let source: string;

  beforeAll(async () => {
    source = await readSource("src/app/api/cron/analyze-risk/route.ts");
  });

  it("should use forward_pe (not pe_ratio) for stock signals", () => {
    expect(source).toContain("forward_pe");
    expect(source).not.toContain("pe_ratio");
  });

  it("should have maxDuration set", () => {
    expect(source).toContain("export const maxDuration");
  });
});

describe("risk-assessment-agent", () => {
  let source: string;

  beforeAll(async () => {
    source = await readSource("src/lib/risk-assessment-agent.ts");
  });

  it("should use forward_pe (not pe_ratio) in interface and logic", () => {
    expect(source).toContain("forward_pe");
    expect(source).not.toContain("pe_ratio");
  });
});
