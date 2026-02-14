import ClientOnlyEditor from "./ClientOnlyEditor";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient();

  const { data: article, error: aErr } = await supabase
    .from("articles")
    .select("id, title, slug, published_date")
    .eq("id", id)
    .single();

  const { data: blocks, error: bErr } = await supabase
    .from("article_blocks")
    .select("id, type, content, media_url, caption, sort_index")
    .eq("article_id", id)
    .order("sort_index", { ascending: true });

  return (
    <>
      <ClientOnlyEditor
        initialArticle={article as any}
        initialBlocks={(blocks ?? []) as any}
        initialError={aErr?.message ?? bErr?.message ?? null}
      />
    </>
  );
}