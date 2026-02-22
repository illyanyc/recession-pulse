const TEXTBELT_URL = "https://textbelt.com/text";

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

  const key = process.env.TEXTBELT_API_KEY;
  if (!key) return { success: false, error: "TEXTBELT_API_KEY not set" };

  try {
    const res = await fetch(TEXTBELT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message: body, key }),
    });

    const data = await res.json();

    if (data.success) {
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
