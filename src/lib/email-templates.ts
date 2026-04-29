import type {
  RecessionIndicator,
  StockSignal,
  IndicatorWithTrend,
  IndicatorTrend,
  TrendDirection,
  IndicatorStatus,
} from "@/types";
import { INDICATOR_COUNT } from "@/lib/indicators-metadata";

const APP_URL = "https://recessionpulse.com";

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
    <h1 style="margin:0;font-size:22px;color:#F0913A;font-weight:700;letter-spacing:-0.5px;">RecessionPulse</h1>
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
  return `<a href="${href}" style="display:inline-block;background:#F0913A;color:#080808;padding:12px 28px;border-radius:0px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px;">${text}</a>`;
}

function statusDot(status: string): string {
  const c = status === "safe" ? "#F0913A" : status === "watch" ? "#F2C94C" : "#EB5757";
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:0px;background:${c};margin-right:8px;vertical-align:middle;"></span>`;
}

function scoreBar(safe: number, watch: number, alert: number): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
      <tr>
        <td style="padding-right:24px;font-size:13px;color:#D4D4D4;white-space:nowrap;">
          ${statusDot("safe")}<strong>${safe}</strong>&nbsp;Safe
        </td>
        <td style="padding-right:24px;font-size:13px;color:#D4D4D4;white-space:nowrap;">
          ${statusDot("watch")}<strong>${watch}</strong>&nbsp;Watch
        </td>
        <td style="font-size:13px;color:#D4D4D4;white-space:nowrap;">
          ${statusDot("warning")}<strong>${alert}</strong>&nbsp;Alert
        </td>
      </tr>
    </table>`;
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
  up: '<span style="color:#EB5757;">▲</span>',
  down: '<span style="color:#F0913A;">▼</span>',
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
    return `<span style="display:inline-block;padding:2px 6px;border-radius:0px;font-size:10px;font-weight:600;background:#2A2A2A;color:#F2C94C;margin-top:2px;">${trend.prev_status_1d} → ${currentStatus}</span>`;
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
        <p style="margin:0 0 12px;color:#F0913A;font-weight:600;font-size:14px;">What to expect:</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#F0913A;font-size:13px;font-weight:600;">-</td><td style="padding:6px 8px;color:#D4D4D4;font-size:13px;">${INDICATOR_COUNT} recession indicators tracked daily</td></tr>
          <tr><td style="padding:6px 0;color:#F0913A;font-size:13px;font-weight:600;">-</td><td style="padding:6px 8px;color:#D4D4D4;font-size:13px;">Morning briefing at 7:15 AM ET</td></tr>
          <tr><td style="padding:6px 0;color:#F0913A;font-size:13px;font-weight:600;">-</td><td style="padding:6px 8px;color:#D4D4D4;font-size:13px;">Real-time dashboard with AI analysis</td></tr>
          <tr><td style="padding:6px 0;color:#F0913A;font-size:13px;font-weight:600;">-</td><td style="padding:6px 8px;color:#D4D4D4;font-size:13px;">Instant alerts if critical thresholds breach</td></tr>
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
      ${scoreBar(safe.length, watch.length, danger.length)}

      <!-- AI Recap -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:0px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;color:#F0913A;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">AI Weekly Analysis</p>
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

export interface BlogPostPreview {
  slug: string;
  title: string;
  excerpt: string;
}

export interface RiskAssessmentPreview {
  score: number;
  risk_level: "low" | "moderate" | "elevated" | "high" | "critical";
  summary: string;
  delta30d?: number | null;
  assessment_date?: string;
}

const RISK_LEVEL_COLORS: Record<RiskAssessmentPreview["risk_level"], string> = {
  low: "#00CC66",
  moderate: "#F2C94C",
  elevated: "#F0913A",
  high: "#EB5757",
  critical: "#BB0A1F",
};

export function buildDailyBriefingEmail(
  indicators: RecessionIndicator[] | IndicatorWithTrend[],
  stockSignals?: StockSignal[],
  plan?: string,
  blogPost?: BlogPostPreview,
  riskAssessment?: RiskAssessmentPreview
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
  if (riskAssessment) {
    const score = riskAssessment.score;
    subjectPrefix =
      score >= 81
        ? "[CRITICAL]"
        : score >= 61
          ? "[HIGH RISK]"
          : score >= 41
            ? "[ELEVATED]"
            : score >= 21
              ? "[MODERATE]"
              : "[LOW RISK]";
  } else if (danger.length >= 3) subjectPrefix = "[HIGH ALERT]";
  else if (danger.length >= 1) subjectPrefix = "[CAUTION]";
  else if (watch.length >= 3) subjectPrefix = "[WATCHFUL]";
  else subjectPrefix = "[ALL CLEAR]";

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
          <p style="margin:0 0 8px;color:#F2C94C;font-weight:600;font-size:13px;">Signal Changes</p>
          <ul style="margin:0;padding-left:16px;">${changeRows}</ul>
        </div>`;
    }
  }

  let riskScoreSection = "";
  if (riskAssessment) {
    const scoreColor = RISK_LEVEL_COLORS[riskAssessment.risk_level] || "#F0913A";
    const delta = riskAssessment.delta30d;
    const deltaText =
      delta == null
        ? "&nbsp;"
        : `${delta > 0 ? "▲ +" : delta < 0 ? "▼ " : "– "}${delta} vs 30 days ago`;
    const deltaColor = delta == null ? "#808080" : delta > 2 ? "#EB5757" : delta < -2 ? "#00CC66" : "#9ca3af";
    const trendDate = riskAssessment.assessment_date || new Date().toISOString().split("T")[0];
    const trendImg = `${APP_URL}/api/og/risk-trend?size=email&date=${trendDate}`;
    const truncSummary = riskAssessment.summary.length > 280
      ? riskAssessment.summary.slice(0, 277) + "..."
      : riskAssessment.summary;

    riskScoreSection = `
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:0px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 10px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">AI Recession Risk Score</p>
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-bottom:12px;">
          <tr>
            <td style="vertical-align:baseline;padding-right:18px;">
              <span style="font-size:48px;font-weight:800;color:${scoreColor};font-family:monospace;line-height:1;">${riskAssessment.score}</span>
              <span style="font-size:18px;color:#6b7280;font-family:monospace;margin-left:2px;">/100</span>
            </td>
            <td style="vertical-align:baseline;">
              <div style="font-size:13px;font-weight:700;color:${scoreColor};text-transform:uppercase;letter-spacing:0.08em;">${riskAssessment.risk_level}</div>
              <div style="font-size:12px;color:${deltaColor};margin-top:2px;">${deltaText}</div>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 14px;font-size:13px;color:#9ca3af;line-height:1.6;">${truncSummary}</p>
        <img
          src="${trendImg}"
          alt="Recession risk score — last 30 days"
          width="560"
          style="display:block;width:100%;max-width:560px;height:auto;border:1px solid #2A2A2A;border-radius:0px;"
        />
      </div>`;
  }

  let blogSection = "";
  if (blogPost) {
    const truncatedExcerpt = blogPost.excerpt.length > 220
      ? blogPost.excerpt.slice(0, 217) + "..."
      : blogPost.excerpt;
    blogSection = `
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Today's AI Risk Analysis</p>
        <h3 style="margin:0 0 8px;font-size:17px;color:#D4D4D4;font-weight:700;">${blogPost.title}</h3>
        <p style="margin:0 0 14px;font-size:13px;color:#9ca3af;line-height:1.6;">${truncatedExcerpt}</p>
        ${btn("Read Full Analysis", `${APP_URL}/blog/${blogPost.slug}`)}
      </div>`;
  }

  let stockSection = "";
  if (plan === "pulse_pro" && stockSignals && stockSignals.length > 0) {
    const stockRows = stockSignals.slice(0, 8).map((s) => `
      <tr style="border-bottom:1px solid #2A2A2A;">
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#ffffff;font-weight:700;">$${s.ticker}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#D4D4D4;">$${s.price.toFixed(2)}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:${s.rsi_14 < 30 ? "#EB5757" : "#F2C94C"};">RSI ${s.rsi_14.toFixed(0)}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#D4D4D4;">P/E ${s.forward_pe.toFixed(1)}</td>
      </tr>
    `).join("");

    stockSection = `
      <div style="margin-top:24px;">
        <h3 style="margin:0 0 12px;font-size:16px;color:#D4D4D4;">Stock Screener Picks</h3>
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

  const dateShort = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const scoreSegment = riskAssessment ? ` · ${riskAssessment.score}/100` : "";

  return {
    subject: `${subjectPrefix} RecessionPulse ${dateShort}${scoreSegment}${subjectSuffix}`,
    html: wrapper(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#D4D4D4;">Daily Recession Briefing</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#808080;">${date}</p>

      ${riskScoreSection}

      ${blogSection}

      <!-- Score bar -->
      ${scoreBar(safe.length, watch.length, danger.length)}

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

export function buildPromoEmail(): { subject: string; html: string } {
  return {
    subject: "Your first month of Pulse Pro is on us",
    html: wrapper(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#D4D4D4;">Spring into smarter risk intelligence.</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#808080;">Limited-time offer from RecessionPulse</p>

      <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.6;">
        For a limited time, we're giving you a full month of
        <strong style="color:#D4D4D4;">Pulse Pro</strong> completely free.
        Just apply coupon <strong style="color:#F0913A;">RPSPRING2026</strong> at checkout.
      </p>

      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">What's included in Pulse Pro ($9.99/mo)</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">
              ✓ &nbsp;Everything in Pulse (AI risk assessment, daily SMS alerts, threshold notifications)
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">
              ✓ &nbsp;<strong>Daily stock screener alerts</strong> — stocks below 200 EMA + RSI &lt;30 + P/E &lt;15
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">
              ✓ &nbsp;<strong>Value dividend picks</strong> — P/E &lt;12, near 200 EMA
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">
              ✓ &nbsp;<strong>Sector rotation signals</strong>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">
              ✓ &nbsp;<strong>Portfolio defense positioning</strong>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.6;">
        <strong style="color:#D4D4D4;">And we're just getting started</strong> — more AI-powered features
        are being added to Pulse Pro this month. Lock in now and be the first to get them.
      </p>

      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        Whether markets are calm or volatile, Pulse Pro gives you the quant edge to stay ahead.
      </p>

      <div style="text-align:center;margin-bottom:12px;">
        ${btn("Claim Your Free Month", `${APP_URL}/signup?plan=pulse_pro`)}
      </div>

      <p style="margin:0;text-align:center;font-size:12px;color:#808080;">
        Use code <strong style="color:#F0913A;">RPSPRING2026</strong> during Stripe checkout. Cancel anytime.
      </p>
    `),
  };
}

