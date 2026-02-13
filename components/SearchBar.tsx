"use client";

export default function SearchBar({
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
    <div className="w-full">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40 transition"
      />
      {typeof count === "number" && (
        <div className="mt-2 text-xs text-white/40 tracking-widest uppercase">
          {count} résultat{count > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
