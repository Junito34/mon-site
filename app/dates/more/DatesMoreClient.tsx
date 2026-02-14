"use client";

import { useMemo, useState, useEffect } from "react";
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
  serverError: string | null;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pages;

    return pages.filter((p) => {
      return (
        p.title.toLowerCase().includes(s) ||
        p.year.toLowerCase().includes(s) ||
        (p.author?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [q, pages]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <main className="min-h-screen bg-black text-white pt-32 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-wide">
              Tous les articles
            </h1>
            <p className="mt-3 md:mt-4 text-white/60 text-sm md:text-base">
              Retrouvez ici l’ensemble des pages. Recherchez par année, titre ou auteur.
            </p>
          </div>

          {/* Search */}
          <div className="w-full md:w-[360px]">
            <SearchBar
              value={q}
              onChange={setQ}
              placeholder="Rechercher…"
              count={filtered.length}
            />
          </div>
        </div>

        {/* Server error (si besoin) */}
        {serverError && (
          <div className="mt-8 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {serverError}
          </div>
        )}

        {/* Liste */}
        <div className="mt-10 md:mt-14 border-t border-white/10 pt-8 md:pt-10">
          {paged.length === 0 ? (
            <p className="text-white/50 text-sm">
              Aucun résultat. Essayez un autre mot-clé.
            </p>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {paged.map((p) => (
                <li key={p.href}>
                  <a
                    href={p.href}
                    className="block border border-white/10 bg-white/5 hover:bg-white/10 transition px-4 sm:px-6 py-4 sm:py-5"
                  >
                    {/* Mobile: tout en colonne, Desktop: split */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/50">
                          {p.year}
                          {p.author ? ` — ${p.author}` : ""}
                        </div>

                        <div className="mt-2 text-base sm:text-lg md:text-xl font-light text-white/85 break-words">
                          {p.title}
                        </div>
                      </div>

                      {/* “Ouvrir” : on le cache sur mobile (ça prend de la place), visible dès sm */}
                      <div className="hidden sm:block text-xs tracking-[0.3em] uppercase text-white/50 whitespace-nowrap">
                        Ouvrir →
                      </div>
                    </div>

                    {/* Mobile: petit hint en bas */}
                    <div className="sm:hidden mt-3 text-[10px] tracking-[0.35em] uppercase text-white/40">
                      Toucher pour ouvrir →
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          <div className="mt-10 md:mt-12">
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>
    </main>
  );
}