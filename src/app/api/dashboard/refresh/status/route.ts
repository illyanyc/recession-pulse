import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRefreshStatus } from "@/lib/redis";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await getRefreshStatus(user.id);

  if (!status) {
    return NextResponse.json({ status: "idle", message: "No refresh in progress" });
  }

  return NextResponse.json(status);
}
