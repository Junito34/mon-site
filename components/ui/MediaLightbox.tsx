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
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-[92vw] h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {mode === "photos" ? (
              <Image src={src} alt="" fill className="object-contain" priority />
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

          <button
            className="absolute top-6 right-8 text-white text-3xl font-light hover:opacity-60 transition"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ×
          </button>

          {canPrev && (
            <button
              className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-4xl font-light hover:opacity-60 transition z-50"
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
              className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-4xl font-light hover:opacity-60 transition z-50"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              ›
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}