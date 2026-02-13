import fs from "fs";
import path from "path";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DatesMoreClient from "./DatesMoreClient";

type PageLink = {
  title: string;
  href: string;
  year: string;
  author?: string;
};

function isYearFolder(name: string) {
  return /^\d{4}$/.test(name);
}

export default function DatesMorePage() {
  const datesDir = path.join(process.cwd(), "app", "dates");
  const entries = fs.readdirSync(datesDir, { withFileTypes: true });

  const pages: PageLink[] = entries
    .filter((e) => e.isDirectory() && isYearFolder(e.name))
    .map((e) => {
      const year = e.name;
      const href = `/dates/${year}`;

      // meta.json optionnel
      const metaPath = path.join(datesDir, year, "meta.json");
      let title = year;
      let author: string | undefined = undefined;

      if (fs.existsSync(metaPath)) {
        try {
          const raw = fs.readFileSync(metaPath, "utf-8");
          const meta = JSON.parse(raw) as { title?: string; author?: string };
          if (meta.title) title = meta.title;
          if (meta.author) author = meta.author;
        } catch {
          // si meta cassé, on ignore et on fallback
        }
      }

      return { title, href, year, author };
    })
    // tri récent -> ancien
    .sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <>
      <Navbar />
      <DatesMoreClient pages={pages} />
      <Footer />
    </>
  );
}
