import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DatesMoreClient from "./DatesMoreClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type PageLink = {
  title: string;
  href: string;
  year: string;
  author?: string;
  publishedDate?: string | null;
};

export default async function DatesMorePage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      id,
      title,
      slug,
      published_date,
      created_at,
      profiles!articles_author_id_fkey (
        full_name
      )
    `
    )
    .order("published_date", { ascending: false })
    .order("created_at", { ascending: false });

  // fallback safe
  const pages: PageLink[] =
    (data ?? []).map((a: any) => {
      const dateStr = a.published_date ?? a.created_at;
      const year = new Date(dateStr).getFullYear().toString();
      return {
        title: a.title,
        year,
        author: a.profiles?.full_name ?? undefined,
        publishedDate: a.published_date,
        href: `/dates/${year}/${a.slug}`,
      };
    }) ?? [];

  return (
    <>
      <Navbar />
      <DatesMoreClient pages={pages} serverError={error?.message ?? null} />
      <Footer />
    </>
  );
}