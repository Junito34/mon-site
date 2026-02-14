"use client";

import dynamic from "next/dynamic";
import type React from "react";

type DbBlock = {
  id: string;
  type: string;
  content: string | null;
  media_url: string | null;
  caption: string | null;
  sort_index: number;
};

type DbArticle = {
  id: string;
  title: string;
  slug: string;
  published_date: string | null;
};

type Props = {
  initialArticle: DbArticle | null;
  initialBlocks: DbBlock[];
  initialError: string | null;
};

const ArticleEditorClient = dynamic<Props>(
  () => import("./ArticleEditorClient"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[200px] flex items-center justify-center text-white/50 text-sm">
        Chargement de l’éditeur…
      </div>
    ),
  }
);

export default function ClientOnlyEditor(props: Props) {
  return <ArticleEditorClient {...props} />;
}