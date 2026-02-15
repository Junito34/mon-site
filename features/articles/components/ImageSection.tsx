"use client";

import Image from "next/image";

type ImageSectionProps = {
  image: string;
  title?: string;
  overlay?: number; // 0 → 1
  zoom?: number; // 1 = normal
  fit?: "cover" | "contain";
};

export default function ImageSection({
  image,
  title,
  overlay = 0.25,
  zoom = 1,
  fit = "cover",
}: ImageSectionProps) {
  const isContain = fit === "contain";

  return (
    <section className={`relative bg-black ${isContain ? "py-16 md:py-20" : "h-screen"}`}>
      <div className="flex items-center justify-center">
        {/* ✅ IMPORTANT: hauteur stable en vh (plus de % qui peut collapse) */}
        <div
          className={[
            "relative w-[85%] overflow-hidden",
            isContain ? "" : "h-[75vh] md:h-[80vh]",
          ].join(" ")}
        >
          {isContain ? (
            <div className="relative w-full">
              {/* Fond ciné : même image en cover + blur */}
              <div className="absolute inset-0 scale-110">
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-cover blur-2xl"
                  sizes="85vw"
                />
                <div className="absolute inset-0 bg-black/50" />
              </div>

              {/* Wrapper zoom (image + overlay ensemble) */}
              <div
                className="relative flex items-center justify-center"
                style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
              >
                <Image
                  src={image}
                  alt={title || "Image section"}
                  width={1600}
                  height={1000}
                  className="w-full h-auto object-contain"
                />

                {/* Overlay qui suit le zoom */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundColor: `rgba(0,0,0,${overlay})` }}
                />
              </div>
            </div>
          ) : (
            // Mode cover plein cadre
            <div
              className="relative w-full h-full"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              {/* ✅ parent direct du fill = relative + h-full */}
              <Image
                src={image}
                alt={title || "Image section"}
                fill
                className="object-cover"
                sizes="85vw"
              />

              {/* Overlay qui suit le zoom */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: `rgba(0,0,0,${overlay})` }}
              />
            </div>
          )}

          {/* Titre (ne doit PAS zoomer) */}
          {title && (
            <div className="absolute bottom-6 right-6 text-right">
              <h2 className="text-xs md:text-sm tracking-[0.3em] uppercase text-white/80">
                {title}
              </h2>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}