export function buildPromoFollowUpEmail(): { subject: string; html: string } {
  return {
    subject: "Reminder: Your free month of Pulse Pro expires soon",
    html: wrapper(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#D4D4D4;">Don't miss your free month.</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#808080;">Quick reminder from RecessionPulse</p>

      <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.6;">
        Yesterday we opened up a <strong style="color:#D4D4D4;">free month of Pulse Pro</strong> —
        our full quant toolkit with daily stock screener alerts, value dividend picks,
        sector rotation signals, and portfolio defense positioning.
      </p>

      <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.6;">
        We're also shipping more AI-powered features to Pulse Pro this month.
        If you lock in now, you'll be the first to get them — at no cost for your first month.
      </p>

      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-radius:0px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0 0 8px;font-size:16px;color:#F0913A;font-weight:700;">RPSPRING2026</p>
        <p style="margin:0;font-size:13px;color:#808080;">Apply at Stripe checkout for 1 month free</p>
      </div>

      <div style="text-align:center;margin-bottom:12px;">
        ${btn("Get Pulse Pro Free", `${APP_URL}/signup?plan=pulse_pro`)}
      </div>

      <p style="margin:0;text-align:center;font-size:12px;color:#808080;">
        No risk. Cancel anytime. Limited-time offer.
      </p>
    `),
  };
}

export function buildFeatureAnnouncementEmail(): { subject: string; html: string } {
  return {
    subject: "New: AI Risk Analysis Now in Your Daily Email",
    html: wrapper(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#D4D4D4;">New Feature: Daily AI Analysis in Your Inbox</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#808080;">A quick update from RecessionPulse</p>

      <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.6;">
        Starting today, your daily briefing email includes a new section at the top: a summary of our
        <strong style="color:#D4D4D4;">AI-generated recession risk analysis</strong> with a direct link to the
        full blog post.
      </p>

      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">What's new</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#F0913A;font-size:13px;font-weight:600;vertical-align:top;width:20px;">1.</td>
            <td style="padding:8px 8px;color:#D4D4D4;font-size:13px;line-height:1.5;">
              <strong>AI Risk Score &amp; Summary</strong> — Every morning, our AI analyzes 50+ indicators
              with real-time web data and writes a comprehensive risk assessment.
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#F0913A;font-size:13px;font-weight:600;vertical-align:top;width:20px;">2.</td>
            <td style="padding:8px 8px;color:#D4D4D4;font-size:13px;line-height:1.5;">
              <strong>Blog Post Link</strong> — The full analysis is published as a blog post every day.
              Your email now links directly to it, above the indicator table.
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#F0913A;font-size:13px;font-weight:600;vertical-align:top;width:20px;">3.</td>
            <td style="padding:8px 8px;color:#D4D4D4;font-size:13px;line-height:1.5;">
              <strong>Everything else stays the same</strong> — Your indicator table, trend arrows,
              signal changes, and stock screener picks are all still there.
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        No action needed on your end — this is already live in your next daily email.
        You can also browse all past analyses on the blog anytime.
      </p>

      <div style="text-align:center;margin-bottom:16px;">
        ${btn("Read Today's Analysis", `${APP_URL}/blog`)}
      </div>

      <div style="text-align:center;">
        ${btn("View Dashboard", `${APP_URL}/dashboard`)}
      </div>
    `),
  };
}

