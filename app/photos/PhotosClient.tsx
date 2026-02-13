"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function PhotosClient({ images }: { images: string[] }) {
  const ref = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selected = selectedIndex !== null ? images[selectedIndex] : null;

  // Clavier : ESC + flèches
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "Escape") setSelectedIndex(null);

      if (e.key === "ArrowRight" && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
      }

      if (e.key === "ArrowLeft" && selectedIndex < images.length - 1) {
            setSelectedIndex(selectedIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, images.length]);

  const nextPhoto = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <>
      {/* GALERIE ÉVENTAIL */}
      <main
        ref={ref}
        className="relative h-[300vh] bg-black flex items-center justify-center"
      >
        {/* Indicateur scroll */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="absolute top-50 left-1/2 -translate-x-1/2 flex flex-col items-center text-white text-xs tracking-widest"
        >
          <span>SCROLL</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="mt-2 w-[1px] h-8 bg-white"
          />
        </motion.div>

        <div className="sticky top-0 h-screen flex items-center justify-center">
          {images.map((src, i) => {
            const y = useTransform(scrollYProgress, [0, 1], [0, -i * 120]);
            const rotate = useTransform(scrollYProgress, [0, 1], [i * 5 - 10, 0]);

            return (
              <motion.div
                key={i}
                style={{ y, rotate }}
                className="absolute w-[300px] h-[420px] shadow-2xl cursor-pointer"
                onClick={() => setSelectedIndex(i)}
              >
                <Image
                  src={src}
                  alt={`Photo ${i + 1}`}
                  fill
                  className="object-cover rounded-sm"
                />
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50"
            onClick={() => setSelectedIndex(null)}
          >
            {/* Image fullscreen */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-[90vw] h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selected}
                alt={`Photo ${selectedIndex! + 1}`}
                fill
                className="object-contain"
              />
            </motion.div>

            {/* Bouton fermeture */}
            <button
              className="absolute top-6 right-8 text-white text-3xl font-light hover:opacity-60 transition"
              onClick={() => setSelectedIndex(null)}
            >
              ×
            </button>

            {/* Flèche gauche */}
            {selectedIndex !== null && selectedIndex < images.length - 1 && (
            <button
                className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-4xl font-light hover:opacity-60 transition z-50"
                onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
                }}
            >
                ‹
            </button>
            )}

            {/* Flèche droite */}
            {selectedIndex !== null && selectedIndex > 0 && (
            <button
                className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-4xl font-light hover:opacity-60 transition z-50"
                onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
                }}
            >
                ›
            </button>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
