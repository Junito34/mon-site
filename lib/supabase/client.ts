import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error("Supabase env missing: NEXT_PUBLIC_SUPABASE_URL + (PUBLISHABLE_KEY or ANON_KEY)");
  }
  return createBrowserClient(env.url, env.key);
}
