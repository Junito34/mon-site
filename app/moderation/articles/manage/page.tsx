import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ManageArticlesClient from "../../../../features/moderation/components/ManageArticlesClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ManageArticlesPage() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, created_at, published_date")
    .order("created_at", { ascending: false });

  return (
    <>
      <Navbar />
      <ManageArticlesClient
        initialArticles={(data ?? []) as any}
        initialError={error?.message ?? null}
      />
      <Footer />
    </>
  );
}