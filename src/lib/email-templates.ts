import type {
  RecessionIndicator,
  StockSignal,
  IndicatorWithTrend,
  IndicatorTrend,
  TrendDirection,
  IndicatorStatus,
} from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://recessionpulse.com";

function wrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#08080d;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#080808;border:1px solid #2A2A2A;border-radius:0px;overflow:hidden;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#080808 0%,#0D0D0D 100%);padding:32px 28px 24px;border-bottom:1px solid #2A2A2A;text-align:center;">
    <img src="${APP_URL}/logo-transparent.png" alt="RecessionPulse" width="40" height="40" style="border-radius:0px;margin-bottom:12px;" />
    <h1 style="margin:0;font-size:22px;color:#FF6600;font-weight:700;letter-spacing:-0.5px;">RecessionPulse</h1>
    <p style="margin:4px 0 0;font-size:12px;color:#808080;">Real-time recession intelligence</p>
  </div>
  <!-- Content -->
  <div style="padding:28px;">
    ${content}
  </div>
  <!-- Footer -->
  <div style="padding:20px 28px;border-top:1px solid #2A2A2A;text-align:center;">
    <p style="margin:0 0 8px;font-size:11px;color:#808080;">
      RecessionPulse is for informational purposes only. Not investment advice.
    </p>
    <p style="margin:0;font-size:11px;color:#4b5563;">
      <a href="${APP_URL}/privacy" style="color:#4b5563;text-decoration:underline;">Privacy</a> ·
      <a href="${APP_URL}/terms" style="color:#4b5563;text-decoration:underline;">Terms</a> ·
      <a href="${APP_URL}/disclaimer" style="color:#4b5563;text-decoration:underline;">Disclaimer</a> ·
      <a href="${APP_URL}/contact" style="color:#4b5563;text-decoration:underline;">Contact</a>
    </p>
  </div>
</div>
</body>
</html>`;
}

function btn(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#FF6600;color:#080808;padding:12px 28px;border-radius:0px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px;">${text}</a>`;
}

function statusDot(status: string): string {
  const c = status === "safe" ? "#FF6600" : status === "watch" ? "#FFCC00" : "#FF3333";
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:0px;background:${c};margin-right:6px;vertical-align:middle;"></span>`;
}

// ─── Supabase Auth Templates (paste into Supabase dashboard) ───

export function getSupabaseEmailTemplates() {
  return {
    confirmSignup: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#D4D4D4;">Confirm your email</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        Thanks for signing up for RecessionPulse. Click below to verify your email and start tracking recession indicators.
      </p>
      ${btn("Confirm Email", "{{ .ConfirmationURL }}")}
      <p style="margin:20px 0 0;font-size:12px;color:#808080;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    `),

    resetPassword: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#D4D4D4;">Reset your password</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        We received a request to reset your RecessionPulse password. Click below to choose a new one.
      </p>
      ${btn("Reset Password", "{{ .ConfirmationURL }}")}
      <p style="margin:20px 0 0;font-size:12px;color:#808080;">
        This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.
      </p>
    `),

    magicLink: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#D4D4D4;">Your sign-in link</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        Click below to sign into your RecessionPulse account. No password needed.
      </p>
      ${btn("Sign In", "{{ .ConfirmationURL }}")}
      <p style="margin:20px 0 0;font-size:12px;color:#808080;">
        This link expires in 10 minutes and can only be used once.
      </p>
    `),

    changeEmail: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#D4D4D4;">Confirm email change</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        You requested to change your email address. Click below to confirm.
      </p>
      ${btn("Confirm New Email", "{{ .ConfirmationURL }}")}
      <p style="margin:20px 0 0;font-size:12px;color:#808080;">
        If you didn't request this, please secure your account immediately.
      </p>
    `),

    inviteUser: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#D4D4D4;">You've been invited</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        You've been invited to join RecessionPulse — real-time recession indicators delivered daily. Click below to accept.
      </p>
      ${btn("Accept Invite", "{{ .ConfirmationURL }}")}
    `),
  };
}

// ─── Trend Helpers ───

const ARROW_HTML: Record<TrendDirection, string> = {
  up: '<span style="color:#FF3333;">▲</span>',
  down: '<span style="color:#FF6600;">▼</span>',
  flat: '<span style="color:#808080;">–</span>',
};

function trendBadge(trend: IndicatorTrend): string {
  const arrow = ARROW_HTML[trend.direction_1d];
  if (trend.pct_change_1d !== null && Math.abs(trend.pct_change_1d) >= 0.1) {
    const sign = trend.pct_change_1d > 0 ? "+" : "";
    return `${arrow} <span style="font-size:11px;color:#9ca3af;">${sign}${trend.pct_change_1d.toFixed(1)}%</span>`;
  }
  return arrow;
}

