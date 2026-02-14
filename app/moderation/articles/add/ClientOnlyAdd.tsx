"use client";

import dynamic from "next/dynamic";

const AddArticleClient = dynamic(() => import("./AddArticleClient"), {
  ssr: false,
});

export default function ClientOnlyAdd() {
  return <AddArticleClient />;
}