import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await getResend().emails.send({
      from: "RecessionPulse <alerts@recessionpulse.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export function buildWelcomeEmail(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to RecessionPulse",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #e5e7eb; padding: 40px 20px;">
        <h1 style="color: #00ff87; font-size: 28px; margin-bottom: 8px;">RecessionPulse</h1>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 32px;">Real-time recession intelligence</p>
        <h2 style="font-size: 22px; margin-bottom: 16px;">Welcome aboard, ${name || "there"}!</h2>
        <p style="line-height: 1.6; margin-bottom: 24px;">
          You're now connected to the pulse of the economy. Every morning, you'll receive a concise
          briefing on the key recession indicators that matter most.
        </p>
        <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #00ff87; font-weight: 600; margin-bottom: 8px;">What to expect:</p>
          <ul style="color: #e5e7eb; line-height: 1.8;">
            <li>Daily SMS briefing at 8:00 AM ET</li>
            <li>Real-time dashboard access</li>
            <li>Instant alerts if critical thresholds are breached</li>
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #00ff87; color: #0a0a0f; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Dashboard
        </a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
          RecessionPulse | Real-time recession indicators delivered daily
        </p>
      </div>
    `,
  };
}
