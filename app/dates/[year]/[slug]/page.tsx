import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Comments from "@/components/Comments";
import ArticleRenderer from "./ArticleRenderer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  published_date: string | null;
  created_at: string;
  author_id: string | null;
  // relation join (peut être null)
  profiles: { full_name: string | null } | null;
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;

  const supabase = createClient();

  // ✅ NOTE :
  // Le "profiles!articles_author_id_fkey" force le join via la FK author_id -> profiles.id
  // Assure-toi que ta contrainte FK s'appelle bien "articles_author_id_fkey"
  const { data: article, error: aErr } = await supabase
    .from("articles")
    .select(
      `
      id,
      title,
      slug,
      published_date,
      created_at,
      author_id,
      profiles!articles_author_id_fkey (
        full_name
      )
    `
    )
    .eq("slug", slug)
    .maybeSingle<ArticleRow>();

  if (aErr || !article) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-8">
              Article introuvable
            </h1>
            <p className="text-white/60">
              Soit l’article n’existe pas, soit il n’est pas encore publié.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { data: blocks, error: bErr } = await supabase
    .from("article_blocks")
    .select("id, type, content, media_url, caption, sort_index")
    .eq("article_id", article.id)
    .order("sort_index", { ascending: true });

  const authorName = article.profiles?.full_name ?? "Auteur";

  // ID canonique pour Comments + pour /posts
  const canonicalArticleId = `dates/${year}/${slug}`;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto relative">
          {/* Titre */}
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
            {article.title}
          </h1>

          {/* Contenu */}
          {bErr ? (
            <p className="text-white/50">Impossible de charger le contenu.</p>
          ) : (
            <ArticleRenderer blocks={blocks ?? []} />
          )}

          {/* Auteur */}
          <div className="mt-14 flex justify-end">
            <div className="text-xs tracking-[0.4em] uppercase text-white/40">
              Auteur : <span className="text-white/70">{authorName}</span>
            </div>
          </div>
        </div>

        {/* Commentaires */}
        <Comments articleId={canonicalArticleId} />
      </main>
      <Footer />
    </>
  );
}