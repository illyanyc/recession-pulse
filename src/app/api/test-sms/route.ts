import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/sms";
import { verifyCronAuth } from "@/lib/cron-auth";

export async function GET(request: Request) {
  const { authorized, response } = verifyCronAuth(request);
  if (!authorized) return response!;

  const ownerPhone = process.env.OWNER_PHONE_NUMBER;
  if (!ownerPhone) {
    return NextResponse.json({ error: "OWNER_PHONE_NUMBER not configured" }, { status: 500 });
  }

  const testMessage = [
    "RECESSION PULSE TEST",
    "",
    "SMS delivery verified.",
    `From: ${process.env.TWILIO_PHONE_NUMBER}`,
    `To: ${ownerPhone}`,
    `Time: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}`,
    "",
    "If you received this, Twilio is working.",
    "",
    "recessionpulse.com/dashboard",
  ].join("\n");

  const result = await sendSMS(ownerPhone, testMessage);

  return NextResponse.json({
    message: result.success ? "Test SMS sent successfully" : "Test SMS failed",
    ...result,
    to: ownerPhone,
    from: process.env.TWILIO_PHONE_NUMBER,
  });
}
