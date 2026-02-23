import { BarChart3, Clock, Shield, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "42",
    label: "Recession & macro indicators",
  },
  {
    icon: Clock,
    value: "8 AM ET",
    label: "Morning briefing delivered",
  },
  {
    icon: BarChart3,
    value: "100%",
    label: "Recession prediction accuracy since 1970",
    detail: "for the Sahm Rule & yield curve",
  },
  {
    icon: Shield,
    value: "Free",
    label: "Dashboard — upgrade for SMS alerts",
  },
];

const dataSources = [
  "Federal Reserve (FRED)",
  "U.S. Treasury",
  "Bureau of Labor Statistics",
  "Conference Board",
  "ISM",
  "Atlanta Fed",
  "Chicago Fed",
  "CBOE",
];

export function SocialProof() {
  return (
    <section className="py-20 border-y border-pulse-border bg-pulse-card/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-10 h-10 rounded-lg bg-pulse-green/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-5 w-5 text-pulse-green" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-pulse-muted leading-snug">{stat.label}</div>
              {stat.detail && (
                <div className="text-xs text-pulse-muted/60 mt-0.5">{stat.detail}</div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs text-pulse-muted mb-4 uppercase tracking-wider font-semibold">
            Data sourced from trusted institutions
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {dataSources.map((source) => (
              <span key={source} className="text-sm text-pulse-text/60 font-medium">
                {source}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
