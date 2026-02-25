import { NextResponse } from "next/server";

/**
 * Vercel cron jobs automatically send `Authorization: Bearer <CRON_SECRET>` when
 * the CRON_SECRET env var is configured. Internal calls (e.g. from /api/dashboard/refresh)
 * pass the secret as a query param instead. This helper accepts both.
 */
export function verifyCronAuth(request: Request): { authorized: boolean; response?: NextResponse } {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 }),
    };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true };
  }

  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  if (querySecret === cronSecret) {
    return { authorized: true };
  }

  return {
    authorized: false,
    response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
  };
}
