import { createClient } from "@/lib/supabase/server";
import type { User, UserRole } from "@/features/auth/context/AuthContext";

export async function getInitialUser(): Promise<User | null> {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url")
    .eq("id", authUser.id)
    .maybeSingle();

  return {
    id: authUser.id,
    name:
      profile?.full_name ??
      authUser.user_metadata?.full_name ??
      authUser.user_metadata?.name ??
      null,
    email: profile?.email ?? authUser.email ?? null,
    role: (profile?.role as UserRole) ?? "user",
    avatar_url: profile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
  };
}