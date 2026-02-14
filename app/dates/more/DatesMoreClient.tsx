"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

type PageLink = {
  title: string;
  href: string;
  year: string;
  author?: string;
  publishedDate?: string | null;
};

const PAGE_SIZE = 10;

export default function DatesMoreClient({
  pages,
  serverError,
}: {
  pages: PageLink[];
  serverError?: string | null;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // tri : récent -> ancien (année puis date)
  const sorted = useMemo(() => {
    const copy = [...pages];
    copy.sort((a, b) => {
      const ay = parseInt(a.year, 10);
      const by = parseInt(b.year, 10);
      if (by !== ay) return by - ay;

      const ad = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const bd = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return bd - ad;
    });
    return copy;
  }, [pages]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return sorted;

    return sorted.filter((p) => {
      return (
        p.title.toLowerCase().includes(s) ||
        p.year.toLowerCase().includes(s) ||
        (p.author?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [q, sorted]);

  useEffect(() => setPage(1), [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">
              Tous les articles
            </h1>
            <p className="mt-4 text-white/60 text-sm md:text-base">
              Retrouvez ici l’ensemble des articles. Recherchez par année, titre ou auteur.
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

        {serverError && (
          <div className="mt-10 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {serverError}
          </div>
        )}

        {/* Liste */}
        <div className="mt-14 border-t border-white/10 pt-10">
          {paged.length === 0 ? (
            <p className="text-white/50">Aucun résultat. Essayez un autre mot-clé.</p>
          ) : (
            <ul className="space-y-4">
              {paged.map((p) => (
                <li key={p.href}>
                  <a
                    href={p.href}
                    className="block border border-white/10 bg-white/5 hover:bg-white/10 transition px-6 py-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-xs tracking-[0.3em] uppercase text-white/50">
                          {p.year}
                          {p.author ? ` — ${p.author}` : ""}
                        </div>
                        <div className="mt-2 text-lg md:text-xl font-light text-white/85">
                          {p.title}
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