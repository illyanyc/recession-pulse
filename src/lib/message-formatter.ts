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

function weekSummary(trend: IndicatorTrend): string | null {
  if (trend.status_changed_7d && trend.prev_status_7d) {
    return `7d: ${trend.prev_status_7d} -> now`;
  }
  if (trend.pct_change_7d !== null && Math.abs(trend.pct_change_7d) >= 0.5) {
    const arrow = ARROW[trend.direction_7d];
    const sign = trend.pct_change_7d > 0 ? "+" : "";
    return `7d: ${arrow}${sign}${trend.pct_change_7d.toFixed(1)}%`;
  }
  return null;
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

  const lines = [`RECESSION PULSE ${date} - ${level}`];

  const critical = indicators.filter((i) => i.status === "danger" || i.status === "warning");
  const watching = indicators.filter((i) => i.status === "watch");

  if (hasTrends) {
    const changed = (indicators as IndicatorWithTrend[]).filter(
      (i) => i.trend.status_changed_1d || i.trend.status_changed_7d
    );
    if (changed.length > 0) {
      lines.push("CHANGES:");
      for (const ind of changed) {
        const prev = ind.trend.status_changed_1d
          ? ind.trend.prev_status_1d
          : ind.trend.prev_status_7d;
        lines.push(`${ind.name}: ${prev}->${ind.status}`);
      }
    }
  }

  if (critical.length > 0) {
    lines.push("ALERTS:");
    for (const ind of critical) {
      const tag = hasTrends ? ` ${trendTag((ind as IndicatorWithTrend).trend)}` : "";
      lines.push(`${ind.name}: ${ind.latest_value}${tag}`);
      lines.push(`- ${ind.signal}`);
    }
  }

  if (watching.length > 0) {
    lines.push("WATCHING:");
    for (const ind of watching) {
      const tag = hasTrends ? ` ${trendTag((ind as IndicatorWithTrend).trend)}` : "";
      lines.push(`${ind.name}: ${ind.latest_value}${tag}`);
    }
  }

  lines.push(`${safeCount}safe/${watchCount}watch/${dangerCount}alert`);
  lines.push("recessionpulse.com/dashboard");

  return lines.join("\n");
}

export function formatStockAlertSMS(signals: StockSignal[]): string {
  if (signals.length === 0) {
    return [
      "PULSE PRO STOCK SCAN",
      "",
      "No stocks passing strict filters today.",
      "Criteria: <200 EMA, RSI<30, P/E<15",
      "",
      "Market may be overextended.",
      "Patience is alpha.",
      "",
      "recessionpulse.com/dashboard",
    ].join("\n");
  }

  const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const valuePicks = signals.filter((s) => s.signal_type === "value_dividend");
  const oversoldPicks = signals.filter((s) => s.signal_type === "oversold_growth");

  const lines = [`PULSE PRO SCAN ${date}`, ""];

  if (valuePicks.length > 0) {
    lines.push("VALUE/DIVIDEND:");
    for (const s of valuePicks.slice(0, 5)) {
      lines.push(
        `$${s.ticker} $${s.price.toFixed(2)} | P/E ${s.forward_pe.toFixed(1)} | Yld ${(s.dividend_yield || 0).toFixed(1)}%`
      );
    }
    lines.push("");
  }

  if (oversoldPicks.length > 0) {
    lines.push("OVERSOLD (RSI<30):");
    for (const s of oversoldPicks.slice(0, 5)) {
      lines.push(
        `$${s.ticker} $${s.price.toFixed(2)} | RSI ${s.rsi_14.toFixed(0)} | P/E ${s.forward_pe.toFixed(1)}`
      );
    }
    lines.push("");
  }

  lines.push(`${signals.length} stocks passing filters`);
  lines.push("recessionpulse.com/dashboard");

  return lines.join("\n");
}

export function formatWelcomeSMS(): string {
  return [
    "Welcome to RecessionPulse!",
    "",
    "You'll receive daily recession indicator briefings every morning at 7:15 AM ET.",
    "",
    "Your dashboard is live at:",
    "recessionpulse.com/dashboard",
    "",
    "Reply STOP to unsubscribe from SMS.",
  ].join("\n");
}

export function formatConfirmationSMS(plan: string): string {
  return [
    `${plan} plan activated!`,
    "",
    plan === "Pulse Pro"
      ? "You'll receive daily recession indicators AND stock screener alerts."
      : "You'll receive daily recession indicator alerts.",
    "",
    "First briefing arrives tomorrow at 7:15 AM ET.",
    "",
    "recessionpulse.com/dashboard",
  ].join("\n");
}
