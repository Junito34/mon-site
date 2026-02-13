"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type ImageSectionProps = {
  image: string;
  title?: string;
  overlay?: number;
};

export default function ImageSection({
  image,
  title,
  overlay = 0.25,
}: ImageSectionProps) {
  return (
    <section className="relative h-screen flex items-center justify-center bg-black">
      <div className="relative w-[85%] h-[75%] overflow-hidden">

        {/* Image fixe */}
        <Image
          src={image}
          alt={title || "Image section"}
          fill
          className="object-cover"
          sizes="85vw"
          priority={false}
        />

        {/* Overlay fixe */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(0,0,0,${overlay})`,
          }}
        />

        {/* Titre discret en bas à droite */}
        {title && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute bottom-6 right-6 text-right"
          >
            <h2 className="text-xs md:text-sm tracking-[0.3em] uppercase text-white/80">
              {title}
            </h2>
          </motion.div>
        )}
      </div>
    </section>
  );
}