function statusChangeBadge(trend: IndicatorTrend, currentStatus: IndicatorStatus): string | null {
  if (trend.status_changed_1d && trend.prev_status_1d) {
    return `<span style="display:inline-block;padding:2px 6px;border-radius:0px;font-size:10px;font-weight:600;background:#2A2A2A;color:#FFCC00;margin-top:2px;">${trend.prev_status_1d} → ${currentStatus}</span>`;
  }
  if (trend.status_changed_7d && trend.prev_status_7d) {
    return `<span style="display:inline-block;padding:2px 6px;border-radius:0px;font-size:10px;font-weight:600;background:#2A2A2A;color:#808080;margin-top:2px;">7d: ${trend.prev_status_7d} → ${currentStatus}</span>`;
  }
  return null;
}

function weekTrendCell(trend: IndicatorTrend): string {
  const arrow = ARROW_HTML[trend.direction_7d];
  if (trend.pct_change_7d !== null && Math.abs(trend.pct_change_7d) >= 0.5) {
    const sign = trend.pct_change_7d > 0 ? "+" : "";
    return `${arrow} <span style="font-size:11px;color:#9ca3af;">${sign}${trend.pct_change_7d.toFixed(1)}%</span>`;
  }
  return arrow;
}

// ─── App Transactional Emails ───

