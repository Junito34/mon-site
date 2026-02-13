"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen w-screen flex items-center justify-center bg-black overflow-hidden">

      {/* Background subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a,_#000)]" />

      <motion.h1
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        className="z-10 text-[9vw] font-light tracking-tight text-center"
      >
        A la mémoire de mon frère
      </motion.h1>
    </section>
  );
}
