import type { RecessionIndicator, StockSignal } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://recessionpulse.com";

function wrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#08080d;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#0a0a0f;border:1px solid #1e1e2e;border-radius:16px;overflow:hidden;">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0a0a0f 0%,#12121a 100%);padding:32px 28px 24px;border-bottom:1px solid #1e1e2e;text-align:center;">
    <img src="${APP_URL}/logo.png" alt="RecessionPulse" width="40" height="40" style="border-radius:8px;margin-bottom:12px;" />
    <h1 style="margin:0;font-size:22px;color:#00ff87;font-weight:700;letter-spacing:-0.5px;">RecessionPulse</h1>
    <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Real-time recession intelligence</p>
  </div>
  <!-- Content -->
  <div style="padding:28px;">
    ${content}
  </div>
  <!-- Footer -->
  <div style="padding:20px 28px;border-top:1px solid #1e1e2e;text-align:center;">
    <p style="margin:0 0 8px;font-size:11px;color:#6b7280;">
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
  return `<a href="${href}" style="display:inline-block;background:#00ff87;color:#0a0a0f;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px;">${text}</a>`;
}

function statusDot(status: string): string {
  const c = status === "safe" ? "#00ff87" : status === "watch" ? "#ffa502" : "#ff4757";
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};margin-right:6px;vertical-align:middle;"></span>`;
}

// ─── Supabase Auth Templates (paste into Supabase dashboard) ───

