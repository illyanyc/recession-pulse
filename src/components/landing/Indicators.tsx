import { Badge } from "@/components/ui/Badge";
import { createServiceClient } from "@/lib/supabase/server";
import type { IndicatorStatus } from "@/types";
import { Lock } from "lucide-react";
import Link from "next/link";

interface IndicatorRow {
  name: string;
  value: string;
  trigger: string;
  status: IndicatorStatus;
  statusText: string;
  signal: string;
  slug: string;
}

const FALLBACK_INDICATORS: IndicatorRow[] = [
  { slug: "sahm-rule", name: "Sahm Rule", value: "0.30 (Jan 2026)", trigger: ">=0.50 triggers", status: "safe", statusText: "NOT triggered", signal: "Declining from 0.57 peak (Aug 2024)" },
  { slug: "yield-curve-2s10s", name: "Yield Curve 2s10s", value: "+70 bps", trigger: "Inversion (<0)", status: "watch", statusText: "Un-inverted", signal: "Steepest since 2021 — watch for 6-18mo lag" },
  { slug: "yield-curve-2s30s", name: "Yield Curve 2s30s", value: "+139 bps", trigger: "Inversion (<0)", status: "watch", statusText: "Steepening", signal: "Steepest since Nov 2021" },
  { slug: "conference-board-lei", name: "Conference Board LEI", value: "-0.3% (Dec 2025)", trigger: "3Ds Rule", status: "danger", statusText: "TRIGGERED", signal: "Recession signal active since Aug 2025" },
  { slug: "on-rrp-facility", name: "ON RRP Facility", value: "~$80B", trigger: "Near zero", status: "warning", statusText: "97% depleted", signal: "Systemic safety valve gone" },
  { slug: "dxy-dollar-index", name: "DXY (Dollar Index)", value: "~96-97", trigger: "Rapid decline", status: "warning", statusText: "5-year lows", signal: "14-year record bear positioning" },
  { slug: "emerging-markets", name: "Emerging Markets", value: "+33.6% in 2025", trigger: "EM outperformance", status: "safe", statusText: "Bullish EM", signal: "Best year vs DM since 2017" },
  { slug: "jpm-recession-prob", name: "JPM Recession Prob", value: "35%", trigger: ">50% = high", status: "watch", statusText: "Moderate", signal: "Risen from ~25% mid-2025" },
  { slug: "gdp-growth-forecast", name: "GDP Growth Forecast", value: "2.1%", trigger: "<0% = recession", status: "watch", statusText: "Slowing", signal: "Down from 2.8% in 2024" },
];

const FREE_SLUG = "sahm-rule";

async function fetchLiveIndicators(): Promise<IndicatorRow[] | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("indicator_readings")
      .select("slug, name, latest_value, trigger_level, status, status_text, signal, reading_date")
      .order("reading_date", { ascending: false })
      .limit(50);

    if (!data || data.length === 0) return null;

    const bySlug = new Map<string, typeof data[0]>();
    for (const row of data) {
      if (!bySlug.has(row.slug)) bySlug.set(row.slug, row);
    }

    if (bySlug.size === 0) return null;

    return Array.from(bySlug.values()).map((r) => ({
      slug: r.slug,
      name: r.name,
      value: r.latest_value,
      trigger: r.trigger_level || "",
      status: r.status as IndicatorStatus,
      statusText: r.status_text || r.status,
      signal: r.signal,
    }));
  } catch {
    return null;
  }
}

export async function Indicators() {
  const live = await fetchLiveIndicators();
  const indicators = live && live.length > 0 ? live : FALLBACK_INDICATORS;
  const isLive = live !== null && live.length > 0;

  return (
    <section id="indicators" className="py-24 bg-pulse-dark/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Current <span className="gradient-text">recession signals</span>
          </h2>
          <p className="text-pulse-muted text-lg max-w-2xl mx-auto">
            {isLive
              ? "Live data from FRED, Treasury, and financial APIs — updated daily."
              : "Sample data — here\u2019s what subscribers see every morning. Subscribe for live signals."}
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-pulse-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">
                  Indicator
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">
                  Latest
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">
                  Trigger
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-pulse-muted uppercase tracking-wider">
                  Signal
                </th>
              </tr>
            </thead>
            <tbody>
              {indicators.map((ind) => {
                const isFree = ind.slug === FREE_SLUG;
                return (
                  <tr
                    key={ind.slug}
                    className="border-b border-pulse-border/50 hover:bg-pulse-card/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-semibold text-white text-sm">{ind.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      {isFree ? (
                        <span className="font-mono text-sm text-pulse-text">{ind.value}</span>
                      ) : (
                        <span className="font-mono text-sm text-pulse-muted/60 blur-[5px] select-none" aria-hidden="true">
                          {ind.value}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isFree ? (
                        <span className="text-xs text-pulse-muted">{ind.trigger}</span>
                      ) : (
                        <span className="text-xs text-pulse-muted/60 blur-[5px] select-none" aria-hidden="true">{ind.trigger}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isFree ? (
                        <Badge status={ind.status} pulse={ind.status === "danger"}>
                          {ind.statusText}
                        </Badge>
                      ) : (
                        <span className="blur-[5px] select-none" aria-hidden="true">
                          <Badge status={ind.status} pulse={false}>
                            {ind.statusText}
                          </Badge>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {isFree ? (
                        <span className="text-xs text-pulse-muted">{ind.signal}</span>
                      ) : (
                        <span className="text-xs text-pulse-muted/60 blur-[5px] select-none" aria-hidden="true">
                          {ind.signal}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Subscribe CTA */}
        <div className="mt-8 p-5 rounded-xl border border-pulse-green/20 bg-pulse-green/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-pulse-green shrink-0" />
            <p className="text-sm text-pulse-text">
              <span className="font-semibold text-white">Subscribe</span> to unlock all indicator values, signals, and daily SMS alerts.
            </p>
          </div>
          <Link
            href="/signup?plan=pulse"
            className="shrink-0 px-6 py-2.5 rounded-lg bg-pulse-green text-black font-semibold text-sm hover:bg-pulse-green/90 transition-colors"
          >
            Get Full Access
          </Link>
        </div>
      </div>
    </section>
  );
}