export function buildProductUpdatesEmail(): { subject: string; html: string } {
  return {
    subject: "What's new on RecessionPulse — April 2026 updates",
    html: wrapper(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#D4D4D4;">A bigger, clearer picture of recession risk.</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#808080;">Product updates · April 2026</p>

      <p style="margin:0 0 16px;font-size:14px;color:#9ca3af;line-height:1.6;">
        We've shipped a batch of updates designed to make recession risk easier to see, understand, and act on —
        on the dashboard, in your daily briefing, and across the site.
      </p>

      <!-- #1 Score history on dashboard -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">New · Dashboard</p>
        <h3 style="margin:0 0 8px;font-size:16px;color:#D4D4D4;font-weight:700;">30-day recession score history</h3>
        <p style="margin:0 0 12px;font-size:13px;color:#9ca3af;line-height:1.6;">
          Your dashboard now shows a full 30-day chart of the AI recession score alongside today's number —
          plus a 30-day delta badge so you can see the trajectory at a glance. Each risk band (low → extreme)
          is shaded in the background so you can read the direction, not just the value.
        </p>
        <div style="text-align:left;">
          <a href="${APP_URL}/dashboard" style="color:#F0913A;font-size:13px;font-weight:600;text-decoration:none;">Open dashboard →</a>
        </div>
      </div>

      <!-- #2 Daily briefing upgrade -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Upgraded · Daily briefing</p>
        <h3 style="margin:0 0 8px;font-size:16px;color:#D4D4D4;font-weight:700;">Numeric AI score + 30-day trend in every email</h3>
        <p style="margin:0 0 12px;font-size:13px;color:#9ca3af;line-height:1.6;">
          The 7:15 AM ET briefing now leads with the numeric risk score, the 30-day change,
          and an embedded 30-day trend chart — so you see direction before you see the indicator table.
          Existing signal changes, stock picks, and indicator table are unchanged.
        </p>
      </div>

      <!-- #3 Blog post expansion -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">Expanded · Daily AI Analysis</p>
        <h3 style="margin:0 0 8px;font-size:16px;color:#D4D4D4;font-weight:700;">Deeper daily analysis — now 1,800–2,400 words</h3>
        <p style="margin:0 0 10px;font-size:13px;color:#9ca3af;line-height:1.6;">
          Every daily risk post now includes five new sections:
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">
          <tr><td style="padding:3px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">✓ &nbsp;30-day score trajectory chart</td></tr>
          <tr><td style="padding:3px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">✓ &nbsp;Category breakdown — safe / watch / danger counts per group</td></tr>
          <tr><td style="padding:3px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">✓ &nbsp;Biggest movers — top 5 indicators by 1D and 7D change</td></tr>
          <tr><td style="padding:3px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">✓ &nbsp;Stock screener signals (Pulse Pro)</td></tr>
          <tr><td style="padding:3px 0;color:#D4D4D4;font-size:13px;line-height:1.5;">✓ &nbsp;Source list — every URL the AI consulted, deduped</td></tr>
        </table>
        <div style="text-align:left;margin-top:10px;">
          <a href="${APP_URL}/blog" style="color:#F0913A;font-size:13px;font-weight:600;text-decoration:none;">Read today's analysis →</a>
        </div>
      </div>

      <!-- #4 Learning library -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">New · Learn</p>
        <h3 style="margin:0 0 8px;font-size:16px;color:#D4D4D4;font-weight:700;">Glossary + historical recessions library</h3>
        <p style="margin:0 0 12px;font-size:13px;color:#9ca3af;line-height:1.6;">
          A searchable glossary of ~50 macro terms (Sahm Rule, NBER dating, yield curve inversion, soft landing, stagflation…) and
          a library of every US recession since 1973 with modern parallels — both cross-linked to the live indicators.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:0 8px 0 0;width:50%;">
              <a href="${APP_URL}/learn/glossary" style="color:#F0913A;font-size:13px;font-weight:600;text-decoration:none;">Browse glossary →</a>
            </td>
            <td style="padding:0 0 0 8px;width:50%;">
              <a href="${APP_URL}/learn/recessions" style="color:#F0913A;font-size:13px;font-weight:600;text-decoration:none;">Historical recessions →</a>
            </td>
          </tr>
        </table>
      </div>

      <!-- #5 Compare tool -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:16px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">New · Indicators</p>
        <h3 style="margin:0 0 8px;font-size:16px;color:#D4D4D4;font-weight:700;">Head-to-head indicator comparisons</h3>
        <p style="margin:0 0 12px;font-size:13px;color:#9ca3af;line-height:1.6;">
          Curated high-signal pairs (Sahm Rule vs Yield Curve, LEI vs Conference Board, etc.) with a dual-line
          chart and AI-written verdict on which leads, which lags, and which you should watch right now.
        </p>
        <a href="${APP_URL}/indicators/compare" style="color:#F0913A;font-size:13px;font-weight:600;text-decoration:none;">Browse comparisons →</a>
      </div>

      <!-- #6 Category hubs -->
      <div style="background:#0D0D0D;border:1px solid #2A2A2A;border-left:3px solid #F0913A;border-radius:0px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 6px;color:#F0913A;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;">New · Indicators</p>
        <h3 style="margin:0 0 8px;font-size:16px;color:#D4D4D4;font-weight:700;">Category hub pages</h3>
        <p style="margin:0 0 12px;font-size:13px;color:#9ca3af;line-height:1.6;">
          Every indicator category (labor, housing, credit, sentiment, yields, growth, stocks, liquidity) now has
          its own hub with pillar copy, current signal summary, and a 30-day category chart.
        </p>
        <a href="${APP_URL}/indicators" style="color:#F0913A;font-size:13px;font-weight:600;text-decoration:none;">All indicators →</a>
      </div>

      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        As always, no action needed on your end — everything is live and backfilled. Hit reply with feedback
        or feature requests; we read every email.
      </p>

      <div style="text-align:center;margin-bottom:12px;">
        ${btn("Open Dashboard", `${APP_URL}/dashboard`)}
      </div>

      <p style="margin:8px 0 0;text-align:center;font-size:12px;color:#808080;">
        — The RecessionPulse team
      </p>
    `),
  };
}
