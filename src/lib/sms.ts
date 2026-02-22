const TEXTBELT_URL = "https://textbelt.com/text";
const MAX_SMS_LENGTH = 320;

function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

export async function checkSMSQuota(): Promise<number> {
  const key = process.env.TEXTBELT_API_KEY;
  if (!key) return 0;
  try {
    const res = await fetch(`https://textbelt.com/quota/${key}`);
    const data = await res.json();
    return data.quotaRemaining ?? 0;
  } catch {
    return -1;
  }
}

export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const phone = normalizePhoneE164(to);
  if (phone.length < 12)
    return { success: false, error: `Invalid phone number: ${to}` };

  const key = process.env.TEXTBELT_API_KEY;
  if (!key) return { success: false, error: "TEXTBELT_API_KEY not set" };

  const quota = await checkSMSQuota();
  if (quota <= 0)
    return { success: false, error: `SMS quota exhausted (${quota})` };

  const message = body.length > MAX_SMS_LENGTH
    ? body.slice(0, MAX_SMS_LENGTH - 3) + "..."
    : body;

  const segments = Math.ceil(message.length / 160);
  if (segments > 2) {
    console.warn(`SMS is ${message.length} chars (${segments} segments) — trimming`);
  }

  try {
    const res = await fetch(TEXTBELT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message, key }),
    });

    const data = await res.json();

    if (data.success) {
      console.log(`SMS sent to ${phone}: ${message.length} chars, quota left: ${data.quotaRemaining}`);
      return { success: true, sid: String(data.textId) };
    }
    return { success: false, error: data.error || "Unknown Textbelt error" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Textbelt SMS error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
