"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] w-full flex items-center justify-center bg-black overflow-hidden px-6 md:px-10">
      {/* Background subtle glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a,_#000)]" />

      {/* Optional vignette for premium depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.75)_100%)]" />

      <motion.h1
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="
          z-10 text-center font-light tracking-tight text-white
          max-w-[22ch] md:max-w-[28ch]
          leading-[1.05] md:leading-[1.0]
          text-[clamp(2rem,8vw,3.5rem)] md:text-[clamp(3rem,6vw,4.5rem)]
        "
      >
        À la mémoire de mon frère
      </motion.h1>
    </section>
  );
}