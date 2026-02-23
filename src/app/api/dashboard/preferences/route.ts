import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_VIEW_MODES = ["grid", "list"];
const VALID_CARD_MODES = ["card", "chart"];

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, string> = {};

  if (body.dashboard_view_mode && VALID_VIEW_MODES.includes(body.dashboard_view_mode)) {
    updates.dashboard_view_mode = body.dashboard_view_mode;
  }
  if (body.card_display_mode && VALID_CARD_MODES.includes(body.card_display_mode)) {
    updates.card_display_mode = body.card_display_mode;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ...updates });
}
