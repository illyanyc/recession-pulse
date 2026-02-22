export async function sendSMS(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
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
        recipient: to,
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
