import { Badge } from "@/components/ui/Badge";
import type { IndicatorStatus } from "@/types";

const indicators: {
  name: string;
  value: string;
  trigger: string;
  status: IndicatorStatus;
  statusText: string;
  signal: string;
}[] = [
  {
    name: "Sahm Rule",
    value: "0.30 (Jan 2026)",
    trigger: ">=0.50 triggers",
    status: "safe",
    statusText: "NOT triggered",
    signal: "Declining from 0.57 peak (Aug 2024)",
  },
  {
    name: "Yield Curve 2s10s",
    value: "+70 bps",
    trigger: "Inversion (<0)",
    status: "watch",
    statusText: "Un-inverted",
    signal: "Steepest since 2021 — watch for 6-18mo lag",
  },
  {
    name: "Yield Curve 2s30s",
    value: "+139 bps",
    trigger: "Inversion (<0)",
    status: "watch",
    statusText: "Steepening",
    signal: "Steepest since Nov 2021",
  },
  {
    name: "Conference Board LEI",
    value: "-0.3% (Dec 2025)",
    trigger: "3Ds Rule",
    status: "danger",
    statusText: "TRIGGERED",
    signal: "Recession signal active since Aug 2025",
  },
  {
    name: "ON RRP Facility",
    value: "~$80B",
    trigger: "Near zero",
    status: "warning",
    statusText: "97% depleted",
    signal: "Systemic safety valve gone",
  },
  {
    name: "DXY (Dollar Index)",
    value: "~96-97",
    trigger: "Rapid decline",
    status: "warning",
    statusText: "5-year lows",
    signal: "14-year record bear positioning",
  },
  {
    name: "Emerging Markets",
    value: "+33.6% in 2025",
    trigger: "EM outperformance",
    status: "safe",
    statusText: "Bullish EM",
    signal: "Best year vs DM since 2017",
  },
  {
    name: "JPM Recession Prob",
    value: "35%",
    trigger: ">50% = high",
    status: "watch",
    statusText: "Moderate",
    signal: "Risen from ~25% mid-2025",
  },
  {
    name: "GDP Growth Forecast",
    value: "2.1%",
    trigger: "<0% = recession",
    status: "watch",
    statusText: "Slowing",
    signal: "Down from 2.8% in 2024",
  },
];

export function Indicators() {
  return (
    <section id="indicators" className="py-24 bg-pulse-dark/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Current <span className="gradient-text">recession signals</span>
          </h2>
          <p className="text-pulse-muted text-lg max-w-2xl mx-auto">
            Here&apos;s what subscribers see every morning. Real data, real signals, real edge.
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
              {indicators.map((ind) => (
                <tr
                  key={ind.name}
                  className="border-b border-pulse-border/50 hover:bg-pulse-card/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-semibold text-white text-sm">{ind.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-pulse-text">{ind.value}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-pulse-muted">{ind.trigger}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge status={ind.status} pulse={ind.status === "danger"}>
                      {ind.statusText}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-pulse-muted">{ind.signal}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 rounded-xl border border-pulse-yellow/20 bg-pulse-yellow/5">
          <p className="text-sm text-pulse-yellow">
            <strong>Note:</strong> Data shown is for demonstration. Subscribers receive live data
            fetched from FRED, Treasury, and financial APIs updated daily.
          </p>
        </div>
      </div>
    </section>
  );
}
