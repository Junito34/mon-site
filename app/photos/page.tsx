import fs from "fs";
import path from "path";
import PhotosClient from "./PhotosClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PhotosPage() {
  const photosDirectory = path.join(process.cwd(), "public/photos");
  const filenames = fs.readdirSync(photosDirectory);

  const images = filenames.map((name) => `/photos/${name}`);

  return (
    <>
    <Navbar />
    <PhotosClient images={images} />
    <Footer />
    </>
);
}
