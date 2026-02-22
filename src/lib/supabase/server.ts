import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // #region agent log
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  fetch('http://127.0.0.1:7244/ingest/7e11db6f-d41c-493a-83e3-c08fecaa79d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase/server.ts:createClient',message:'Server client init',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!key,keyPrefix:key?.substring(0,16)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component - can't set cookies
          }
        },
      },
    }
  );
}

export function createServiceClient() {
  // #region agent log
  const srk = process.env.SUPABASE_SERVICE_ROLE_KEY;
  fetch('http://127.0.0.1:7244/ingest/7e11db6f-d41c-493a-83e3-c08fecaa79d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase/server.ts:createServiceClient',message:'Service client init',data:{hasKey:!!srk,keyPrefix:srk?.substring(0,12)},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
  // #endregion
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}
