"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import { createClient } from "@/lib/supabase/client";

type Row = {
  id: string;
  content: string;
  created_at: string;
  article_id: string; // ex: "dates/2009/13-juin"
};

type Item = {
  id: string;
  message: string;
  createdAt: string;
  articleId: string;
  href: string;
  year: string;
};

const PAGE_SIZE = 10;

function extractYear(articleId: string, createdAt: string) {
  const clean = articleId.replace(/^\//, "");
  const parts = clean.split("/");
  if (parts[0] === "dates" && parts[1] && /^\d{4}$/.test(parts[1])) return parts[1];
  return new Date(createdAt).getFullYear().toString();
}

export default function PostsClient({ userId }: { userId: string }) {
  const supabase = createClient();

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      return (
        r.message.toLowerCase().includes(s) ||
        r.articleId.toLowerCase().includes(s) ||
        r.year.toLowerCase().includes(s)
      );
    });
  }, [q, rows]);

  useEffect(() => setPage(1), [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const fetchMine = async () => {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("comments")
      .select("id, content, created_at, article_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    const items: Item[] = (data as Row[]).map((r) => {
      const cleanArticle = r.article_id.replace(/^\//, "");
      const year = extractYear(cleanArticle, r.created_at);

      return {
        id: r.id,
        message: r.content,
        createdAt: r.created_at,
        articleId: cleanArticle,
        year,
        href: `/${cleanArticle}#comment-${r.id}`,
      };
    });

    setRows(items);
    setLoading(false);
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <main className="min-h-screen bg-black text-white pt-28 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-6 md:gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">
              Mes commentaires
            </h1>
            <p className="mt-3 md:mt-4 text-white/60 text-sm md:text-base">
              Tous tes commentaires, du plus récent au plus ancien. Clique pour retrouver le
              commentaire dans l’article.
            </p>
          </div>

          <div className="w-full md:w-90">
            <SearchBar
              value={q}
              onChange={setQ}
              placeholder="Rechercher…"
              count={filtered.length}
            />
          </div>
        </div>

        <div className="mt-10 md:mt-14 border-t border-white/10 pt-8 md:pt-10">
          {err && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {err}
            </div>
          )}

          {loading ? (
            <p className="text-white/40 text-sm">Chargement…</p>
          ) : paged.length === 0 ? (
            <p className="text-white/50">Aucun commentaire trouvé.</p>
          ) : (
            <ul className="space-y-3 md:space-y-4">
              {paged.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.href}
                    className="block border border-white/10 bg-white/5 hover:bg-white/10 transition px-4 sm:px-6 py-4 sm:py-5"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Top meta */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="text-[11px] sm:text-xs tracking-[0.3em] uppercase text-white/50">
                          {c.year} — {new Date(c.createdAt).toLocaleString("fr-FR")}
                        </div>

                        {/* CTA : caché sur mobile, visible à partir de sm */}
                        <div className="hidden sm:block text-xs tracking-[0.3em] uppercase text-white/50">
                          Ouvrir →
                        </div>
                      </div>

                      {/* Message */}
                      <div className="text-sm md:text-base font-light text-white/85 leading-relaxed line-clamp-3">
                        {c.message}
                      </div>

                      {/* Article id */}
                      <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/40 break-all">
                        {c.articleId}
                      </div>

                      {/* CTA mobile */}
                      <div className="sm:hidden text-[11px] tracking-[0.3em] uppercase text-white/50 pt-1">
                        Ouvrir →
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 md:mt-10">
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </main>
  );
}