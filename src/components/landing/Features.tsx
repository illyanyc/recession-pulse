import {
  Activity,
  BarChart3,
  Bell,
  Clock,
  LineChart,
  MessageSquare,
  Shield,
  TrendingDown,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Sahm Rule Monitoring",
    description:
      "The single best real-time recession indicator. We track the 3-month moving average of unemployment against the cycle low.",
  },
  {
    icon: LineChart,
    title: "Yield Curve Analysis",
    description:
      "2s10s and 2s30s spreads tracked daily. Inversions have preceded every recession since 1955 with only one false signal.",
  },
  {
    icon: TrendingDown,
    title: "Conference Board LEI",
    description:
      "The 3Ds rule: diffusion, depth, and duration. When all three trigger simultaneously, recession probability spikes to 85%+.",
  },
  {
    icon: Shield,
    title: "Liquidity Monitoring",
    description:
      "ON RRP facility, M2 money supply, and credit spreads. When the liquidity buffer is gone, markets become fragile.",
  },
  {
    icon: BarChart3,
    title: "Stock Screener (Pro)",
    description:
      "Daily scan for stocks below 200 EMA with RSI <30 and P/E <15. Value dividend picks with P/E <12 near support.",
  },
  {
    icon: MessageSquare,
    title: "Daily SMS Briefing",
    description:
      "Concise, actionable morning briefings delivered via SMS. No noise, no fluff — just the signals that matter.",
  },
  {
    icon: Bell,
    title: "Threshold Alerts",
    description:
      "Instant notification when any indicator crosses a critical threshold. Know the moment the Sahm Rule triggers.",
  },
  {
    icon: Clock,
    title: "Historical Context",
    description:
      "Every reading comes with historical context. Know where we are relative to past recessions and recoveries.",
  },
  {
    icon: Zap,
    title: "Real-time Dashboard",
    description:
      "All indicators at a glance. Clean, financial-terminal aesthetic designed for quick daily check-ins.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-pulse-dark/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Every signal that matters.
            <br />
            <span className="gradient-text">Nothing that doesn&apos;t.</span>
          </h2>
          <p className="text-pulse-muted text-lg max-w-2xl mx-auto">
            We distill the noise of economic data into clear, actionable signals.
            Backed by the indicators that have correctly predicted every recession since 1970.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl border border-pulse-border bg-pulse-card/50 hover:border-pulse-green/20 hover:bg-pulse-card transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-pulse-green/10 flex items-center justify-center mb-4 group-hover:bg-pulse-green/20 transition-colors">
                <feature.icon className="h-5 w-5 text-pulse-green" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-pulse-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
