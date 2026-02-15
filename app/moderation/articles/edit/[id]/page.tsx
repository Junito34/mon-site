import ArticleEditor from "@/components/article-editor/ArticleEditor";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditArticlePage({ params }: { params: Promise<Params> }) {
  const supabase = createClient();
  const { id } = await params;

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

  const initialError = aErr?.message ?? bErr?.message ?? null;

  return (
    <>
      <ArticleEditor
        mode="edit"
        initialArticle={article ?? null}
        initialBlocks={(blocks ?? []) as any}
        initialError={initialError}
      />
    </>
  );
}