import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AccountClient from "../../features/auth/components/AccountClient";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // si pas connecté -> redirection simple vers login
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">
              Mon compte
            </h1>
            <p className="mt-6 text-white/60">
              Tu dois être connecté pour accéder à cette page.
            </p>
            <a
              href="/login"
              className="inline-block mt-8 border border-white/20 px-5 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
            >
              Aller à la connexion →
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const initial = {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    full_name:
      profile?.full_name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      "",
    role: (profile?.role ?? "user") as "admin" | "user",
    avatar_url:
      profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
    created_at: profile?.created_at ?? null,
  };

  return (
    <>
      <Navbar />
      <AccountClient initial={initial} />
      <Footer />
    </>
  );
}
