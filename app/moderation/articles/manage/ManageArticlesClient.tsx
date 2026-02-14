"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ConfirmModal";

type Article = {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  published_date: string | null;
};

function extractStoragePathFromPublicUrl(publicUrl: string, bucket: string) {
  // attend: .../storage/v1/object/public/<bucket>/<path>
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}

export default function ManageArticlesClient({
  initialArticles,
  initialError,
}: {
  initialArticles: Article[];
  initialError: string | null;
}) {
  const supabase = createClient();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [error, setError] = useState<string | null>(initialError);

  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  const BUCKET = "article-images";

  const askDelete = (a: Article) => {
    setTarget(a);
    setModalOpen(true);
  };

  const close = () => {
    if (deleting) return;
    setModalOpen(false);
    setTarget(null);
  };

  const remove = async () => {
    if (!target) return;

    setError(null);
    setDeleting(true);

    try {
      // 1) récupérer toutes les images liées à cet article
      const { data: imgBlocks, error: imgErr } = await supabase
        .from("article_blocks")
        .select("media_url, type")
        .eq("article_id", target.id)
        .eq("type", "image");

      if (imgErr) throw imgErr;

      const urls = (imgBlocks ?? [])
        .map((b: any) => (b.media_url as string) || "")
        .filter(Boolean);

      // 2) supprimer les fichiers du storage
      const paths = urls
        .map((url) => extractStoragePathFromPublicUrl(url, BUCKET))
        .filter((p): p is string => !!p);

      // NOTE: supabase remove accepte un tableau vide sans souci, mais on garde clean
      if (paths.length > 0) {
        const { error: sErr } = await supabase.storage.from(BUCKET).remove(paths);
        if (sErr) throw sErr;
      }

      // 3) supprimer blocks + article (transaction DB)
      const { error: rpcErr } = await supabase.rpc("delete_article_cascade", {
        p_article_id: target.id,
      });

      if (rpcErr) throw rpcErr;

      // 4) UI
      setArticles((prev) => prev.filter((x) => x.id !== target.id));
      setModalOpen(false);
      setTarget(null);
    } catch (e: any) {
      setError(e?.message ?? "Erreur suppression complète.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-wide">
          Gestion des articles
        </h1>
        <p className="mt-4 text-white/60 text-sm md:text-base">
          Éditer ou supprimer des articles (suppression complète : DB + images).
        </p>

        {error && (
          <div className="mt-8 border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-12 border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-white/60">
              <tr>
                <th className="px-6 py-4 font-light tracking-widest uppercase text-xs">
                  Nom article
                </th>
                <th className="px-6 py-4 font-light tracking-widest uppercase text-xs">
                  Créé le
                </th>
                <th className="px-6 py-4 font-light tracking-widest uppercase text-xs">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {articles.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-white/50" colSpan={3}>
                    Aucun article pour l’instant.
                  </td>
                </tr>
              ) : (
                articles.map((a) => (
                  <tr key={a.id} className="border-b border-white/5">
                    <td className="px-6 py-4 text-white/85">
                      {a.title}
                      <div className="mt-2 text-xs tracking-[0.3em] uppercase text-white/40">
                        {a.slug}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-white/70">
                      {new Date(a.created_at).toLocaleString("fr-FR")}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <a
                          href={`/moderation/articles/edit/${a.id}`}
                          className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
                        >
                          Éditer
                        </a>

                        <button
                          onClick={() => askDelete(a)}
                          className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        title={target ? `Supprimer "${target.title}" ?` : "Supprimer cet article ?"}
        description="Suppression complète : l’article, ses blocs et ses images seront supprimés. Action irréversible."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        danger
        loading={deleting}
        onConfirm={remove}
        onClose={close}
      />
    </main>
  );
}