import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createClient } from "@/lib/supabase/server";
import DeleteArticlesClient from "./DeleteArticlesClient";

export default async function DeleteArticlesPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id, title, created_at, published_date, slug")
    .order("created_at", { ascending: false });

  return (
    <DeleteArticlesClient
      initialArticles={data ?? []}
      initialError={error?.message ?? null}
    />
  );
}