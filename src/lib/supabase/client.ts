import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // #region agent log
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  fetch('http://127.0.0.1:7244/ingest/7e11db6f-d41c-493a-83e3-c08fecaa79d6',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'supabase/client.ts:createClient',message:'Browser client init',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!key,keyPrefix:key?.substring(0,16)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
