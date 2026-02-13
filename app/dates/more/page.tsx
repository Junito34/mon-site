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
  date?: string; // "YYYY-MM-DD"
};

function isYearFolder(name: string) {
  return /^\d{4}$/.test(name);
}

function safeReadJson(filePath: string) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function DatesMorePage() {
  const datesDir = path.join(process.cwd(), "app", "dates");
  const yearEntries = fs.readdirSync(datesDir, { withFileTypes: true });

  const pages: PageLink[] = [];

  for (const yearEntry of yearEntries) {
    if (!yearEntry.isDirectory() || !isYearFolder(yearEntry.name)) continue;

    const year = yearEntry.name;
    const yearDir = path.join(datesDir, year);

    // 1) Cas "ancien" : article directement dans /dates/YYYY/page.tsx
    const directPage = path.join(yearDir, "page.tsx");
    const directMeta = path.join(yearDir, "meta.json");
    if (fs.existsSync(directPage)) {
      const meta = fs.existsSync(directMeta) ? safeReadJson(directMeta) : null;
      pages.push({
        year,
        href: `/dates/${year}`,
        title: meta?.title || year,
        author: meta?.author,
        date: meta?.date, // optionnel
      });
    }

    // 2) Cas "nouveau" : plusieurs articles /dates/YYYY/<slug>/page.tsx
    const subEntries = fs.readdirSync(yearDir, { withFileTypes: true });
    for (const sub of subEntries) {
      if (!sub.isDirectory()) continue;

      const slug = sub.name;
      const articleDir = path.join(yearDir, slug);

      const articlePage = path.join(articleDir, "page.tsx");
      if (!fs.existsSync(articlePage)) continue;

      const metaPath = path.join(articleDir, "meta.json");
      const meta = fs.existsSync(metaPath) ? safeReadJson(metaPath) : null;

      pages.push({
        year,
        href: `/dates/${year}/${slug}`,
        title: meta?.title || `${year} — ${slug.replace(/-/g, " ")}`,
        author: meta?.author,
        date: meta?.date,
      });
    }
  }

  // Tri : date si présente, sinon année
  pages.sort((a, b) => {
    const ad = a.date ? new Date(a.date).getTime() : NaN;
    const bd = b.date ? new Date(b.date).getTime() : NaN;

    if (!Number.isNaN(ad) && !Number.isNaN(bd)) return bd - ad;
    if (!Number.isNaN(ad) && Number.isNaN(bd)) return -1;
    if (Number.isNaN(ad) && !Number.isNaN(bd)) return 1;

    return Number(b.year) - Number(a.year);
  });

  return (
    <>
      <Navbar />
      <DatesMoreClient pages={pages} />
      <Footer />
    </>
  );
}
