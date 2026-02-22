import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // #region agent log
  const mwKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  fetch('http://127.0.0.1:7244/ingest/7e11db6f-d41c-493a-83e3-c08fecaa79d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase/middleware.ts:updateSession',message:'Middleware client init',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!mwKey,keyPrefix:mwKey?.substring(0,16),path:request.nextUrl.pathname},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/7e11db6f-d41c-493a-83e3-c08fecaa79d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase/middleware.ts:getUser',message:'Auth getUser result',data:{hasUser:!!user,userId:user?.id?.substring(0,8),authError:authError?.message||null,path:request.nextUrl.pathname},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

  // Protected routes
  const protectedPaths = ["/dashboard", "/settings"];
  const isProtected = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ["/login", "/signup"];
  const isAuthPage = authPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
