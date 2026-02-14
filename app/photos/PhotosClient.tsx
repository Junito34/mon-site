"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type PhotoItem = {
  src: string;
  name: string;
};

export default function PhotosClient({ images }: { images: PhotoItem[] }) {
  const [q, setQ] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return images;
    return images.filter((img) => img.name.toLowerCase().includes(s));
  }, [q, images]);

  const selected = selectedIndex !== null ? filtered[selectedIndex] : null;

  const canPrev = selectedIndex !== null && selectedIndex > 0;
  const canNext = selectedIndex !== null && selectedIndex < filtered.length - 1;

  const nextPhoto = () => {
    if (selectedIndex === null) return;
    if (selectedIndex < filtered.length - 1) setSelectedIndex(selectedIndex + 1);
  };

  const prevPhoto = () => {
    if (selectedIndex === null) return;
    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  // Quand on change la recherche: si lightbox ouvert, on ferme (évite incohérences)
  useEffect(() => {
    setSelectedIndex(null);
  }, [q]);

  // Clavier : ESC + flèches
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "Escape") setSelectedIndex(null);

      if (e.key === "ArrowRight") {
        // droite => suivante
        if (canNext) setSelectedIndex((i) => (i === null ? null : i + 1));
      }

      if (e.key === "ArrowLeft") {
        // gauche => précédente
        if (canPrev) setSelectedIndex((i) => (i === null ? null : i - 1));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, canNext, canPrev]);

  return (
    <>
      <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-light tracking-wide">
                Photos
              </h1>
              <p className="mt-4 text-white/60 text-sm md:text-base">
                Une galerie simple, lisible, et rapide à parcourir.
              </p>
            </div>

            {/* Search */}
            <div className="w-full md:w-[420px]">
              <div className="border border-white/15 bg-white/5 backdrop-blur-sm px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Rechercher par nom de fichier…"
                    className="w-full bg-transparent outline-none text-sm placeholder:text-white/30"
                  />
                  <span className="text-xs tracking-widest uppercase text-white/40">
                    {filtered.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Pinterest */}
          <div className="mt-14 border-t border-white/10 pt-10">
            {filtered.length === 0 ? (
              <p className="text-white/40 text-sm">
                Aucun résultat. Essaie un autre mot-clé.
              </p>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
                {filtered.map((img, i) => (
                  <button
                    key={img.src}
                    onClick={() => setSelectedIndex(i)}
                    className="mb-5 w-full text-left break-inside-avoid cursor-pointer"
                  >
                    <div className="relative w-full overflow-hidden border border-white/10 bg-white/5">
                      {/* Aspect auto via Image + width/height => Next calcule */}
                      <Image
                        src={img.src}
                        alt={img.name}
                        width={1200}
                        height={800}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />

                      {/* Hover */}
                      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition bg-black/30" />

                      {/* Filename discret */}
                      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent">
                        <div className="text-[11px] tracking-[0.25em] uppercase text-white/70 truncate">
                          {img.name}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Image fullscreen */}
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-[92vw] h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selected.src}
                alt={selected.name}
                fill
                className="object-contain"
                priority
              />

              {/* Nom discret */}
              <div className="absolute bottom-4 right-4 text-[11px] tracking-[0.35em] uppercase text-white/60">
                {selected.name}
              </div>
            </motion.div>

            {/* Close */}
            <button
              className="absolute top-6 right-8 text-white text-3xl font-light hover:opacity-60 transition"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
            >
              ×
            </button>

            {/* Prev (gauche) */}
            {canPrev && (
              <button
                className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-4xl font-light hover:opacity-60 transition z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                aria-label="Photo précédente"
              >
                ‹
              </button>
            )}

            {/* Next (droite) */}
            {canNext && (
              <button
                className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-4xl font-light hover:opacity-60 transition z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                aria-label="Photo suivante"
              >
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}