"use client";

import dynamic from "next/dynamic";

const ArticleEditorClient = dynamic(() => import("./ArticleEditorClient"), {
  ssr: false,
});

export default function ClientOnlyEditor(props: {
  initialArticle: any;
  initialBlocks: any[];
  initialError: string | null;
}) {
  return <ArticleEditorClient {...props} />;
}