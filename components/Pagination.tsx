"use client";

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPagination(current: number, total: number) {
  // Affiche : 1 … (current-1) current (current+1) … total
  // et gère les bords proprement.
  if (total <= 7) return range(1, total);

  const pages: (number | "...")[] = [];
  pages.push(1);

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) pages.push("...");

  for (let p = left; p <= right; p++) pages.push(p);

  if (right < total - 1) pages.push("...");

  pages.push(total);
  return pages;
}

export default function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
    if (total <= 1) {
        return (
            <div className="mt-12 flex items-center justify-center gap-3 text-xs tracking-widest uppercase text-white/50 select-none">
            <button className="px-3 py-2 border border-white/10 opacity-30 pointer-events-none">‹</button>
            <span className="px-3 py-2 border border-white/10 bg-white/5">1 / 1</span>
            <button className="px-3 py-2 border border-white/10 opacity-30 pointer-events-none">›</button>
            </div>
        );
    }


  const items = getPagination(current, total);

  return (
    <div className="mt-12 flex items-center justify-center gap-3 text-xs tracking-widest uppercase text-white/70 select-none">
      {/* Prev */}
      <button
        className={`px-3 py-2 border border-white/10 hover:bg-white/10 transition ${
          current === 1 ? "opacity-30 pointer-events-none" : ""
        }`}
        onClick={() => onChange(current - 1)}
        aria-label="Page précédente"
      >
        ‹
      </button>

      {/* Pages */}
      <div className="flex items-center gap-2">
        {items.map((it, idx) =>
          it === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-white/40">
              …
            </span>
          ) : (
            <button
              key={it}
              onClick={() => onChange(it)}
              className={`px-3 py-2 border transition ${
                it === current
                  ? "border-white/50 bg-white/10"
                  : "border-white/10 hover:bg-white/10"
              }`}
              aria-label={`Page ${it}`}
            >
              {it}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        className={`px-3 py-2 border border-white/10 hover:bg-white/10 transition ${
          current === total ? "opacity-30 pointer-events-none" : ""
        }`}
        onClick={() => onChange(current + 1)}
        aria-label="Page suivante"
      >
        ›
      </button>
    </div>
  );
}
