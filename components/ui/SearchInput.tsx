"use client";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  count?: number;
  variant?: "full" | "compact";
  className?: string;
};

export default function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  count,
  variant = "compact",
  className = "",
}: Props) {
  const isFull = variant === "full";

  return (
    <div className={isFull ? `w-full ${className}` : className}>
      <div
        className={
          isFull
            ? "w-full"
            : "h-12 flex-1 md:flex-none md:w-[420px] border border-white/15 bg-white/5 backdrop-blur-sm px-4 rounded-sm flex items-center"
        }
      >
        <div className={isFull ? "w-full" : "flex w-full items-center justify-between gap-4"}>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={
              isFull
                ? "w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition placeholder:text-white/30"
                : "w-full bg-transparent outline-none text-sm placeholder:text-white/30"
            }
          />

          {!isFull && typeof count === "number" && (
            <span className="text-xs tracking-widest uppercase text-white/40">
              {count}
            </span>
          )}
        </div>
      </div>

      {isFull && typeof count === "number" && (
        <div className="mt-2 text-xs text-white/40 tracking-widest uppercase">
          {count} résultat{count > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}