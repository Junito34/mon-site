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
    avatar_url: string | null;
  } | null;
};

type CommentUI = {
  id: string;
  authorName: string;
  authorRole: "admin" | "user";
  authorAvatarUrl: string | null;
  message: string;
  createdAt: string;
  userId: string;
};

function formatFRStable(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  const a = parts[0]?.[0] ?? "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (a + b).toUpperCase();
}

export default function Comments({ articleId }: { articleId?: string }) {
  const supabase = createClient();
  const { user } = useAuth();
  const pathname = usePathname();

  // ✅ Canonical ID "stable" pour éviter les mismatches :
  // - si articleId est fourni => on l’utilise
  // - sinon, on le calcule APRÈS montage depuis pathname
  const [canonicalArticleId, setCanonicalArticleId] = useState(
    (articleId ?? "").replace(/^\//, "")
  );

  useEffect(() => {
    if (articleId) {
      setCanonicalArticleId(articleId.replace(/^\//, ""));
      return;
    }
    // fallback client-only
    setCanonicalArticleId((pathname ?? "").replace(/^\//, ""));
  }, [articleId, pathname]);

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

  const fetchComments = async (id: string) => {
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
          role,
          avatar_url
        )
      `
      )
      .eq("article_id", id)
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
      authorAvatarUrl: r.profiles?.avatar_url ?? null,
      message: r.content,
      createdAt: r.created_at,
    }));

    setComments(mapped);
    setLoading(false);
  };

  // ✅ fetch quand on a un canonicalArticleId valide
  useEffect(() => {
    if (!canonicalArticleId) return;
    fetchComments(canonicalArticleId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalArticleId]);

  // ✅ Realtime : subscribe seulement si id OK
  useEffect(() => {
    if (!canonicalArticleId) return;

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
        () => fetchComments(canonicalArticleId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalArticleId]);

  // ✅ Highlight + scroll smooth (client-only)
  useEffect(() => {
    if (!canonicalArticleId) return;
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
    if (!canonicalArticleId) return;

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

    // au cas où realtime lag
    fetchComments(canonicalArticleId);
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
    if (canonicalArticleId) fetchComments(canonicalArticleId);
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

    if (canonicalArticleId) fetchComments(canonicalArticleId);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-xl md:text-2xl font-light tracking-wide">
          Commentaires
        </h3>

        <span
          className="text-[10px] sm:text-xs tracking-widest uppercase text-white/50 break-words"
          suppressHydrationWarning
        >
          Article: {canonicalArticleId}
        </span>
      </div>

      {/* Form */}
      <div className="mt-6 sm:mt-8 border-t border-white/10 pt-6 sm:pt-8">
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
                disabled={posting || !canonicalArticleId}
                className="border border-white/20 px-5 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {posting ? "Publication..." : "Publier"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste */}
      <div className="mt-8 sm:mt-10 space-y-4">
        {loading ? (
          <p className="text-white/40 text-sm">Chargement…</p>
        ) : sorted.length === 0 ? (
          <p className="text-white/40 text-sm">
            Aucun commentaire pour l’instant.
          </p>
        ) : (
          sorted.map((c) => {
            const editable = canModerate(c);
            const isEditing = editingId === c.id;
            const highlighted = highlightId === c.id;

            return (
              <div
                id={`comment-${c.id}`}
                key={c.id}
                className={`border border-white/10 bg-white/5 backdrop-blur-sm px-4 sm:px-5 py-4 transition ${
                  highlighted ? "ring-1 ring-white/40 bg-white/10" : ""
                }`}
              >
                {/* Header responsive */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar */}
                    {c.authorAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.authorAvatarUrl}
                        alt=""
                        className="w-9 h-9 rounded-full border border-white/10 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-[11px] tracking-widest uppercase text-white/70 shrink-0">
                        {initials(c.authorName)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-xs tracking-widest uppercase text-white/80 break-words">
                          {c.authorName}
                        </div>

                        {c.authorRole === "admin" && (
                          <span className="text-[10px] tracking-widest uppercase px-2 py-1 border border-white/20 bg-white/10 text-white/80">
                            Admin
                          </span>
                        )}
                      </div>

                      <div
                        className="mt-1 text-xs text-white/40"
                        suppressHydrationWarning
                      >
                        {formatFRStable(c.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {editable && !isEditing && (
                    <div className="flex flex-wrap gap-3 sm:justify-end">
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

                    <div className="flex flex-col sm:flex-row justify-end gap-3">
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