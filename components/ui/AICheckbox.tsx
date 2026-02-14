"use client";

export default function AICheckbox({
  checked,
  onChange,
  label = "✨ IA améliorée",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <label className="h-12 flex items-center gap-3 border border-white/15 bg-white/5 backdrop-blur-sm px-4 rounded-sm hover:bg-white/10 transition cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />

      <div className="w-5 h-5 border border-white/30 bg-white/5 flex items-center justify-center transition peer-checked:bg-white peer-checked:border-white">
        <svg
          className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100 transition"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.42 0l-3.2-3.2a1 1 0 111.42-1.42l2.49 2.49 6.49-6.49a1 1 0 011.42 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <span className="text-[11px] tracking-[0.35em] uppercase text-white/70">
        {label}
      </span>
    </label>
  );
}