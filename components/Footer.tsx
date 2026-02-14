"use client";

import { useEffect, useState } from "react";

export default function Footer() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-black text-white border-t border-white/10 px-4 sm:px-6 md:px-10 py-12 md:py-20">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-light tracking-wide">
            Jonathan Denis-Quanquin
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-white/50 leading-relaxed max-w-[50ch]">
            Un espace de mémoire, de photos, de mots, et de liens qui restent.
          </p>
        </div>

        <div className="text-white/50 text-xs sm:text-sm tracking-wide">
          © {year ?? "—"} Anthony Quattrochi
        </div>
      </div>
    </footer>
  );
}