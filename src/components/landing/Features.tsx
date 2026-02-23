import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  Factory,
  LineChart,
  MessageSquare,
  Shield,
  TrendingDown,
  Truck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Primary Recession Signals",
    description:
      "Sahm Rule, unemployment rate, industrial production, real personal income, JOLTS quits rate, and temp help services — the NBER's core indicators.",
  },
  {
    icon: LineChart,
    title: "Yield Curve & Market Signals",
    description:
      "2s10s and 3m10y spreads, VIX, NFCI, copper-gold ratio, NY Fed recession probability, and credit spreads. The quant's toolkit.",
  },
  {
    icon: TrendingDown,
    title: "Conference Board LEI & GDP",
    description:
      "The 3Ds rule (diffusion, depth, duration) plus Atlanta Fed GDPNow for real-time GDP tracking. When both flash red, act fast.",
  },
  {
    icon: Building2,
    title: "Housing & Construction",
    description:
      "Building permits and housing starts — residential investment leads the business cycle by 3-5 quarters. The earliest physical-economy signal.",
  },
  {
    icon: CreditCard,
    title: "Consumer Credit Stress",
    description:
      "Savings rate, credit card delinquencies, SLOOS lending standards, and debt service ratio. Know when consumers are tapped out.",
  },
  {
    icon: Factory,
    title: "Business Activity",
    description:
      "Corporate profits, ISM Manufacturing PMI, NFIB small business optimism, and inventory-to-sales ratio. The pulse of the real economy.",
  },
  {
    icon: Truck,
    title: "Real-Time / High-Frequency",
    description:
      "Freight index, M2 money supply, ON RRP facility, and SOS recession indicator. Weekly and daily signals for the fastest edge.",
  },
  {
    icon: BarChart3,
    title: "Stock Screener (Pro)",
    description:
      "Daily scan for stocks below 200 EMA with RSI <30 and P/E <15. Value dividend picks with P/E <12 near support. Sector rotation signals.",
  },
  {
    icon: MessageSquare,
    title: "Daily SMS & Email Briefing",
    description:
      "Concise, actionable morning briefings delivered to your phone. No noise, no fluff — just the signals that matter.",
  },
  {
    icon: Bell,
    title: "Threshold Alerts",
    description:
      "Instant notification when any indicator crosses a critical threshold. Know the moment the Sahm Rule triggers or the VIX spikes.",
  },
  {
    icon: Shield,
    title: "AI Risk Assessment",
    description:
      "Multi-model recession risk score combining all 28 indicators into a single probability estimate. Updated daily.",
  },
  {
    icon: Zap,
    title: "Real-Time Dashboard",
    description:
      "All 28 indicators at a glance, organized by category. Financial-terminal aesthetic designed for quick daily check-ins. Free forever.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-pulse-dark/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            28 indicators. 8 categories.
            <br />
            <span className="gradient-text">Zero noise.</span>
          </h2>
          <p className="text-pulse-muted text-lg max-w-2xl mx-auto">
            From NBER core recession signals to real-time freight data — every indicator that has
            correctly predicted recessions since 1970, organized for daily decision-making.
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
