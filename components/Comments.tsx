"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Comment = {
  id: string;
  authorName: string;
  authorRole: "admin" | "user";
  message: string;
  createdAt: string; // ISO
};

export default function Comments({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const sorted = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [comments]
  );

  const submit = () => {
    if (!user) return;
    const clean = message.trim();
    if (!clean) return;

    setComments((prev) => [
      {
        id: crypto.randomUUID(),
        authorName: user.name,
        authorRole: user.role,
        message: clean,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setMessage("");
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between gap-6">
        <h3 className="text-xl md:text-2xl font-light tracking-wide">
          Commentaires
        </h3>
        <span className="text-xs tracking-widest uppercase text-white/50">
          Article: {articleId}
        </span>
      </div>

      <div className="mt-8 border-t border-white/10 pt-8">
        {!user ? (
          <div className="text-white/60 text-sm">
            Connecte-toi pour ajouter un commentaire.
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrire un commentaire…"
              className="w-full min-h-[110px] bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
            />
            <div className="flex justify-end">
              <button
                onClick={submit}
                className="border border-white/20 px-5 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
              >
                Publier
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="mt-10 space-y-4">
        {sorted.length === 0 ? (
          <p className="text-white/40 text-sm">Aucun commentaire pour l’instant.</p>
        ) : (
          sorted.map((c) => (
            <div
              key={c.id}
              className="border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="text-xs tracking-widest uppercase text-white/70">
                  {c.authorName}
                  {c.authorRole === "admin" ? " — Admin" : ""}
                </div>
                <div className="text-xs text-white/40">
                  {new Date(c.createdAt).toLocaleString("fr-FR")}
                </div>
              </div>
              <p className="mt-3 text-sm text-white/80 leading-relaxed">
                {c.message}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
