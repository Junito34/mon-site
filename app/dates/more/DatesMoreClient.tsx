"use client";

import { useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";

type PageLink = {
  title: string;
  href: string;
  year: string;
  author?: string;
};

export default function DatesMoreClient({ pages }: { pages: PageLink[] }) {
  const [q, setQ] = useState("");

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
              Retrouvez ici l’ensemble des pages. Recherchez par année, titre ou auteur.
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
          {filtered.length === 0 ? (
            <p className="text-white/50">Aucun résultat. Essayez un autre mot-clé.</p>
          ) : (
            <ul className="space-y-4">
              {filtered.map((p) => (
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
        </div>
      </div>
    </main>
  );
}
