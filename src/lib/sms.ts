function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("1") && digits.length === 11) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

export async function sendSMS(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const recipient = normalizePhone(to);
  if (recipient.length < 10) return { success: false, error: "Invalid phone number" };

  try {
    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "transactional",
        sender: "RPulse",
        recipient: recipient,
        content: body,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Brevo SMS failed");
    return { success: true, sid: String(data.messageId) };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Brevo SMS error:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
