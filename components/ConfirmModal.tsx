"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  // ESC ferme / Enter confirme
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") onConfirm();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onConfirm]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay bg-black/70 backdrop-blur-md flex items-center justify-center px-6"
          onMouseDown={onClose}
        >
          {/* Surface (opaque) */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="modal-surface w-full max-w-lg border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
          >
            <div className="p-8">
              {/* Header */}
              <div className="text-xs tracking-[0.35em] uppercase text-white/40">
                Confirmation
              </div>

              <h3 className="mt-3 text-2xl font-light tracking-wide text-white/90">
                {title}
              </h3>

              {description && (
                <p className="mt-4 text-sm md:text-base text-white/60 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Actions */}
              <div className="mt-10 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="border border-white/20 px-5 py-2 text-xs tracking-widest uppercase hover:bg-white/10 transition disabled:opacity-50"
                >
                  {cancelLabel}
                </button>

                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`border px-5 py-2 text-xs tracking-widest uppercase transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    danger
                      ? "border-red-500/40 hover:bg-red-500 hover:text-black"
                      : "border-white/20 hover:bg-white hover:text-black"
                  }`}
                >
                  {loading ? "..." : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}