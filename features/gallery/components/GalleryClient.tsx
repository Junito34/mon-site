"use client";

import { useMemo, useState, useEffect } from "react";
import Pagination from "@/components/ui/Pagination";

import ModeSwitch from "@/components/ui/ModeSwitch";
import AICheckbox from "@/components/ui/AICheckbox";
import SearchInput from "@/components/ui/SearchInput";
import MediaGrid from "@/features/gallery/components/MediaGrid";
import MediaLightbox from "@/features/gallery/components/MediaLightbox";

type Mode = "photos" | "videos";
const PAGE_SIZE = 10;

export default function GalleryClient({
  photos,
  videos,
  iaVideos,
}: {
  photos: string[];
  videos: string[];
  iaVideos: string[];
}) {
  const [mode, setMode] = useState<Mode>("photos");
  const [iaEnabled, setIaEnabled] = useState(false);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // reset IA dès qu’on quitte Vidéos + reset pagination/sélection
  useEffect(() => {
    if (mode !== "videos") setIaEnabled(false);
    setPage(1);
    setSelectedIndex(null);
  }, [mode]);

  // reset pagination/sélection quand IA change
  useEffect(() => {
    setPage(1);
    setSelectedIndex(null);
  }, [iaEnabled]);

  const items = useMemo(() => {
    if (mode === "photos") return photos;
    return iaEnabled ? iaVideos : videos;
  }, [mode, iaEnabled, photos, videos, iaVideos]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((src) => src.toLowerCase().includes(s));
  }, [q, items]);

  useEffect(() => {
    setPage(1);
    setSelectedIndex(null);
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const selected = selectedIndex !== null ? paged[selectedIndex] : null;

  const nextItem = () => {
    if (selectedIndex === null) return;
    if (selectedIndex < paged.length - 1) setSelectedIndex(selectedIndex + 1);
  };

  const prevItem = () => {
    if (selectedIndex === null) return;
    if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
  };

  // clavier
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight") nextItem();
      if (e.key === "ArrowLeft") prevItem();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, paged.length]);

  const canPrev = selectedIndex !== null && selectedIndex > 0;
  const canNext = selectedIndex !== null && selectedIndex < paged.length - 1;

  return (
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 pt-28 sm:pt-32 md:pt-40 pb-16 md:pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h1 className="font-light tracking-wide text-[clamp(2rem,7vw,3rem)]">
              Galerie
            </h1>
            <p className="mt-3 text-white/60 text-sm sm:text-base leading-relaxed">
              Photos & vidéos. Lecture uniquement au clic.
            </p>
          </div>

          {/* Controls */}
          <div className="w-full md:w-[920px]">
            {/* Mobile: stack + row IA/switch */}
            <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-end">
              <div className="w-full md:w-auto md:flex-1">
                <SearchInput
                  value={q}
                  onChange={setQ}
                  placeholder="Rechercher…"
                  count={filtered.length}
                />
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end flex-wrap">
                {mode === "videos" && (
                  <AICheckbox
                    checked={iaEnabled}
                    onChange={setIaEnabled}
                    label="✨ IA améliorée"
                  />
                )}

                <ModeSwitch value={mode} onChange={setMode} />
              </div>
            </div>
          </div>
        </div>

        {/* Pagination label */}
        <div className="mt-8 sm:mt-10 flex items-center justify-between gap-4">
          <div className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-white/45">
            Page {page} / {totalPages}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6 sm:mt-8 border-t border-white/10 pt-8 sm:pt-10">
          <MediaGrid mode={mode} items={paged} onSelect={setSelectedIndex} />

          <div className="mt-10 sm:mt-12">
            <Pagination current={page} total={totalPages} onChange={setPage} />
          </div>
        </div>
      </div>

      <MediaLightbox
        open={!!selected}
        mode={mode}
        src={selected}
        canPrev={canPrev}
        canNext={canNext}
        onClose={() => setSelectedIndex(null)}
        onPrev={prevItem}
        onNext={nextItem}
      />
    </main>
  );
}