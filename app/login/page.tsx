"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { useMemo, useState } from "react";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);

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

    window.location.href = "/";
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 pt-28 md:pt-40 pb-16 md:pb-20">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="
              w-full
              bg-white/5 backdrop-blur-xl border border-white/10
              rounded-sm
              p-6 sm:p-8 md:p-10
            "
          >
            <h1 className="font-light tracking-wide text-white/90 text-[clamp(1.6rem,6vw,2rem)]">
              Connexion
            </h1>

            <p className="mt-2 text-white/60 text-sm md:text-base leading-relaxed">
              Accédez à votre espace privé
            </p>

            {error && (
              <div className="mt-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Google */}
            <div className="mt-8">
              <button
                onClick={signInWithGoogle}
                disabled={loadingGoogle}
                className="
                  w-full
                  flex items-center justify-center gap-3
                  border border-white/20
                  py-3
                  text-xs sm:text-sm
                  tracking-widest uppercase
                  hover:bg-white hover:text-black
                  transition-all duration-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
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
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    w-full bg-transparent
                    border border-white/20
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-white/60
                    transition
                  "
                />

                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full bg-transparent
                    border border-white/20
                    px-4 py-3
                    text-sm
                    outline-none
                    focus:border-white/60
                    transition
                  "
                />

                <button
                  onClick={signInWithEmail}
                  disabled={loadingEmail}
                  className="
                    w-full
                    bg-white text-black
                    py-3
                    text-xs sm:text-sm
                    tracking-widest uppercase
                    hover:opacity-85
                    transition
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {loadingEmail ? "Connexion..." : "Se connecter"}
                </button>

                <a
                  href="/signup"
                  className="
                    block text-center
                    text-[10px] sm:text-xs
                    tracking-[0.3em] uppercase
                    text-white/60 hover:text-white
                    transition
                    pt-4
                  "
                >
                  Pas de compte ? Créer un compte →
                </a>
              </div>
            </div>
          </motion.div>

          {/* Petit rappel bas de page (sur mobile c’est cool) */}
          <p className="mt-8 text-center text-white/30 text-xs leading-relaxed px-2">
            En continuant, vous acceptez que vos commentaires soient visibles publiquement sur les articles.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}