export function getSupabaseEmailTemplates() {
  return {
    confirmSignup: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#e5e7eb;">Confirm your email</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        Thanks for signing up for RecessionPulse. Click below to verify your email and start tracking recession indicators.
      </p>
      ${btn("Confirm Email", "{{ .ConfirmationURL }}")}
      <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">
        If you didn't create an account, you can safely ignore this email.
      </p>
    `),

    resetPassword: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#e5e7eb;">Reset your password</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        We received a request to reset your RecessionPulse password. Click below to choose a new one.
      </p>
      ${btn("Reset Password", "{{ .ConfirmationURL }}")}
      <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">
        This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.
      </p>
    `),

    magicLink: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#e5e7eb;">Your sign-in link</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        Click below to sign into your RecessionPulse account. No password needed.
      </p>
      ${btn("Sign In", "{{ .ConfirmationURL }}")}
      <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">
        This link expires in 10 minutes and can only be used once.
      </p>
    `),

    changeEmail: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#e5e7eb;">Confirm email change</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        You requested to change your email address. Click below to confirm.
      </p>
      ${btn("Confirm New Email", "{{ .ConfirmationURL }}")}
      <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">
        If you didn't request this, please secure your account immediately.
      </p>
    `),

    inviteUser: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#e5e7eb;">You've been invited</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        You've been invited to join RecessionPulse — real-time recession indicators delivered daily. Click below to accept.
      </p>
      ${btn("Accept Invite", "{{ .ConfirmationURL }}")}
    `),
  };
}

// ─── App Transactional Emails ───

export function buildWelcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to RecessionPulse",
    html: wrapper(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#e5e7eb;">Welcome aboard, ${name || "there"}!</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#9ca3af;line-height:1.6;">
        You're now connected to the pulse of the economy. Every morning, you'll receive a concise
        briefing on the key recession indicators that matter most.
      </p>
      <div style="background:#12121a;border:1px solid #1e1e2e;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;color:#00ff87;font-weight:600;font-size:14px;">What to expect:</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#e5e7eb;font-size:13px;">📊</td><td style="padding:6px 8px;color:#e5e7eb;font-size:13px;">9 recession indicators tracked daily</td></tr>
          <tr><td style="padding:6px 0;color:#e5e7eb;font-size:13px;">🔔</td><td style="padding:6px 8px;color:#e5e7eb;font-size:13px;">Morning briefing at 8:00 AM ET</td></tr>
          <tr><td style="padding:6px 0;color:#e5e7eb;font-size:13px;">📈</td><td style="padding:6px 8px;color:#e5e7eb;font-size:13px;">Real-time dashboard with AI analysis</td></tr>
          <tr><td style="padding:6px 0;color:#e5e7eb;font-size:13px;">⚡</td><td style="padding:6px 8px;color:#e5e7eb;font-size:13px;">Instant alerts if critical thresholds breach</td></tr>
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
    <tr style="border-bottom:1px solid #1e1e2e;">
      <td style="padding:10px 8px;font-size:13px;color:#e5e7eb;">${statusDot(ind.status)}${ind.name}</td>
      <td style="padding:10px 8px;font-size:13px;font-family:monospace;color:#ffffff;text-align:right;">${ind.latest_value}</td>
      <td style="padding:10px 8px;font-size:12px;color:#9ca3af;max-width:160px;">${ind.signal}</td>
    </tr>
  `).join("");

  const recapHtml = aiRecap
    .split("\n\n")
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("##")) return `<h3 style="margin:16px 0 8px;font-size:16px;color:#e5e7eb;">${trimmed.replace(/^#+\s*/, "")}</h3>`;
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
      <h2 style="margin:0 0 4px;font-size:20px;color:#e5e7eb;">Weekly Recession Recap</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">Week of ${weekLabel} &middot; Friday Close</p>

      <!-- Score bar -->
      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <span style="font-size:13px;color:#e5e7eb;">${statusDot("safe")}<strong>${safe.length}</strong> Safe</span>
        <span style="font-size:13px;color:#e5e7eb;">${statusDot("watch")}<strong>${watch.length}</strong> Watch</span>
        <span style="font-size:13px;color:#e5e7eb;">${statusDot("warning")}<strong>${danger.length}</strong> Alert</span>
      </div>

      <!-- AI Recap -->
      <div style="background:#12121a;border:1px solid #1e1e2e;border-radius:12px;padding:20px;margin-bottom:20px;">
        <p style="margin:0 0 12px;color:#00ff87;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">AI Weekly Analysis</p>
        ${recapHtml}
      </div>

      <!-- Indicators table -->
      <h3 style="margin:0 0 12px;font-size:16px;color:#e5e7eb;">Indicator Snapshot — Friday Close</h3>
      <div style="background:#12121a;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #1e1e2e;">
            <th style="padding:10px 8px;font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;">Indicator</th>
            <th style="padding:10px 8px;font-size:11px;color:#6b7280;text-align:right;text-transform:uppercase;">Value</th>
            <th style="padding:10px 8px;font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;">Signal</th>
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
        <a href="${APP_URL}/api/newsletter/unsubscribe?email={{email}}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
      </p>
    `),
  };
}

export function buildDailyBriefingEmail(
  indicators: RecessionIndicator[],
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

  let subjectPrefix: string;
  if (danger.length >= 3) subjectPrefix = "🔴 HIGH ALERT";
  else if (danger.length >= 1) subjectPrefix = "⚠️ CAUTION";
  else if (watch.length >= 3) subjectPrefix = "🟡 WATCHFUL";
  else subjectPrefix = "🟢 ALL CLEAR";

  const indicatorRows = indicators.map((ind) => `
    <tr style="border-bottom:1px solid #1e1e2e;">
      <td style="padding:10px 8px;font-size:13px;color:#e5e7eb;">${statusDot(ind.status)}${ind.name}</td>
      <td style="padding:10px 8px;font-size:13px;font-family:monospace;color:#ffffff;text-align:right;">${ind.latest_value}</td>
      <td style="padding:10px 8px;font-size:12px;color:#9ca3af;max-width:160px;">${ind.signal}</td>
    </tr>
  `).join("");

  let stockSection = "";
  if (plan === "pulse_pro" && stockSignals && stockSignals.length > 0) {
    const stockRows = stockSignals.slice(0, 8).map((s) => `
      <tr style="border-bottom:1px solid #1e1e2e;">
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#ffffff;font-weight:700;">$${s.ticker}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#e5e7eb;">$${s.price.toFixed(2)}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:${s.rsi_14 < 30 ? "#ff4757" : "#ffa502"};">RSI ${s.rsi_14.toFixed(0)}</td>
        <td style="padding:8px;font-size:13px;font-family:monospace;color:#e5e7eb;">P/E ${s.forward_pe.toFixed(1)}</td>
      </tr>
    `).join("");

    stockSection = `
      <div style="margin-top:24px;">
        <h3 style="margin:0 0 12px;font-size:16px;color:#e5e7eb;">📈 Stock Screener Picks</h3>
        <div style="background:#12121a;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #1e1e2e;">
              <th style="padding:8px;font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;">Ticker</th>
              <th style="padding:8px;font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;">Price</th>
              <th style="padding:8px;font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;">RSI</th>
              <th style="padding:8px;font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;">P/E</th>
            </tr>
            ${stockRows}
          </table>
        </div>
      </div>
    `;
  }

  return {
    subject: `${subjectPrefix} — RecessionPulse ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    html: wrapper(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#e5e7eb;">Daily Recession Briefing</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#6b7280;">${date}</p>

      <!-- Score bar -->
      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <span style="font-size:13px;color:#e5e7eb;">${statusDot("safe")}<strong>${safe.length}</strong> Safe</span>
        <span style="font-size:13px;color:#e5e7eb;">${statusDot("watch")}<strong>${watch.length}</strong> Watch</span>
        <span style="font-size:13px;color:#e5e7eb;">${statusDot("warning")}<strong>${danger.length}</strong> Alert</span>
      </div>

      <!-- Indicators table -->
      <div style="background:#12121a;border:1px solid #1e1e2e;border-radius:12px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #1e1e2e;">
            <th style="padding:10px 8px;font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;">Indicator</th>
            <th style="padding:10px 8px;font-size:11px;color:#6b7280;text-align:right;text-transform:uppercase;">Value</th>
            <th style="padding:10px 8px;font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;">Signal</th>
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
