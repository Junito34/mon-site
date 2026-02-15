"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    if (!cleanEmail || !password || !cleanUsername) {
      setError("Email, mot de passe et username sont requis.");
      setLoading(false);
      return;
    }

    // 1) Signup Supabase Auth (password géré + hashé par Supabase)
    const { data, error: signErr } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          // utile: remonte dans raw_user_meta_data (et notre trigger profiles peut le lire)
          full_name: cleanUsername,
        },
      },
    });

    if (signErr) {
      setError(signErr.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("Impossible de créer l’utilisateur.");
      setLoading(false);
      return;
    }

    // 2) Upload photo optionnelle
    let avatarUrl: string | null = null;

    if (photo) {
      const ext = photo.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, photo, { upsert: true });

      if (upErr) {
        setError(`Photo: ${upErr.message}`);
        setLoading(false);
        return;
      }

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
      avatarUrl = pub.publicUrl;
    }

    // 3) Update profile (le trigger a déjà créé profiles, on le met à jour)
    const { error: profErr } = await supabase
      .from("profiles")
      .update({
        full_name: cleanUsername,
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (profErr) {
      setError(profErr.message);
      setLoading(false);
      return;
    }

    // 4) Redirection
    window.location.href = "/";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-sm"
        >
          <h1 className="text-3xl font-light mb-2 tracking-wide">
            Créer un compte
          </h1>

          <p className="text-white/60 text-sm mb-6">
            Inscription par email et mot de passe
          </p>

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm outline-none focus:border-white transition"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm outline-none focus:border-white transition"
            />

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm outline-none focus:border-white transition"
            />

            <div className="border border-white/10 p-4">
              <div className="text-xs tracking-[0.3em] uppercase text-white/50 mb-3">
                Photo de profil (optionnel)
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-white/70"
              />
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-white text-black py-3 text-sm tracking-wide hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Création..." : "Créer mon compte"}
            </button>

            <a
              href="/login"
              className="block text-center text-xs tracking-widest uppercase text-white/60 hover:text-white transition pt-2"
            >
              Déjà un compte ? Connexion →
            </a>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
