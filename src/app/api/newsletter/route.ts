import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = subscribeSchema.parse(body);

    const supabase = createServiceClient();

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, status")
      .eq("email", email)
      .single();

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json({ message: "Already subscribed" });
      }
      await supabase
        .from("newsletter_subscribers")
        .update({ status: "active", unsubscribed_at: null })
        .eq("id", existing.id);
      return NextResponse.json({ message: "Re-subscribed successfully" });
    }

    await supabase.from("newsletter_subscribers").insert({
      email,
      source: "website",
    });

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
