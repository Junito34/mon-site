"use client";

type Mode = "photos" | "videos";

export default function ModeSwitch({
  value,
  onChange,
}: {
  value: Mode;
  onChange: (v: Mode) => void;
}) {
  const isPhotos = value === "photos";

  return (
    <div className="relative flex h-12 items-center border border-white/15 bg-white/5 backdrop-blur-sm rounded-full p-1 select-none">
      <div
        className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full transition-transform duration-300 ${
          isPhotos ? "translate-x-0" : "translate-x-full"
        }`}
      />
      <button
        type="button"
        onClick={() => onChange("photos")}
        className={`relative z-10 h-10 px-6 text-[11px] tracking-[0.35em] uppercase rounded-full transition ${
          isPhotos ? "text-black" : "text-white/70 hover:text-white"
        }`}
      >
        Photos
      </button>
      <button
        type="button"
        onClick={() => onChange("videos")}
        className={`relative z-10 h-10 px-6 text-[11px] tracking-[0.35em] uppercase rounded-full transition ${
          !isPhotos ? "text-black" : "text-white/70 hover:text-white"
        }`}
      >
        Vidéos
      </button>
    </div>
  );
}