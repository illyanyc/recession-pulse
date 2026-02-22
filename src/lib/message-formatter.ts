import type {
  RecessionIndicator,
  StockSignal,
  IndicatorWithTrend,
  IndicatorTrend,
  TrendDirection,
} from "@/types";

const ARROW: Record<TrendDirection, string> = { up: "^", down: "v", flat: "-" };

function trendTag(trend: IndicatorTrend): string {
  const arrow = ARROW[trend.direction_1d];
  if (trend.status_changed_1d) return `${arrow} NEW`;
  if (trend.pct_change_1d !== null && Math.abs(trend.pct_change_1d) >= 0.1) {
    const sign = trend.pct_change_1d > 0 ? "+" : "";
    return `${arrow}${sign}${trend.pct_change_1d.toFixed(1)}%`;
  }
  return arrow;
}

export function formatRecessionSMS(indicators: RecessionIndicator[]): string;
export function formatRecessionSMS(indicators: IndicatorWithTrend[]): string;
export function formatRecessionSMS(indicators: (RecessionIndicator | IndicatorWithTrend)[]): string {
  const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const dangerCount = indicators.filter((i) => i.status === "danger" || i.status === "warning").length;
  const watchCount = indicators.filter((i) => i.status === "watch").length;
  const safeCount = indicators.filter((i) => i.status === "safe").length;
  const hasTrends = indicators.length > 0 && "trend" in indicators[0];

  let level: string;
  if (dangerCount >= 3) level = "HIGH ALERT";
  else if (dangerCount >= 1) level = "CAUTION";
  else if (watchCount >= 3) level = "WATCHFUL";
  else level = "ALL CLEAR";

  const lines = [`RECESSION PULSE ${date} - ${level}`, ""];

  const critical = indicators.filter((i) => i.status === "danger" || i.status === "warning");
  const watching = indicators.filter((i) => i.status === "watch");

  if (critical.length > 0) {
    lines.push("ALERTS:");
    for (const ind of critical.slice(0, 3)) {
      const tag = hasTrends ? ` ${trendTag((ind as IndicatorWithTrend).trend)}` : "";
      lines.push(`* ${ind.name}: ${ind.latest_value}${tag}`);
    }
    if (critical.length > 3) lines.push(`+${critical.length - 3} more`);
    lines.push("");
  }

  if (watching.length > 0) {
    lines.push("WATCH:");
    for (const ind of watching.slice(0, 3)) {
      const tag = hasTrends ? ` ${trendTag((ind as IndicatorWithTrend).trend)}` : "";
      lines.push(`* ${ind.name}: ${ind.latest_value}${tag}`);
    }
    if (watching.length > 3) lines.push(`+${watching.length - 3} more`);
    lines.push("");
  }

  lines.push(`Score: ${safeCount} safe / ${watchCount} watch / ${dangerCount} alert`);
  lines.push("Full report: recessionpulse.com/dashboard");

  return lines.join("\n");
}

export function formatStockAlertSMS(signals: StockSignal[]): string {
  if (signals.length === 0) {
    return [
      "PULSE PRO STOCK SCAN",
      "",
      "No stocks passing filters today.",
      "Criteria: <200 EMA, RSI<30, P/E<15",
      "",
      "recessionpulse.com/dashboard",
    ].join("\n");
  }

  const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const lines = [`PULSE PRO SCAN ${date}`, ""];

  for (const s of signals.slice(0, 5)) {
    const type = s.signal_type === "value_dividend" ? "VAL" : "OVS";
    lines.push(`${type} $${s.ticker} $${s.price.toFixed(2)} P/E:${s.forward_pe.toFixed(1)}`);
  }
  if (signals.length > 5) lines.push(`+${signals.length - 5} more`);

  lines.push("");
  lines.push(`${signals.length} stocks passing filters`);
  lines.push("recessionpulse.com/dashboard");

  return lines.join("\n");
}

export function formatWelcomeSMS(): string {
  return [
    "Welcome to RecessionPulse!",
    "",
    "Daily recession indicators every morning at 8am ET.",
    "Dashboard: recessionpulse.com/dashboard",
    "",
    "Reply STOP to unsubscribe.",
  ].join("\n");
}

export function formatConfirmationSMS(plan: string): string {
  return [
    `${plan} plan activated!`,
    "",
    plan === "Pulse Pro"
      ? "Daily recession indicators + stock screener alerts."
      : "Daily recession indicator alerts.",
    "",
    "First briefing tomorrow at 8am ET.",
    "recessionpulse.com/dashboard",
  ].join("\n");
}
