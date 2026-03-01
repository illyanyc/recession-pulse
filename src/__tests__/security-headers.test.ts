import { describe, it, expect } from "vitest";

// Read vercel.json synchronously at module level — use a dynamic import trick
// to avoid `fs` resolution issues in happy-dom environment.
const config = await (async () => {
  const { readFileSync } = await import("node:fs");
  return JSON.parse(readFileSync("vercel.json", "utf-8"));
})();

describe("vercel.json security headers", () => {
  it("should have headers config", () => {
    expect(config.headers).toBeDefined();
    expect(Array.isArray(config.headers)).toBe(true);
    expect(config.headers.length).toBeGreaterThan(0);
  });

  it("should have catch-all source", () => {
    const catchAll = config.headers.find((h: { source: string }) => h.source === "/(.*)");
    expect(catchAll).toBeDefined();
  });

  it("should include X-Frame-Options", () => {
    const catchAll = config.headers.find((h: { source: string }) => h.source === "/(.*)");
    const header = catchAll.headers.find((h: { key: string }) => h.key === "X-Frame-Options");
    expect(header).toBeDefined();
    expect(header.value).toBe("SAMEORIGIN");
  });

  it("should include X-Content-Type-Options", () => {
    const catchAll = config.headers.find((h: { source: string }) => h.source === "/(.*)");
    const header = catchAll.headers.find((h: { key: string }) => h.key === "X-Content-Type-Options");
    expect(header).toBeDefined();
    expect(header.value).toBe("nosniff");
  });

  it("should include Strict-Transport-Security", () => {
    const catchAll = config.headers.find((h: { source: string }) => h.source === "/(.*)");
    const header = catchAll.headers.find((h: { key: string }) => h.key === "Strict-Transport-Security");
    expect(header).toBeDefined();
    expect(header.value).toContain("max-age=");
  });

  it("should include Referrer-Policy", () => {
    const catchAll = config.headers.find((h: { source: string }) => h.source === "/(.*)");
    const header = catchAll.headers.find((h: { key: string }) => h.key === "Referrer-Policy");
    expect(header).toBeDefined();
  });

  it("should include Permissions-Policy", () => {
    const catchAll = config.headers.find((h: { source: string }) => h.source === "/(.*)");
    const header = catchAll.headers.find((h: { key: string }) => h.key === "Permissions-Policy");
    expect(header).toBeDefined();
    expect(header.value).toContain("camera=()");
  });

  it("should have crons defined", () => {
    expect(config.crons).toBeDefined();
    expect(config.crons.length).toBeGreaterThan(0);
  });
});
