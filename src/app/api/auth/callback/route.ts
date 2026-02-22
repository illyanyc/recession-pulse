import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/dashboard";
  const plan = searchParams.get("plan");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const redirectUrl = plan
        ? `/pricing?plan=${plan}&checkout=true`
        : redirect;
      return NextResponse.redirect(`${origin}${redirectUrl}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
