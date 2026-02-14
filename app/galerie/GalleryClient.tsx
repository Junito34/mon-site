"use client";

import { useMemo, useState, useEffect } from "react";
import Pagination from "@/components/Pagination";

import ModeSwitch from "@/components/ui/ModeSwitch";
import AICheckbox from "@/components/ui/AICheckbox";
import SearchInput from "@/components/ui/SearchInput";
import MediaGrid from "@/components/ui/MediaGrid";
import MediaLightbox from "@/components/ui/MediaLightbox";

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
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">
              Galerie
            </h1>
            <p className="mt-4 text-white/60 text-sm md:text-base">
              Photos & vidéos. Lecture uniquement au clic.
            </p>
          </div>

          {/* Controls */}
          <div className="w-full md:w-[920px]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
              <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Rechercher…"
                count={filtered.length}
              />

              {mode === "videos" && (
                <AICheckbox checked={iaEnabled} onChange={setIaEnabled} label="✨ IA améliorée" />
              )}

              <ModeSwitch value={mode} onChange={setMode} />
            </div>
          </div>
        </div>

        {/* Pagination label */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="text-xs tracking-[0.35em] uppercase text-white/50">
            Page {page} / {totalPages}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8 border-t border-white/10 pt-10">
          <MediaGrid mode={mode} items={paged} onSelect={setSelectedIndex} />

          <div className="mt-12">
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