"use client";

import { useMemo, useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";

type PageLink = {
  title: string;
  href: string;
  year: string;
  author?: string;
  date?: string; // optionnel (ex: "2009-02-12") si tu veux afficher/chercher dessus
};

const PAGE_SIZE = 10;

export default function DatesMoreClient({ pages }: { pages: PageLink[] }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pages;

    return pages.filter((p) => {
      return (
        p.title.toLowerCase().includes(s) ||
        p.year.toLowerCase().includes(s) ||
        (p.author?.toLowerCase().includes(s) ?? false) ||
        (p.date?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [q, pages]);

  // Quand on change la recherche, on revient page 1
  useEffect(() => {
    setPage(1);
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Si la liste rétrécit et que page devient invalide
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Pour un affichage plus lisible : on insère un "header année"
  // à chaque changement d'année DANS LA PAGE COURANTE.
  const pagedWithYearHeaders = useMemo(() => {
    const out: Array<{ kind: "year"; year: string } | { kind: "item"; item: PageLink }> = [];
    let lastYear: string | null = null;

    for (const item of paged) {
      if (item.year !== lastYear) {
        out.push({ kind: "year", year: item.year });
        lastYear = item.year;
      }
      out.push({ kind: "item", item });
    }
    return out;
  }, [paged]);

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">
              Toutes les dates
            </h1>
            <p className="mt-4 text-white/60 text-sm md:text-base">
              Retrouvez ici l’ensemble des pages. Recherchez par année, titre, auteur (et date si dispo).
            </p>
          </div>

          <div className="w-full md:w-[360px]">
            <SearchBar
              value={q}
              onChange={setQ}
              placeholder="Rechercher…"
              count={filtered.length}
            />
          </div>
        </div>

        {/* Liste */}
        <div className="mt-14 border-t border-white/10 pt-10">
          {paged.length === 0 ? (
            <p className="text-white/50">Aucun résultat. Essayez un autre mot-clé.</p>
          ) : (
            <ul className="space-y-4">
              {pagedWithYearHeaders.map((row, idx) => {
                if (row.kind === "year") {
                  return (
                    <li key={`year-${row.year}-${idx}`} className="pt-6">
                      <div className="text-xs tracking-[0.3em] uppercase text-white/35">
                        {row.year}
                      </div>
                    </li>
                  );
                }

                const p = row.item;

                return (
                  <li key={p.href}>
                    <a
                      href={p.href}
                      className="block border border-white/10 bg-white/5 hover:bg-white/10 transition px-6 py-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-xs tracking-[0.3em] uppercase text-white/50">
                            {/* On affiche l'auteur + date si dispo */}
                            {p.author ? ` ${p.author}` : ""}
                            {p.date ? ` — ${new Date(p.date).toLocaleDateString("fr-FR")}` : ""}
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
                );
              })}
            </ul>
          )}

          {/* Pagination */}
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </main>
  );
}
