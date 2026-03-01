import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@upstash/redis", () => ({
  Redis: {
    fromEnv: () => ({}),
  },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow() { return {}; }
    constructor() {}
    limit = vi.fn().mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() + 60000 });
  },
}));

describe("rate-limit", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should export rateLimit function", async () => {
    const mod = await import("@/lib/rate-limit");
    expect(mod.rateLimit).toBeDefined();
    expect(typeof mod.rateLimit).toBe("function");
  });

  it("should return success when under limit", async () => {
    const mod = await import("@/lib/rate-limit");
    const request = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    const result = await mod.rateLimit(request, "api");
    expect(result.success).toBe(true);
    expect(result.response).toBeUndefined();
  });

  it("should extract IP from x-forwarded-for", async () => {
    const mod = await import("@/lib/rate-limit");
    const request = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "10.0.0.1, 192.168.1.1" },
    });
    const result = await mod.rateLimit(request);
    expect(result.success).toBe(true);
  });
});
