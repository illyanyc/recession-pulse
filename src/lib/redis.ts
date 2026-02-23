import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error("Redis not configured");
    }
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

const TTL_24H = 60 * 60 * 24;

export async function setUserIndicators(userId: string, data: unknown): Promise<void> {
  try {
    await getRedis().set(`user:${userId}:indicators`, JSON.stringify(data), { ex: TTL_24H });
  } catch (err) {
    console.warn("Redis setUserIndicators failed:", err instanceof Error ? err.message : err);
  }
}

export async function getUserIndicators(userId: string): Promise<unknown | null> {
  try {
    const raw = await getRedis().get<string>(`user:${userId}:indicators`);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn("Redis getUserIndicators failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function setUserSummary(userId: string, slug: string, summary: string): Promise<void> {
  try {
    await getRedis().set(`user:${userId}:summary:${slug}`, summary, { ex: TTL_24H });
  } catch (err) {
    console.warn("Redis setUserSummary failed:", err instanceof Error ? err.message : err);
  }
}

export async function getUserSummary(userId: string, slug: string): Promise<string | null> {
  try {
    return await getRedis().get<string>(`user:${userId}:summary:${slug}`);
  } catch (err) {
    console.warn("Redis getUserSummary failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function setGlobalSummary(slug: string, summary: string): Promise<void> {
  try {
    await getRedis().set(`global:summary:${slug}`, summary, { ex: TTL_24H });
  } catch (err) {
    console.warn("Redis setGlobalSummary failed:", err instanceof Error ? err.message : err);
  }
}

export async function getGlobalSummary(slug: string): Promise<string | null> {
  try {
    return await getRedis().get<string>(`global:summary:${slug}`);
  } catch (err) {
    console.warn("Redis getGlobalSummary failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function setRiskAssessment(data: unknown): Promise<void> {
  try {
    await getRedis().set("global:risk-assessment", JSON.stringify(data), { ex: TTL_24H });
  } catch (err) {
    console.warn("Redis setRiskAssessment failed:", err instanceof Error ? err.message : err);
  }
}

export async function getRiskAssessment(): Promise<unknown | null> {
  try {
    const raw = await getRedis().get<string>("global:risk-assessment");
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn("Redis getRiskAssessment failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

// --- Per-user stock signals cache ---

export async function setUserStockSignals(userId: string, signals: unknown[]): Promise<void> {
  try {
    await getRedis().set(`user:${userId}:stocks`, JSON.stringify(signals), { ex: TTL_24H });
  } catch (err) {
    console.warn("Redis setUserStockSignals failed:", err instanceof Error ? err.message : err);
  }
}

export async function getUserStockSignals(userId: string): Promise<unknown[] | null> {
  try {
    const raw = await getRedis().get<string>(`user:${userId}:stocks`);
    if (!raw) return null;
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : null;
  } catch (err) {
    console.warn("Redis getUserStockSignals failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

// --- Refresh status tracking ---

export interface RefreshStatus {
  status: "idle" | "processing" | "success" | "failed";
  step?: "indicators" | "stocks" | "risk" | "summaries" | "caching";
  message?: string;
  indicators?: { success: number; failed: number };
  stocks?: { found: number; tickers: string[] };
  risk?: { score: number; risk_level: string };
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

const REFRESH_TTL = 300; // 5 minutes

export async function setRefreshStatus(userId: string, status: RefreshStatus): Promise<void> {
  try {
    await getRedis().set(`refresh:${userId}`, JSON.stringify(status), { ex: REFRESH_TTL });
  } catch (err) {
    console.warn("Redis setRefreshStatus failed:", err instanceof Error ? err.message : err);
  }
}

export async function getRefreshStatus(userId: string): Promise<RefreshStatus | null> {
  try {
    const raw = await getRedis().get<string>(`refresh:${userId}`);
    if (!raw) return null;
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (err) {
    console.warn("Redis getRefreshStatus failed:", err instanceof Error ? err.message : err);
    return null;
  }
}
