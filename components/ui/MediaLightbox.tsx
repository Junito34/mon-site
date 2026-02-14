"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

type Mode = "photos" | "videos";

export default function MediaLightbox({
  open,
  mode,
  src,
  canPrev,
  canNext,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  mode: Mode;
  src: string | null;
  canPrev: boolean;
  canNext: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <AnimatePresence>
      {open && src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50"
          onClick={onClose}
        >
          {/* MEDIA */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-[95vw] h-[75vh] md:w-[92vw] md:h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {mode === "photos" ? (
              <Image
                src={src}
                alt=""
                fill
                className="object-contain"
                priority
              />
            ) : (
              <video
                src={src}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>

          {/* CLOSE */}
          <button
            className="absolute top-4 right-5 md:top-6 md:right-8 text-white text-3xl font-light hover:opacity-60 transition"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>

          {/* ===== DESKTOP ARROWS (sides) ===== */}
          {canPrev && (
            <button
              className="hidden md:block absolute left-8 top-1/2 -translate-y-1/2 text-white text-4xl font-light hover:opacity-60 transition z-50"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
            >
              ‹
            </button>
          )}

          {canNext && (
            <button
              className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 text-white text-4xl font-light hover:opacity-60 transition z-50"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              ›
            </button>
          )}

          {/* ===== MOBILE CONTROLS (bottom) ===== */}
          {(canPrev || canNext) && (
            <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
              {canPrev && (
                <button
                  className="w-14 h-14 rounded-full bg-black/60 border border-white/20 backdrop-blur flex items-center justify-center text-2xl text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrev();
                  }}
                >
                  ‹
                </button>
              )}

              {canNext && (
                <button
                  className="w-14 h-14 rounded-full bg-black/60 border border-white/20 backdrop-blur flex items-center justify-center text-2xl text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                >
                  ›
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}