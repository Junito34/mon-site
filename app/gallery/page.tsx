import fs from "fs";
import path from "path";

import GalleryClient from "../../features/gallery/components/GalleryClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function listMedia(dirAbs: string, prefix: string, exts?: string[]) {
  if (!fs.existsSync(dirAbs)) return [];
  const files = fs
    .readdirSync(dirAbs)
    .filter((f) => !f.startsWith("."))
    .filter((f) => {
      if (!exts || exts.length === 0) return true;
      const ext = path.extname(f).toLowerCase();
      return exts.includes(ext);
    })
    .sort((a, b) => a.localeCompare(b));
  return files.map((f) => `${prefix}/${f}`);
}

export default function GalleryPage() {
  const publicDir = path.join(process.cwd(), "public");

  const photosDir = path.join(publicDir, "photos");
  const videosDir = path.join(publicDir, "videos");
  const iaDir = path.join(publicDir, "ia");

  const photos = listMedia(photosDir, "/photos", [".jpg", ".jpeg", ".png", ".webp", ".gif"]);
  const videos = listMedia(videosDir, "/videos", [".mp4", ".m4v", ".webm", ".mov"]);
  const iaVideos = listMedia(iaDir, "/ia", [".mp4", ".m4v", ".webm", ".mov",'.mkv']);

  return (
    <>
      <Navbar />
      <GalleryClient photos={photos} videos={videos} iaVideos={iaVideos} />
      <Footer />
    </>
  );
}