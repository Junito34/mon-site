"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    role: "admin" | "user" | null;
  } | null;
};

type CommentUI = {
  id: string;
  authorName: string;
  authorRole: "admin" | "user";
  message: string;
  createdAt: string;
  userId: string;
};

export default function Comments({ articleId }: { articleId?: string }) {
  const supabase = createClient();
  const { user } = useAuth();

  const pathname = usePathname();
  const canonicalArticleId = (articleId ?? pathname).replace(/^\//, "");

  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<CommentUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Highlight (arrivée depuis /posts -> #comment-xxx ou ?comment=xxx)
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Edition
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const sorted = useMemo(
    () =>
      [...comments].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [comments]
  );

  const canModerate = (c: CommentUI) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.id === c.userId;
  };

  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        content,
        created_at,
        user_id,
        profiles:profiles (
          full_name,
          role
        )
      `
      )
      .eq("article_id", canonicalArticleId)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setComments([]);
      setLoading(false);
      return;
    }

    const mapped: CommentUI[] = (data as unknown as CommentRow[]).map((r) => ({
      id: r.id,
      userId: r.user_id,
      authorName: r.profiles?.full_name || "Utilisateur",
      authorRole: r.profiles?.role === "admin" ? "admin" : "user",
      message: r.content,
      createdAt: r.created_at,
    }));

    setComments(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalArticleId]);

  // ✅ Realtime: refresh dès qu'il se passe quelque chose sur cet article
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${canonicalArticleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `article_id=eq.${canonicalArticleId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalArticleId]);

  // ✅ Highlight + scroll smooth
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fromQuery = new URLSearchParams(window.location.search).get("comment");
    const fromHash =
      window.location.hash?.startsWith("#comment-")
        ? window.location.hash.replace("#comment-", "")
        : null;

    const target = fromQuery || fromHash;
    if (!target) return;

    setHighlightId(target);

    const t = window.setTimeout(() => {
      const el = document.getElementById(`comment-${target}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);

    const t2 = window.setTimeout(() => setHighlightId(null), 4500);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [loading, canonicalArticleId]);

  const submit = async () => {
    if (!user) return;
    const clean = message.trim();
    if (!clean) return;

    setPosting(true);
    setError(null);

    const { error } = await supabase.from("comments").insert({
      article_id: canonicalArticleId,
      user_id: user.id,
      content: clean,
    });

    if (error) {
      setError(error.message);
      setPosting(false);
      return;
    }

    setMessage("");
    setPosting(false);

    // Au cas où realtime n’est pas dispo
    fetchComments();
  };

  const startEdit = (c: CommentUI) => {
    setEditingId(c.id);
    setEditingValue(c.message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const saveEdit = async (id: string) => {
    const clean = editingValue.trim();
    if (!clean) return;

    setError(null);

    const { error } = await supabase
      .from("comments")
      .update({ content: clean })
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    cancelEdit();
    fetchComments();
  };

  const deleteComment = async (id: string) => {
    setError(null);

    const ok = window.confirm("Supprimer ce commentaire ?");
    if (!ok) return;

    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    fetchComments();
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between gap-6">
        <h3 className="text-xl md:text-2xl font-light tracking-wide">
          Commentaires
        </h3>
        <span className="text-xs tracking-widest uppercase text-white/50">
          Article: {canonicalArticleId}
        </span>
      </div>

      {/* Form */}
      <div className="mt-8 border-t border-white/10 pt-8">
        {error && (
          <div className="mb-5 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

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
                disabled={posting}
                className="border border-white/20 px-5 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? "Publication..." : "Publier"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="mt-10 space-y-4">
        {loading ? (
          <p className="text-white/40 text-sm">Chargement…</p>
        ) : sorted.length === 0 ? (
          <p className="text-white/40 text-sm">Aucun commentaire pour l’instant.</p>
        ) : (
          sorted.map((c) => {
            const editable = canModerate(c);
            const isEditing = editingId === c.id;
            const highlighted = highlightId === c.id;

            return (
              <div
                id={`comment-${c.id}`}
                key={c.id}
                className={`border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 transition ${
                  highlighted ? "ring-1 ring-white/40 bg-white/10" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xs tracking-widest uppercase text-white/70">
                      {c.authorName}
                    </div>

                    {c.authorRole === "admin" && (
                      <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-white/20 bg-white/10 text-white/80">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-xs text-white/40">
                      {new Date(c.createdAt).toLocaleString("fr-FR")}
                    </div>

                    {editable && !isEditing && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEdit(c)}
                          className="text-xs tracking-widest uppercase text-white/60 hover:text-white transition"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="text-xs tracking-widest uppercase text-white/60 hover:text-white transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing ? (
                  <p className="mt-3 text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {c.message}
                  </p>
                ) : (
                  <div className="mt-3 space-y-3">
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full min-h-[110px] bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={cancelEdit}
                        className="border border-white/20 px-5 py-2 text-xs tracking-widest uppercase hover:bg-white/10 transition"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => saveEdit(c.id)}
                        className="border border-white/20 px-5 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
