import fs from "fs";
import path from "path";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PhotosClient from "./PhotosClient";

export default function PhotosPage() {
  const photosDirectory = path.join(process.cwd(), "public/photos");
  const filenames = fs.readdirSync(photosDirectory);

  const images = filenames
    .filter((n) => /\.(jpg|jpeg|png|webp|gif)$/i.test(n))
    .sort((a, b) => a.localeCompare(b, "fr"))
    .map((name) => ({
      src: `/photos/${name}`,
      name,
    }));

  return (
    <>
      <Navbar />
      <PhotosClient images={images} />
      <Footer />
    </>
  );
}