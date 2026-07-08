import { createServerClient } from "@supabase/ssr";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSupabaseCookieOptions } from "@/lib/supabase/cookie-options";
import type { Database } from "@/lib/supabase/types";

export async function createClient() {
  await connection();
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_* in .env.local)"
    );
  }

  return createServerClient<Database>(url, key, {
    cookieOptions: getSupabaseCookieOptions(),
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll can fail in Server Components — safe to ignore when read-only
        }
      },
    },
  });
}

export { isSupabaseConfigured } from "@/lib/supabase/env";
