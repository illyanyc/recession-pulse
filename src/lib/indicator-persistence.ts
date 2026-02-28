import { createServiceClient } from "@/lib/supabase/server";

export interface IndicatorReading {
  slug: string;
  name: string;
  latest_value: string;
  numeric_value: number | null;
  trigger_level?: string;
  status: string;
  status_text: string;
  signal: string;
  signal_emoji: string;
  source_url?: string;
  category: string;
  reading_date: string;
}

/**
 * Upsert indicator readings into Supabase `indicator_readings` table.
 * Uses the unique constraint on (slug, reading_date) for conflict resolution,
 * so calling this with the same slug + date replaces the previous value.
 */
export async function persistIndicatorsToSupabase(
  indicators: IndicatorReading[]
): Promise<{ success: number; failed: number }> {
  if (indicators.length === 0) return { success: 0, failed: 0 };

  const service = createServiceClient();
  let success = 0;
  let failed = 0;

  for (const ind of indicators) {
    try {
      const { error } = await service.from("indicator_readings").upsert(
        {
          slug: ind.slug,
          name: ind.name,
          latest_value: ind.latest_value,
          numeric_value: ind.numeric_value,
          trigger_level: ind.trigger_level || null,
          status: ind.status,
          status_text: ind.status_text,
          signal: ind.signal,
          signal_emoji: ind.signal_emoji,
          source_url: ind.source_url || null,
          category: ind.category,
          reading_date: ind.reading_date,
        },
        { onConflict: "slug,reading_date" }
      );

      if (error) {
        console.error(`Upsert failed for ${ind.slug}:`, error.message);
        failed++;
      } else {
        success++;
      }
    } catch (err) {
      console.error(`Upsert exception for ${ind.slug}:`, err instanceof Error ? err.message : err);
      failed++;
    }
  }

  return { success, failed };
}
