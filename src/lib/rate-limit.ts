import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

const limiters = {
  contact: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "rl:contact",
  }),
  newsletter: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "rl:newsletter",
  }),
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:api",
  }),
};

export type RateLimitBucket = keyof typeof limiters;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function rateLimit(
  request: Request,
  bucket: RateLimitBucket = "api"
): Promise<{ success: boolean; response?: NextResponse }> {
  try {
    const ip = getClientIp(request);
    const { success, limit, remaining, reset } = await limiters[bucket].limit(ip);

    if (!success) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": String(remaining),
              "X-RateLimit-Reset": String(reset),
              "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
            },
          }
        ),
      };
    }

    return { success: true };
  } catch {
    return { success: true };
  }
}
