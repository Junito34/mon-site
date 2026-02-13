"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
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
        <h1 className="text-3xl font-light mb-2 tracking-wide">
          Connexion
        </h1>

        <p className="text-white/60 text-sm mb-8">
          Accédez à votre espace privé
        </p>

        {/* Bouton Google */}
        <button
          className="w-full flex items-center justify-center gap-3 border border-white/20 py-3 text-sm tracking-wide hover:bg-white hover:text-black transition-all duration-500"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            width={18}
            height={18}
          />
          Continuer avec Google
        </button>

        <div className="my-8 border-t border-white/10" />

        {/* Option email */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm outline-none focus:border-white transition"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full bg-transparent border border-white/20 px-4 py-3 text-sm outline-none focus:border-white transition"
          />

          <button className="w-full bg-white text-black py-3 text-sm tracking-wide hover:opacity-80 transition">
            Se connecter
          </button>
        </div>
      </motion.div>

    </main>
    <Footer />
    </>
  );
}
