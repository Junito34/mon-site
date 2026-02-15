import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArticleEditor from "@/features/articles/components/ArticleEditor";

export default function AddArticlePage() {
  return (
    <>
      <ArticleEditor mode="create" />
    </>
  );
}