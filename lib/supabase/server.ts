import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase env missing: NEXT_PUBLIC_SUPABASE_URL + (PUBLISHABLE_KEY or ANON_KEY)"
    );
  }

  const cookieStore = cookies();

  return createServerClient(env.url, env.key, {
    cookies: {
      async getAll() {
        return (await cookieStore).getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(async ({ name, value, options }) => {
            (await cookieStore).set(name, value, options);
          });
        } catch {
          // Dans certains contextes Server Components, set peut throw: OK.
        }
      },
    },
  });
}