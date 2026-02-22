import type { RecessionIndicator, StockSignal } from "@/types";

export function formatRecessionSMS(indicators: RecessionIndicator[]): string {
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const dangerCount = indicators.filter((i) => i.status === "danger" || i.status === "warning").length;
  const watchCount = indicators.filter((i) => i.status === "watch").length;
  const safeCount = indicators.filter((i) => i.status === "safe").length;

  let header: string;
  if (dangerCount >= 3) {
    header = `🔴 RECESSION PULSE ${date} — HIGH ALERT`;
  } else if (dangerCount >= 1) {
    header = `⚠️ RECESSION PULSE ${date} — CAUTION`;
  } else if (watchCount >= 3) {
    header = `🟡 RECESSION PULSE ${date} — WATCHFUL`;
  } else {
    header = `🟢 RECESSION PULSE ${date} — ALL CLEAR`;
  }

  const lines = [header, ""];

  // Group by priority
  const critical = indicators.filter((i) => i.status === "danger" || i.status === "warning");
  const watching = indicators.filter((i) => i.status === "watch");
  const safe = indicators.filter((i) => i.status === "safe");

  if (critical.length > 0) {
    lines.push("⚠️ ALERTS:");
    for (const ind of critical) {
      lines.push(`${ind.signal_emoji} ${ind.name}: ${ind.latest_value}`);
      lines.push(`  → ${ind.signal}`);
    }
    lines.push("");
  }

  if (watching.length > 0) {
    lines.push("👀 WATCHING:");
    for (const ind of watching) {
      lines.push(`${ind.signal_emoji} ${ind.name}: ${ind.latest_value}`);
    }
    lines.push("");
  }

  if (safe.length > 0) {
    lines.push(`✅ ${safeCount} indicator${safeCount !== 1 ? "s" : ""} safe`);
    lines.push("");
  }

  // Summary line
  lines.push(`Score: ${safeCount}✅ ${watchCount}🟡 ${dangerCount}🔴`);
  lines.push("");
  lines.push("📊 recessionpulse.com/dashboard");

  return lines.join("\n");
}

export function formatStockAlertSMS(signals: StockSignal[]): string {
  if (signals.length === 0) {
    return [
      "📈 PULSE PRO STOCK SCAN",
      "",
      "No stocks passing strict filters today.",
      "Criteria: <200 EMA, RSI<30, P/E<15",
      "",
      "Market may be overextended.",
      "Patience is alpha.",
      "",
      "📊 recessionpulse.com/dashboard",
    ].join("\n");
  }

  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const valuePicks = signals.filter((s) => s.signal_type === "value_dividend");
  const oversoldPicks = signals.filter((s) => s.signal_type === "oversold_growth");

  const lines = [`📈 PULSE PRO SCAN ${date}`, ""];

  if (valuePicks.length > 0) {
    lines.push("💰 VALUE/DIVIDEND PICKS:");
    for (const s of valuePicks.slice(0, 5)) {
      lines.push(
        `$${s.ticker} $${s.price.toFixed(2)} | P/E ${s.forward_pe.toFixed(1)} | Yld ${(s.dividend_yield || 0).toFixed(1)}%`
      );
    }
    lines.push("");
  }

  if (oversoldPicks.length > 0) {
    lines.push("📉 OVERSOLD (RSI<30):");
    for (const s of oversoldPicks.slice(0, 5)) {
      lines.push(
        `$${s.ticker} $${s.price.toFixed(2)} | RSI ${s.rsi_14.toFixed(0)} | P/E ${s.forward_pe.toFixed(1)}`
      );
    }
    lines.push("");
  }

  lines.push(`${signals.length} stocks passing filters`);
  lines.push("📊 recessionpulse.com/dashboard");

  return lines.join("\n");
}

export function formatWelcomeSMS(): string {
  return [
    "🟢 Welcome to RecessionPulse!",
    "",
    "You'll receive daily recession indicator briefings every morning at 8am ET.",
    "",
    "Your dashboard is live at:",
    "recessionpulse.com/dashboard",
    "",
    "Reply STOP to unsubscribe from SMS.",
  ].join("\n");
}

export function formatConfirmationSMS(plan: string): string {
  return [
    `✅ ${plan} plan activated!`,
    "",
    plan === "Pulse Pro"
      ? "You'll receive daily recession indicators AND stock screener alerts."
      : "You'll receive daily recession indicator alerts.",
    "",
    "First briefing arrives tomorrow at 8am ET.",
    "",
    "📊 recessionpulse.com/dashboard",
  ].join("\n");
}
