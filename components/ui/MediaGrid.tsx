"use client";

import Image from "next/image";

type Mode = "photos" | "videos";

export default function MediaGrid({
  mode,
  items,
  onSelect,
}: {
  mode: Mode;
  items: string[];
  onSelect: (index: number) => void;
}) {
  if (items.length === 0) {
    return <p className="text-white/40 text-sm">Aucun résultat.</p>;
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
      {items.map((src, i) => (
        <button
          key={src}
          onClick={() => onSelect(i)}
          className="mb-5 w-full text-left break-inside-avoid cursor-pointer group"
        >
          <div className="relative w-full overflow-hidden border border-white/10 bg-white/5">
            {mode === "photos" ? (
              <Image
                src={src}
                alt=""
                width={1200}
                height={800}
                className="w-full h-auto object-cover group-hover:opacity-85 transition"
                loading="lazy"
              />
            ) : (
              <div className="relative w-full">
                <video
                  src={src}
                  preload="metadata"
                  muted
                  playsInline
                  className="w-full h-auto object-cover group-hover:opacity-85 transition"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-black/55 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">▶</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}