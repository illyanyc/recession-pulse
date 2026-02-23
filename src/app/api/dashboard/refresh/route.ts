import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { after } from "next/server";
import { setUserIndicators, setUserStockSignals, setRefreshStatus, setRiskAssessment } from "@/lib/redis";
import type { RefreshStatus } from "@/lib/redis";
import { runAgenticRiskAssessment } from "@/lib/risk-assessment-agent";

export const maxDuration = 120;

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const secret = process.env.CRON_SECRET;
  const userId = user.id;
  const startedAt = Date.now();

  const initialStatus: RefreshStatus = {
    status: "processing",
    step: "indicators",
    message: "Fetching recession indicators...",
    startedAt,
  };
  await setRefreshStatus(userId, initialStatus);

  after(async () => {
    try {
      const indicatorRes = await fetch(`${appUrl}/api/cron/fetch-indicators?secret=${secret}`);
      let indicatorData: { message?: string; results?: { success: boolean }[] } | null = null;
      try { indicatorData = await indicatorRes.json(); } catch { /* parse failed */ }

      const successCount = indicatorData?.results?.filter((r) => r.success).length ?? 0;
      const failCount = indicatorData?.results?.filter((r) => !r.success).length ?? 0;

      await setRefreshStatus(userId, {
        status: "processing",
        step: "stocks",
        message: "Screening stocks...",
        indicators: { success: successCount, failed: failCount },
        startedAt,
      });

      const stockRes = await fetch(`${appUrl}/api/cron/screen-stocks?secret=${secret}`);
      let stockData: { message?: string; signals?: Record<string, unknown>[] } | null = null;
      try { stockData = await stockRes.json(); } catch { /* parse failed */ }

      const signals = stockData?.signals ?? [];

      await setRefreshStatus(userId, {
        status: "processing",
        step: "caching",
        message: "Caching results...",
        indicators: { success: successCount, failed: failCount },
        stocks: { found: signals.length, tickers: signals.map((s) => String(s.ticker)) },
        startedAt,
      });

      // Cache stock signals in Redis for this user (replaces previous)
      if (signals.length > 0) {
        await setUserStockSignals(userId, signals);
      }

      // Cache indicators in Redis for this user
      try {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const service = createServiceClient();
        const today = new Date().toISOString().split("T")[0];

        const { data: indicators } = await service
          .from("indicator_readings")
          .select("*")
          .eq("reading_date", today);

        if (indicators && indicators.length > 0) {
          const bySlug = new Map<string, typeof indicators[0]>();
          for (const row of indicators) {
            if (!bySlug.has(row.slug)) bySlug.set(row.slug, row);
          }
          await setUserIndicators(userId, Array.from(bySlug.values()));
        }
      } catch (cacheErr) {
        console.warn("Redis cache failed (non-critical):", cacheErr instanceof Error ? cacheErr.message : cacheErr);
      }

      // --- Risk Assessment (agentic AI with web search) ---
      await setRefreshStatus(userId, {
        status: "processing",
        step: "risk",
        message: "Running AI risk assessment with web research...",
        indicators: { success: successCount, failed: failCount },
        stocks: { found: signals.length, tickers: signals.map((s) => String(s.ticker)) },
        startedAt,
      });

      let riskResult: { score: number; risk_level: string } | null = null;
      try {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const service = createServiceClient();

        const { data: allReadings } = await service
          .from("indicator_readings")
          .select("slug, name, latest_value, status, signal, signal_emoji, reading_date")
          .order("reading_date", { ascending: false });

        const latestBySlug = new Map<string, NonNullable<typeof allReadings>[0]>();
        for (const r of allReadings || []) {
          if (!latestBySlug.has(r.slug)) latestBySlug.set(r.slug, r);
        }
        const currentIndicators = Array.from(latestBySlug.values());

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: historyData } = await service
          .from("indicator_readings")
          .select("slug, name, latest_value, status, signal, reading_date")
          .gte("reading_date", sevenDaysAgo.toISOString().split("T")[0])
          .order("reading_date", { ascending: true });

        const assessment = await runAgenticRiskAssessment(
          currentIndicators,
          historyData || [],
          signals.map((s: Record<string, unknown>) => ({
            ticker: String(s.ticker || ""),
            company_name: String(s.company_name || ""),
            signal_type: String(s.signal_type || ""),
            pe_ratio: Number(s.pe_ratio) || undefined,
            dividend_yield: Number(s.dividend_yield) || undefined,
            rsi_14: Number(s.rsi_14) || undefined,
            market_cap: Number(s.market_cap) || undefined,
          }))
        );

        riskResult = { score: assessment.score, risk_level: assessment.risk_level };

        const today = new Date().toISOString().split("T")[0];
        const assessmentRecord = {
          id: "generated",
          score: assessment.score,
          risk_level: assessment.risk_level,
          summary: assessment.summary,
          key_factors: assessment.key_factors,
          outlook: assessment.outlook,
          model: assessment.model,
          assessment_date: today,
          created_at: new Date().toISOString(),
        };

        await setRiskAssessment(assessmentRecord);

        // Also persist to Supabase (upsert for today)
        await service
          .from("recession_risk_assessments")
          .upsert({
            score: assessment.score,
            risk_level: assessment.risk_level,
            summary: assessment.summary,
            key_factors: assessment.key_factors,
            outlook: assessment.outlook,
            indicators_snapshot: currentIndicators,
            model: assessment.model,
            assessment_date: today,
          }, { onConflict: "assessment_date" });

      } catch (riskErr) {
        console.error("Risk assessment failed (non-critical):", riskErr instanceof Error ? riskErr.message : riskErr);
      }

      await setRefreshStatus(userId, {
        status: "success",
        message: `${successCount} indicators, ${signals.length} stocks${riskResult ? `, risk: ${riskResult.score}/100` : ""}`,
        indicators: { success: successCount, failed: failCount },
        stocks: { found: signals.length, tickers: signals.map((s: Record<string, unknown>) => String(s.ticker)) },
        risk: riskResult || undefined,
        startedAt,
        completedAt: Date.now(),
      });
    } catch (err) {
      await setRefreshStatus(userId, {
        status: "failed",
        message: err instanceof Error ? err.message : "Refresh failed",
        error: err instanceof Error ? err.message : "Unknown error",
        startedAt,
        completedAt: Date.now(),
      });
    }
  });

  return NextResponse.json({ status: "processing", message: "Refresh started" });
}
