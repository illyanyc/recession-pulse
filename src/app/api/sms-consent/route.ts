import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendSMS } from "@/lib/twilio";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

// Step 1: User opts in from dashboard — send verification code
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, action, code } = body;

    if (action === "request_consent") {
      // Generate 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const serviceClient = createServiceClient();

      // Store the pending consent with code
      await serviceClient.from("sms_consents").upsert({
        user_id: user.id,
        phone_number: phone,
        verification_code: verificationCode,
        status: "pending",
        requested_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      // Send verification SMS
      const result = await sendSMS(
        phone,
        `RecessionPulse: Your verification code is ${verificationCode}. Reply with this code to confirm you want to receive daily recession indicator alerts. Msg & data rates may apply. Reply STOP to opt out anytime.`
      );

      if (!result.success) {
        return NextResponse.json({ error: "Failed to send verification SMS" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Verification code sent" });
    }

    if (action === "verify_consent") {
      const headersList = await headers();
      const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";

      const serviceClient = createServiceClient();

      // Look up pending consent
      const { data: consent } = await serviceClient
        .from("sms_consents")
        .select("*")
        .eq("user_id", user.id)
        .eq("verification_code", code)
        .eq("status", "pending")
        .single();

      if (!consent) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
      }

      // Get profile for proof record
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .single();

      // Update consent to confirmed with full proof
      await serviceClient.from("sms_consents").update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: headersList.get("user-agent") || "unknown",
        proof_record: JSON.stringify({
          user_id: user.id,
          email: profile?.email,
          full_name: profile?.full_name,
          phone_number: consent.phone_number,
          ip_address: ip,
          confirmed_at: new Date().toISOString(),
          consent_text: "User confirmed opt-in to receive daily recession indicator SMS alerts from RecessionPulse. User acknowledged: Msg & data rates may apply. Reply STOP to opt out.",
        }),
      }).eq("id", consent.id);

      // Update profile with confirmed phone and enable SMS
      await serviceClient.from("profiles").update({
        phone: consent.phone_number,
        sms_enabled: true,
      }).eq("id", user.id);

      // Send confirmation
      await sendSMS(
        consent.phone_number,
        "RecessionPulse: SMS alerts confirmed! You'll receive daily recession indicator briefings at 8 AM ET. Reply STOP to opt out anytime."
      );

      return NextResponse.json({ success: true, message: "SMS consent confirmed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("SMS consent error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
