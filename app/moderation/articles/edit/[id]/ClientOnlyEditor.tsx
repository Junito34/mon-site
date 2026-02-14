"use client";

import ArticleEditorClient from "./ArticleEditorClient";

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

export default function ClientOnlyEditor(props: {
  initialArticle: DbArticle | null;
  initialBlocks: DbBlock[];
  initialError: string | null;
}) {
  return <ArticleEditorClient {...props} />;
}