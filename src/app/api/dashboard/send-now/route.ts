import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!sub) {
    return NextResponse.json({ error: "Active subscription required" }, { status: 403 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const secret = process.env.CRON_SECRET;

    const res = await fetch(`${appUrl}/api/cron/send-alerts?secret=${secret}`);

    let data;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json({ error: "Failed to parse response from alert service" }, { status: 502 });
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Send-now route error:", err);
    return NextResponse.json(
      { error: "Failed to send alerts. Please try again." },
      { status: 500 }
    );
  }
}
