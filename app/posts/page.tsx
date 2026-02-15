import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PostsClient from "../../features/posts/components/PostsClient";
import { createClient } from "@/lib/supabase/server";

export default async function PostsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">
              Mes posts
            </h1>
            <p className="mt-6 text-white/60">
              Tu dois être connecté pour voir tes commentaires.
            </p>
            <a
              href="/login"
              className="inline-block mt-8 border border-white/20 px-5 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition"
            >
              Aller à la connexion →
            </a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PostsClient userId={user.id} />
      <Footer />
    </>
  );
}
