import twilio from "twilio";

let _client: ReturnType<typeof twilio> | null = null;
function getClient() {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return _client;
}

function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const phone = normalizePhoneE164(to);
  if (phone.length < 12)
    return { success: false, error: `Invalid phone number: ${to}` };

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return { success: false, error: "Twilio credentials not configured" };
  }

  try {
    const message = await getClient().messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });

    console.log(`SMS sent to ${phone}: SID=${message.sid}, status=${message.status}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Twilio SMS error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
