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
  profiles: { full_name: string | null } | null;
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ year: string; slug: string }>;
}) {
  const { year, slug } = await params;

  const supabase = createClient();

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
        <main className="min-h-screen bg-black text-white pt-28 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6 md:px-10">
          <div className="w-full max-w-3xl mx-auto">
            <h1 className="font-light tracking-wide text-white/90 text-[clamp(1.9rem,7vw,3rem)] mb-6">
              Article introuvable
            </h1>
            <p className="text-white/60 text-sm md:text-base leading-relaxed">
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

  // ID canonique pour Comments + /posts
  const canonicalArticleId = `dates/${year}/${slug}`;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-black text-white pt-28 md:pt-40 pb-16 md:pb-20 px-4 sm:px-6 md:px-10">
        <div className="w-full max-w-3xl mx-auto relative">
          {/* Titre */}
          <h1 className="font-light tracking-wide text-white/90 text-[clamp(2.1rem,7.5vw,3.3rem)] leading-[1.06] md:leading-[1.02] mb-10 md:mb-12">
            {article.title}
          </h1>

          {/* Contenu */}
          {bErr ? (
            <p className="text-white/50 text-sm md:text-base">
              Impossible de charger le contenu.
            </p>
          ) : (
            <ArticleRenderer blocks={blocks ?? []} />
          )}

          {/* Auteur */}
          <div className="mt-12 md:mt-14 flex justify-end">
            <div className="text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.35em] uppercase text-white/40">
              Auteur : <span className="text-white/70">{authorName}</span>
            </div>
          </div>
        </div>

        {/* Commentaires */}
        <div className="mt-8 md:mt-12">
          <Comments articleId={canonicalArticleId} />
        </div>
      </main>

      <Footer />
    </>
  );
}