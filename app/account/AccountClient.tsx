"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

type Initial = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "user";
  avatar_url: string | null;
  created_at: string | null;
};

export default function AccountClient({ initial }: { initial: Initial }) {
  const supabase = createClient();

  const [name, setName] = useState(initial.full_name);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setErr(null);
    setMsg(null);

    const clean = name.trim();
    if (!clean) {
      setErr("Le nom ne peut pas être vide.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: clean })
      .eq("id", initial.id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setMsg("Modifications enregistrées.");
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border border-white/10 bg-white/5 backdrop-blur-sm p-10 rounded-sm"
        >
          <div className="flex items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-wide">
                Mes informations
              </h1>
              <p className="mt-3 text-white/60 text-sm md:text-base">
                Ton profil est lié à ta session Supabase.
              </p>
            </div>

            {initial.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={initial.avatar_url}
                alt="Avatar"
                className="w-14 h-14 rounded-full opacity-90"
              />
            ) : (
              <div className="w-14 h-14 rounded-full border border-white/15 bg-white/5" />
            )}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6">
            {/* Email (readonly) */}
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-white/50">
                Email
              </div>
              <div className="mt-2 border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
                {initial.email}
              </div>
            </div>

            {/* Role (readonly) */}
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-white/50">
                Rôle
              </div>
              <div className="mt-2 inline-flex items-center gap-2 border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
                <span className="tracking-widest uppercase">
                  {initial.role}
                </span>
                {initial.role === "admin" && (
                  <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-white/20 bg-white/10 text-white/80">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Nom (editable) */}
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-white/50">
                Nom affiché
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ton nom"
                className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={save}
                  disabled={saving}
                  className="border border-white/20 px-5 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>

            {/* Messages */}
            {(msg || err) && (
              <div
                className={`border px-4 py-3 text-sm ${
                  err
                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
                }`}
              >
                {err ?? msg}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
