"use client";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher…",
  count,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  count?: number;
}) {
  return (
    <div className="h-12 flex-1 md:flex-none md:w-[420px] border border-white/15 bg-white/5 backdrop-blur-sm px-4 rounded-sm flex items-center">
      <div className="flex w-full items-center justify-between gap-4">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm placeholder:text-white/30"
        />
        {typeof count === "number" && (
          <span className="text-xs tracking-widest uppercase text-white/40">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}