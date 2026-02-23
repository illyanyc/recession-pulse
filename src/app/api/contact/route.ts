import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "support@recessionpulse.com";

const VALID_TYPES = ["bug", "suggestion", "question", "other"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, type, message } = body as {
      name?: string;
      email?: string;
      type?: string;
      message?: string;
    };

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required." },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message too long (5000 char max)." },
        { status: 400 }
      );
    }

    const contactType = VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])
      ? type
      : "other";

    const typeLabel =
      contactType === "bug"
        ? "Bug Report"
        : contactType === "suggestion"
          ? "Feature Suggestion"
          : contactType === "question"
            ? "Question"
            : "Other";

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #080808; color: #D4D4D4; padding: 32px 24px;">
        <h1 style="color: #FF6600; font-size: 20px; margin-bottom: 4px;">RecessionPulse — Contact Form</h1>
        <p style="color: #808080; font-size: 12px; margin-bottom: 24px;">New message received</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 12px; color: #808080; font-size: 13px; border-bottom: 1px solid #2A2A2A; width: 100px;">Type</td>
            <td style="padding: 8px 12px; color: #D4D4D4; font-size: 13px; border-bottom: 1px solid #2A2A2A;">${typeLabel}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #808080; font-size: 13px; border-bottom: 1px solid #2A2A2A;">Name</td>
            <td style="padding: 8px 12px; color: #D4D4D4; font-size: 13px; border-bottom: 1px solid #2A2A2A;">${name || "Anonymous"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; color: #808080; font-size: 13px; border-bottom: 1px solid #2A2A2A;">Email</td>
            <td style="padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #2A2A2A;">
              <a href="mailto:${email}" style="color: #FF6600;">${email}</a>
            </td>
          </tr>
        </table>

        <div style="background: #0D0D0D; border: 1px solid #2A2A2A; border-radius: 0px; padding: 16px; margin-bottom: 16px;">
          <p style="color: #808080; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Message</p>
          <p style="color: #D4D4D4; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>

        <p style="color: #808080; font-size: 11px;">
          Sent from the RecessionPulse contact form · ${new Date().toISOString()}
        </p>
      </div>
    `;

    const result = await sendEmail({
      to: CONTACT_EMAIL,
      subject: `[RecessionPulse] ${typeLabel}: ${message.slice(0, 60)}${message.length > 60 ? "…" : ""}`,
      html,
    });

    if (!result.success) {
      console.error("Contact form send failed:", result.error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
