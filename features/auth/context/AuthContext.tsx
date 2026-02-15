"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  ready: boolean; // ✅ nouveau : indique "l'état auth est résolu"
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const supabase = useMemo(() => createClient(), []);

  // initialUser !== undefined signifie : SSR a déjà tranché (connecté ou non)
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [loading, setLoading] = useState<boolean>(initialUser === undefined);
  const [ready, setReady] = useState<boolean>(initialUser !== undefined);

  const loadUser = async () => {
    setLoading(true);

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setUser(null);
      setLoading(false);
      setReady(true);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url")
      .eq("id", authUser.id)
      .maybeSingle();

    setUser({
      id: authUser.id,
      name:
        profile?.full_name ??
        authUser.user_metadata?.full_name ??
        authUser.user_metadata?.name ??
        null,
      email: profile?.email ?? authUser.email ?? null,
      role: (profile?.role as UserRole) ?? "user",
      avatar_url: profile?.avatar_url ?? authUser.user_metadata?.avatar_url ?? null,
    });

    setLoading(false);
    setReady(true);
  };

  useEffect(() => {
    // Si on n’a pas eu d’init SSR, on charge côté client
    if (initialUser === undefined) {
      loadUser();
    } else {
      // SSR a déjà décidé => ready = true (déjà), pas besoin de loader au mount
      setReady(true);
      setLoading(false);
    }

    // écoute les changements de session
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const refresh = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, ready, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}