export function buildWelcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to RecessionPulse",
    html: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#D4D4D4;">Welcome aboard, ${name || "there"}!</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        You're now connected to the pulse of the economy. Every morning, you'll receive a concise
        briefing on the key recession indicators that matter most.
      </p>
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:0px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;color:#FF6600;font-weight:600;font-size:14px;">What to expect:</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#D4D4D4;font-size:13px;">📊</td><td style="padding:6px 8px;color:#D4D4D4;font-size:13px;">9 recession indicators tracked daily</td></tr>
          <tr><td style="padding:6px 0;color:#D4D4D4;font-size:13px;">🔔</td><td style="padding:6px 8px;color:#D4D4D4;font-size:13px;">Morning briefing at 8:00 AM ET</td></tr>
          <tr><td style="padding:6px 0;color:#D4D4D4;font-size:13px;">📈</td><td style="padding:6px 8px;color:#D4D4D4;font-size:13px;">Real-time dashboard with AI analysis</td></tr>
          <tr><td style="padding:6px 0;color:#D4D4D4;font-size:13px;">⚡</td><td style="padding:6px 8px;color:#D4D4D4;font-size:13px;">Instant alerts if critical thresholds breach</td></tr>
        </table>
      </div>
      ${btn("Open Dashboard", `${APP_URL}/dashboard`)}
    `),
  };
}

export function buildWeeklyRecapEmail(
  aiRecap: string,
  indicators: RecessionIndicator[],
  weekLabel: string
): { subject: string; html: string } {
  const danger = indicators.filter((i) => i.status === "danger" || i.status === "warning");
  const watch = indicators.filter((i) => i.status === "watch");
  const safe = indicators.filter((i) => i.status === "safe");

  let subjectMood: string;
  if (danger.length >= 3) subjectMood = "High Alert";
  else if (danger.length >= 1) subjectMood = "Caution";
  else if (watch.length >= 3) subjectMood = "Mixed Signals";
  else subjectMood = "All Clear";

  const indicatorRows = indicators.map((ind) => `
    <tr style="border-bottom:1px solid #2A2A2A;">
      <td style="padding:10px 8px;font-size:13px;color:#D4D4D4;">${statusDot(ind.status)}${ind.name}</td>
      <td style="padding:10px 8px;font-size:13px;font-family:monospace;color:#ffffff;text-align:right;">${ind.latest_value}</td>
      <td style="padding:10px 8px;font-size:12px;color:#9ca3af;max-width:160px;">${ind.signal}</td>
    </tr>
  `).join("");

  const recapHtml = aiRecap
    .split("\n\n")
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("##")) return `<h3 style="margin:16px 0 8px;font-size:16px;color:#D4D4D4;">${trimmed.replace(/^#+\s*/, "")}</h3>`;
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const items = trimmed.split("\n").map((li) => `<li style="margin:4px 0;font-size:14px;color:#9ca3af;line-height:1.6;">${li.replace(/^[-*]\s*/, "")}</li>`).join("");
        return `<ul style="padding-left:20px;margin:8px 0;">${items}</ul>`;
      }
      return `<p style="margin:0 0 12px;font-size:14px;color:#9ca3af;line-height:1.6;">${trimmed}</p>`;
    })
    .join("");

  return {
    subject: `${subjectMood} — RecessionPulse Weekly Recap (${weekLabel})`,
    html: wrapper(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#D4D4D4;">Weekly Recession Recap</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#808080;">Week of ${weekLabel} &middot; Friday Close</p>

      <!-- Score bar -->
      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <span style="font-size:13px;color:#D4D4D4;">${statusDot("safe")}<strong>${safe.length}</strong> Safe</span>
        <span style="font-size:13px;color:#D4D4D4;">${statusDot("watch")}<strong>${watch.length}</strong> Watch</span>
        <span style="font-size:13px;color:#D4D4D4;">${statusDot("warning")}<strong>${danger.length}</strong> Alert</span>
      </div>

      <!-- AI Recap -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:0px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;color:#FF6600;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">AI Weekly Analysis</p>
        ${recapHtml}
      </div>

      <!-- Indicators table -->
      <h3 style="margin:0 0 12px;font-size:16px;color:#D4D4D4;">Indicator Snapshot — Friday Close</h3>
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:0px;overflow:hidden;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #2A2A2A;">
            <th style="padding:10px 8px;font-size:11px;color:#808080;text-align:left;text-transform:uppercase;">Indicator</th>
            <th style="padding:10px 8px;font-size:11px;color:#808080;text-align:right;text-transform:uppercase;">Value</th>
            <th style="padding:10px 8px;font-size:11px;color:#808080;text-align:left;text-transform:uppercase;">Signal</th>
          </tr>
          ${indicatorRows}
        </table>
      </div>

      <div style="text-align:center;margin-bottom:16px;">
        ${btn("View All Indicators", `${APP_URL}/indicators`)}
      </div>

      <div style="text-align:center;">
        ${btn("Read Full Report on Blog", `${APP_URL}/blog`)}
      </div>

      <p style="margin:24px 0 0;font-size:11px;color:#4b5563;text-align:center;">
        You're receiving this because you signed up for our free weekly recap.<br/>
        <a href="${APP_URL}/api/newsletter/unsubscribe?email={{email}}" style="color:#808080;text-decoration:underline;">Unsubscribe</a>
      </p>
    `),
  };
}

export function buildDailyBriefingEmail(
  indicators: RecessionIndicator[] | IndicatorWithTrend[],
  stockSignals?: StockSignal[],
  plan?: string
): { subject: string; html: string } {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const danger = indicators.filter((i) => i.status === "danger" || i.status === "warning");
  const watch = indicators.filter((i) => i.status === "watch");
  const safe = indicators.filter((i) => i.status === "safe");
  const hasTrends = indicators.length > 0 && "trend" in indicators[0];

  let subjectPrefix: string;
  if (danger.length >= 3) subjectPrefix = "🔴 HIGH ALERT";
  else if (danger.length >= 1) subjectPrefix = "⚠️ CAUTION";
  else if (watch.length >= 3) subjectPrefix = "🟡 WATCHFUL";
  else subjectPrefix = "🟢 ALL CLEAR";

  // Build subject suffix for status changes
  let subjectSuffix = "";
  if (hasTrends) {
    const changed = (indicators as IndicatorWithTrend[]).filter(
      (i) => i.trend.status_changed_1d
    );
    if (changed.length > 0) {
      subjectSuffix = ` · ${changed.length} signal${changed.length > 1 ? "s" : ""} changed`;
    }
  }

  const indicatorRows = indicators.map((ind) => {
    const trend = hasTrends ? (ind as IndicatorWithTrend).trend : null;
    const dayCol = trend ? `<td style="padding:10px 6px;font-size:12px;text-align:center;white-space:nowrap;">${trendBadge(trend)}</td>` : "";
    const weekCol = trend ? `<td style="padding:10px 6px;font-size:12px;text-align:center;white-space:nowrap;">${weekTrendCell(trend)}</td>` : "";
    const changeBadge = trend ? statusChangeBadge(trend, ind.status) : null;
    const nameCell = `${statusDot(ind.status)}${ind.name}${changeBadge ? `<br/>${changeBadge}` : ""}`;

    return `
    <tr style="border-bottom:1px solid #2A2A2A;">
      <td style="padding:10px 8px;font-size:13px;color:#D4D4D4;">${nameCell}</td>
      <td style="padding:10px 8px;font-size:13px;font-family:monospace;color:#ffffff;text-align:right;">${ind.latest_value}</td>
      ${dayCol}
      ${weekCol}
      <td style="padding:10px 8px;font-size:12px;color:#9ca3af;max-width:140px;">${ind.signal}</td>
    </tr>`;
  }).join("");

  const dayHeader = hasTrends ? '<th style="padding:10px 6px;font-size:11px;color:#808080;text-align:center;text-transform:uppercase;">1D</th>' : "";
  const weekHeader = hasTrends ? '<th style="padding:10px 6px;font-size:11px;color:#808080;text-align:center;text-transform:uppercase;">7D</th>' : "";

  // Status changes callout
  let changesSection = "";
  if (hasTrends) {
    const changed = (indicators as IndicatorWithTrend[]).filter(
      (i) => i.trend.status_changed_1d || i.trend.status_changed_7d
    );
    if (changed.length > 0) {
      const changeRows = changed.map((ind) => {
        const prev = ind.trend.status_changed_1d ? ind.trend.prev_status_1d : ind.trend.prev_status_7d;
        const timeframe = ind.trend.status_changed_1d ? "today" : "past 7 days";
        return `<li style="margin:4px 0;font-size:13px;color:#D4D4D4;">${statusDot(ind.status)}<strong>${ind.name}</strong>: ${prev} → ${ind.status} <span style="font-size:11px;color:#808080;">(${timeframe})</span></li>`;
      }).join("");

      changesSection = `
        <div style="background:#1a1520;border:1px solid #2d1f3d;border-radius:0px;padding:16px 20px;margin-bottom:20px;">
          <p style="margin:0 0 8px;color:#FFCC00;font-weight:600;font-size:13px;">🔄 Signal Changes</p>
          <ul style="margin:0;padding-left:16px;">${changeRows}</ul>
        </div>`;
    }
  }

  let stockSection = "";
  if (plan === "pulse_pro" && stockSignals && stockSignals.length > 0) {
    const stockRows = stockSignals.slice(0, 8).map((s) => `
      <tr style="border-bottom:1px solid #2A2A2A;">
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#ffffff;font-weight:700;">$${s.ticker}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#D4D4D4;">$${s.price.toFixed(2)}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:${s.rsi_14 < 30 ? "#FF3333" : "#FFCC00"};">RSI ${s.rsi_14.toFixed(0)}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#D4D4D4;">P/E ${s.forward_pe.toFixed(1)}</td>
      </tr>
    `).join("");

    stockSection = `
      <div style="margin-top:24px;">
        <h3 style="margin:0 0 12px;font-size:16px;color:#D4D4D4;">📈 Stock Screener Picks</h3>
        <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:0px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #2A2A2A;">
              <th style="padding:8px;font-size:11px;color:#808080;text-align:left;text-transform:uppercase;">Ticker</th>
              <th style="padding:8px;font-size:11px;color:#808080;text-align:left;text-transform:uppercase;">Price</th>
              <th style="padding:8px;font-size:11px;color:#808080;text-align:left;text-transform:uppercase;">RSI</th>
              <th style="padding:8px;font-size:11px;color:#808080;text-align:left;text-transform:uppercase;">P/E</th>
            </tr>
            ${stockRows}
          </table>
        </div>
      </div>
    `;
  }

  return {
    subject: `${subjectPrefix} — RecessionPulse ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}${subjectSuffix}`,
    html: wrapper(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#D4D4D4;">Daily Recession Briefing</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#808080;">${date}</p>

      <!-- Score bar -->
      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <span style="font-size:13px;color:#D4D4D4;">${statusDot("safe")}<strong>${safe.length}</strong> Safe</span>
        <span style="font-size:13px;color:#D4D4D4;">${statusDot("watch")}<strong>${watch.length}</strong> Watch</span>
        <span style="font-size:13px;color:#D4D4D4;">${statusDot("warning")}<strong>${danger.length}</strong> Alert</span>
      </div>

      ${changesSection}

      <!-- Indicators table -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:0px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #2A2A2A;">
            <th style="padding:10px 8px;font-size:11px;color:#808080;text-align:left;text-transform:uppercase;">Indicator</th>
            <th style="padding:10px 8px;font-size:11px;color:#808080;text-align:right;text-transform:uppercase;">Value</th>
            ${dayHeader}
            ${weekHeader}
            <th style="padding:10px 8px;font-size:11px;color:#808080;text-align:left;text-transform:uppercase;">Signal</th>
          </tr>
          ${indicatorRows}
        </table>
      </div>

      ${stockSection}

      <div style="margin-top:24px;text-align:center;">
        ${btn("View Full Dashboard", `${APP_URL}/dashboard`)}
      </div>
    `),
  };
}
