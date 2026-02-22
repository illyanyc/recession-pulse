import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return new NextResponse(unsubPage("Missing email parameter.", false), {
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const supabase = createServiceClient();
    const decoded = decodeURIComponent(email);

    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("email", decoded);

    if (error) {
      console.error("Unsubscribe error:", error);
      return new NextResponse(unsubPage("Something went wrong. Please try again.", false), {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new NextResponse(unsubPage(decoded, true), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return new NextResponse(unsubPage("Something went wrong.", false), {
      headers: { "Content-Type": "text/html" },
    });
  }
}

function unsubPage(emailOrError: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${success ? "Unsubscribed" : "Error"} — RecessionPulse</title>
<style>
  body { margin:0; padding:40px 20px; background:#0a0a0f; color:#e5e7eb; font-family:system-ui,sans-serif; text-align:center; }
  .card { max-width:400px; margin:60px auto; background:#12121a; border:1px solid #1e1e2e; border-radius:16px; padding:40px; }
  h1 { font-size:24px; margin:0 0 12px; color:white; }
  p { font-size:14px; color:#9ca3af; line-height:1.6; margin:0 0 20px; }
  a { color:#00ff87; text-decoration:none; }
  a:hover { text-decoration:underline; }
  .check { font-size:48px; margin-bottom:16px; }
</style></head>
<body>
  <div class="card">
    ${success ? '<div class="check">&#10003;</div>' : ""}
    <h1>${success ? "You've been unsubscribed" : "Oops"}</h1>
    <p>${success ? `<strong>${emailOrError}</strong> has been removed from the RecessionPulse newsletter. You won't receive any more weekly recaps.` : emailOrError}</p>
    <a href="https://recessionpulse.com">Back to RecessionPulse</a>
  </div>
</body></html>`;
}
