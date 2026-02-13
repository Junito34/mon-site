"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setError(null);
    setLoadingGoogle(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoadingGoogle(false);
    }
  };

  const signInWithEmail = async () => {
    setError(null);
    setLoadingEmail(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoadingEmail(false);
      return;
    }

    // connecté -> home (ou /account si tu veux)
    window.location.href = "/";
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-sm"
        >
          <h1 className="text-3xl font-light mb-2 tracking-wide">Connexion</h1>

          <p className="text-white/60 text-sm mb-6">
            Accédez à votre espace privé
          </p>

          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Bouton Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 border border-white/20 py-3 text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              width={18}
              height={18}
            />
            {loadingGoogle ? "Connexion..." : "Continuer avec Google"}
          </button>

          <div className="my-8 border-t border-white/10" />

          {/* Email + password */}
          <div className="space-y-4">
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

            <button
              onClick={signInWithEmail}
              disabled={loadingEmail}
              className="w-full bg-white text-black py-3 text-sm tracking-wide hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingEmail ? "Connexion..." : "Se connecter"}
            </button>

            <a href="/signup" className="block text-center text-xs tracking-widest uppercase text-white/60 hover:text-white transition pt-4">
                Pas de compte ? Créer un compte →
            </a>

          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
