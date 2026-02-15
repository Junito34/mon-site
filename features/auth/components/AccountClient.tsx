"use client";

import { useMemo, useState } from "react";
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

const BUCKET = "avatars";

function extFromFile(file: File) {
  const parts = file.name.split(".");
  const ext = parts[parts.length - 1]?.toLowerCase();
  return ext && ext.length <= 5 ? ext : "jpg";
}

function extractStoragePathFromPublicUrl(publicUrl: string, bucket: string) {
  // .../storage/v1/object/public/<bucket>/<path>
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export default function AccountClient({ initial }: { initial: Initial }) {
  const supabase = createClient();

  // ---- profil
  const [name, setName] = useState(initial.full_name);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // ---- avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const displayPreview = useMemo(() => avatarPreview || avatarUrl, [avatarPreview, avatarUrl]);

  const pickAvatar = (file: File | null) => {
    setErr(null);
    setMsg(null);

    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    if (file) setAvatarPreview(URL.createObjectURL(file));
    else setAvatarPreview(null);
  };

  const saveProfile = async () => {
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

  const uploadAvatar = async () => {
    if (!avatarFile) return;

    setErr(null);
    setMsg(null);
    setAvatarBusy(true);

    try {
      // (Optionnel) supprime l’ancien fichier si on a une URL
      if (avatarUrl) {
        const oldPath = extractStoragePathFromPublicUrl(avatarUrl, BUCKET);
        if (oldPath) {
          // remove accepte aussi si le fichier existe pas -> mais selon config ça peut throw
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      const ext = extFromFile(avatarFile);
      const path = `${initial.id}/avatar.${ext}`;

      const up = await supabase.storage.from(BUCKET).upload(path, avatarFile, {
        upsert: true,
        cacheControl: "3600",
        contentType: avatarFile.type || undefined,
      });

      if (up.error) throw up.error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", initial.id);

      if (dbErr) throw dbErr;

      setAvatarUrl(publicUrl);
      setMsg("Photo de profil mise à jour.");
      pickAvatar(null);
    } catch (e: any) {
      setErr(e?.message ?? "Impossible d’uploader l’image.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const deleteAvatar = async () => {
    if (!avatarUrl) return;

    setErr(null);
    setMsg(null);
    setAvatarBusy(true);

    try {
      const path = extractStoragePathFromPublicUrl(avatarUrl, BUCKET);
      if (path) {
        const { error: sErr } = await supabase.storage.from(BUCKET).remove([path]);
        if (sErr) throw sErr;
      }

      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", initial.id);

      if (dbErr) throw dbErr;

      setAvatarUrl(null);
      pickAvatar(null);
      setMsg("Photo supprimée.");
    } catch (e: any) {
      setErr(e?.message ?? "Impossible de supprimer la photo.");
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-32 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 md:p-10 rounded-sm"
        >
          {/* Header responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">
                Mes informations
              </h1>
              <p className="mt-3 text-white/60 text-sm md:text-base">
                Ton profil est lié à ta session Supabase.
              </p>
            </div>

            {/* Avatar bloc */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/15 bg-white/5">
                {displayPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={displayPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover opacity-95"
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition cursor-pointer text-center">
                  {avatarUrl ? "Changer" : "Ajouter"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => pickAvatar(e.target.files?.[0] ?? null)}
                    disabled={avatarBusy}
                  />
                </label>

                {avatarUrl && (
                  <button
                    onClick={deleteAvatar}
                    disabled={avatarBusy}
                    className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white/10 transition disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Upload CTA si fichier choisi */}
          {avatarFile && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-white/10 bg-black/30 px-4 py-3">
              <div className="text-xs tracking-widest uppercase text-white/60 break-words">
                Fichier prêt : <span className="text-white/80">{avatarFile.name}</span>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => pickAvatar(null)}
                  disabled={avatarBusy}
                  className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white/10 transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={uploadAvatar}
                  disabled={avatarBusy}
                  className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition disabled:opacity-50"
                >
                  {avatarBusy ? "Upload..." : "Enregistrer photo"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 gap-6">
            {/* Email */}
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-white/50">Email</div>
              <div className="mt-2 border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80 break-words">
                {initial.email}
              </div>
            </div>

            {/* Role */}
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-white/50">Rôle</div>
              <div className="mt-2 inline-flex flex-wrap items-center gap-2 border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/80">
                <span className="tracking-widest uppercase">{initial.role}</span>
                {initial.role === "admin" && (
                  <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-white/20 bg-white/10 text-white/80">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Nom */}
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-white/50">Nom affiché</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ton nom"
                className="mt-2 w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={saveProfile}
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