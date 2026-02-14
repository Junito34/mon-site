import fs from "fs";
import path from "path";

import GalleryClient from "./GalleryClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function GalleryPage() {
  const publicDir = path.join(process.cwd(), "public");

  // Photos
  const photosDir = path.join(publicDir, "photos");
  const photos = fs.existsSync(photosDir)
    ? fs
        .readdirSync(photosDir)
        .filter((f) => !f.startsWith("."))
        .map((f) => `/photos/${f}`)
    : [];

  // Vidéos normales
  const videosDir = path.join(publicDir, "videos");
  const videos = fs.existsSync(videosDir)
    ? fs
        .readdirSync(videosDir)
        .filter((f) => !f.startsWith("."))
        .map((f) => `/videos/${f}`)
    : [];

  // Vidéos IA
  const iaDir = path.join(publicDir, "ia");
  const iaVideos = fs.existsSync(iaDir)
    ? fs
        .readdirSync(iaDir)
        .filter((f) => !f.startsWith("."))
        .map((f) => `/ia/${f}`)
    : [];

  return (
    <>
      <Navbar />
      <GalleryClient
        photos={photos}
        videos={videos}
        iaVideos={iaVideos}
      />
      <Footer />
    </>
  );
}