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
  // dates/2009/13-juin -> 2009
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
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">
              Mes commentaires
            </h1>
            <p className="mt-4 text-white/60 text-sm md:text-base">
              Tous tes commentaires, du plus récent au plus ancien. Clique pour
              retrouver le commentaire dans l’article.
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

        <div className="mt-14 border-t border-white/10 pt-10">
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
            <ul className="space-y-4">
              {paged.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.href}
                    className="block border border-white/10 bg-white/5 hover:bg-white/10 transition px-6 py-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-xs tracking-[0.3em] uppercase text-white/50">
                          {c.year} — {new Date(c.createdAt).toLocaleString("fr-FR")}
                        </div>

                        <div className="mt-2 text-sm md:text-base font-light text-white/85 line-clamp-2">
                          {c.message}
                        </div>

                        <div className="mt-2 text-xs tracking-[0.3em] uppercase text-white/40">
                          {c.articleId}
                        </div>
                      </div>

                      <div className="text-xs tracking-[0.3em] uppercase text-white/50">
                        Ouvrir →
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </main>
  );
}
