import { describe, it, expect, vi, beforeEach } from "vitest";

describe("verifyCronAuth", () => {
  const CRON_SECRET = "test-cron-secret-123";

  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", CRON_SECRET);
  });

  it("should authorize with valid Bearer token", async () => {
    const { verifyCronAuth } = await import("@/lib/cron-auth");
    const request = new Request("http://localhost/api/cron/test", {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    });
    const { authorized } = verifyCronAuth(request);
    expect(authorized).toBe(true);
  });

  it("should authorize with valid query string secret", async () => {
    const { verifyCronAuth } = await import("@/lib/cron-auth");
    const request = new Request(`http://localhost/api/cron/test?secret=${CRON_SECRET}`);
    const { authorized } = verifyCronAuth(request);
    expect(authorized).toBe(true);
  });

  it("should reject with no auth", async () => {
    const { verifyCronAuth } = await import("@/lib/cron-auth");
    const request = new Request("http://localhost/api/cron/test");
    const { authorized, response } = verifyCronAuth(request);
    expect(authorized).toBe(false);
    expect(response).toBeDefined();
  });

  it("should reject with wrong token", async () => {
    const { verifyCronAuth } = await import("@/lib/cron-auth");
    const request = new Request("http://localhost/api/cron/test", {
      headers: { Authorization: "Bearer wrong-secret" },
    });
    const { authorized } = verifyCronAuth(request);
    expect(authorized).toBe(false);
  });
});
