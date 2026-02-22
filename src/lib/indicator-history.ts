import { createServiceClient } from "@/lib/supabase/server";
import type {
  RecessionIndicator,
  IndicatorStatus,
  IndicatorTrend,
  IndicatorWithTrend,
  TrendDirection,
} from "@/types";

interface HistoricalReading {
  slug: string;
  numeric_value: number;
  status: IndicatorStatus;
  reading_date: string;
}

function computeDirection(current: number, previous: number | null): TrendDirection {
  if (previous === null) return "flat";
  const delta = current - previous;
  const threshold = Math.abs(previous) * 0.001 || 0.0001;
  if (Math.abs(delta) < threshold) return "flat";
  return delta > 0 ? "up" : "down";
}

function pctChange(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * Fetch the past 8 days of indicator_readings from Supabase
 * and compute 1-day and 7-day trend data for each indicator.
 */
export async function fetchIndicatorTrends(
  todayIndicators: RecessionIndicator[]
): Promise<Map<string, IndicatorTrend>> {
  const supabase = createServiceClient();
  const today = new Date();
  const eightDaysAgo = new Date(today);
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  const slugs = todayIndicators.map((i) => i.slug);

  const { data: history } = await supabase
    .from("indicator_readings")
    .select("slug, numeric_value, status, reading_date")
    .in("slug", slugs)
    .gte("reading_date", eightDaysAgo.toISOString().split("T")[0])
    .order("reading_date", { ascending: false });

  const bySlug = new Map<string, HistoricalReading[]>();
  for (const row of (history as HistoricalReading[]) || []) {
    const existing = bySlug.get(row.slug) || [];
    existing.push(row);
    bySlug.set(row.slug, existing);
  }

  const trends = new Map<string, IndicatorTrend>();
  const todayStr = today.toISOString().split("T")[0];

  for (const indicator of todayIndicators) {
    const readings = bySlug.get(indicator.slug) || [];
    const currentValue = indicator.numeric_value ?? (parseFloat(indicator.latest_value) || 0);
    const currentStatus = indicator.status;

    const yesterdayReading = readings.find(
      (r) => r.reading_date !== todayStr && r.reading_date < todayStr
    );

    const sevenDayTarget = new Date(today);
    sevenDayTarget.setDate(sevenDayTarget.getDate() - 7);
    const sevenDayStr = sevenDayTarget.toISOString().split("T")[0];

    const weekAgoReading = readings.reduce<HistoricalReading | null>((closest, r) => {
      if (r.reading_date > sevenDayStr) return closest;
      if (!closest) return r;
      const closestDiff = Math.abs(
        new Date(closest.reading_date).getTime() - sevenDayTarget.getTime()
      );
      const rDiff = Math.abs(new Date(r.reading_date).getTime() - sevenDayTarget.getTime());
      return rDiff < closestDiff ? r : closest;
    }, null);

    const prev1dValue = yesterdayReading?.numeric_value ?? null;
    const prev7dValue = weekAgoReading?.numeric_value ?? null;

    trends.set(indicator.slug, {
      slug: indicator.slug,
      direction_1d: computeDirection(currentValue, prev1dValue),
      direction_7d: computeDirection(currentValue, prev7dValue),
      value_change_1d: prev1dValue !== null ? currentValue - prev1dValue : null,
      value_change_7d: prev7dValue !== null ? currentValue - prev7dValue : null,
      pct_change_1d: pctChange(currentValue, prev1dValue),
      pct_change_7d: pctChange(currentValue, prev7dValue),
      status_changed_1d: yesterdayReading ? yesterdayReading.status !== currentStatus : false,
      status_changed_7d: weekAgoReading ? weekAgoReading.status !== currentStatus : false,
      prev_status_1d: (yesterdayReading?.status as IndicatorStatus) ?? null,
      prev_status_7d: (weekAgoReading?.status as IndicatorStatus) ?? null,
    });
  }

  return trends;
}

/** Merge today's indicators with their computed trend data. */
export function mergeWithTrends(
  indicators: RecessionIndicator[],
  trends: Map<string, IndicatorTrend>
): IndicatorWithTrend[] {
  return indicators.map((ind) => ({
    ...ind,
    trend: trends.get(ind.slug) ?? {
      slug: ind.slug,
      direction_1d: "flat" as const,
      direction_7d: "flat" as const,
      value_change_1d: null,
      value_change_7d: null,
      pct_change_1d: null,
      pct_change_7d: null,
      status_changed_1d: false,
      status_changed_7d: false,
      prev_status_1d: null,
      prev_status_7d: null,
    },
  }));
}
