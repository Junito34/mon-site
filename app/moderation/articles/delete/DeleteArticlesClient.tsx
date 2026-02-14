"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ConfirmModal from "@/components/ConfirmModal";

type Article = {
  id: string;
  title: string;
  created_at: string;
  published_date: string | null;
  slug: string;
};

export default function DeleteArticlesClient({
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

    const { error } = await supabase.from("articles").delete().eq("id", target.id);

    if (error) {
      setError(error.message);
      setDeleting(false);
      return;
    }

    setArticles((prev) => prev.filter((x) => x.id !== target.id));
    setDeleting(false);
    setModalOpen(false);
    setTarget(null);
  };

  return (
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-light tracking-wide">
          Supprimer article
        </h1>
        <p className="mt-4 text-white/60 text-sm md:text-base">
          Supprime un article de la base. Une confirmation est demandée.
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
                  Date création
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
                    Aucun article en base pour l’instant.
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
                      <button
                        onClick={() => askDelete(a)}
                        className="border border-white/20 px-4 py-2 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
                      >
                        Supprimer
                      </button>
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
        description="Cette action est irréversible. L’article sera supprimé de la base."
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