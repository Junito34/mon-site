import Comments from "@/components/Comments";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageSection from "@/components/ImageSection";

export default function Page2026() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto relative pb-16">


        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
          Le portrait de son anniversaire de 18 ans, exposé lors des obsèques !
        </h1>

        {/* Contenu */}
        <ImageSection 
            image="/articles/2009-06-13image1.jpg"
            fit="contain"
            overlay={0.4} />
        <div className="space-y-6 text-white/80 leading-relaxed text-base md:text-lg">
          <p>
            La vidéo du morceau de musique passé lors des obsèques à SAINTES. C’est un choix de Nadège, 
            et c’est un beau morceau qui nous a tous accompagnés lors des hommages à Joe.
          </p>
        </div>
        <ImageSection 
            image="/articles/2009-06-13image2.jpg"
            fit="contain"
            overlay={0.4} />
        <div className="absolute right-0 -bottom-6 text-xs tracking-[0.4em] uppercase text-white/40 hidden md:block">
            Auteur : <span className="text-white/70">Michel</span>
        </div>

      </div>
        

      {/* Section commentaires */}
      <Comments />
    </main>
    <Footer />
    </>
  );
}
