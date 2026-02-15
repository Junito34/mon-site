import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleEditor from "@/components/article-editor/ArticleEditor";

export default function AddArticlePage() {
  return (
    <>
      <Navbar />
      <ArticleEditor mode="create" />
      <Footer />
    </>
  );
}