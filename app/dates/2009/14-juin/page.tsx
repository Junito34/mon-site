import Comments from "@/components/Comments";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageSection from "@/components/ImageSection";

export default function Page14Juin2009() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto relative pb-16">


        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
          Joe, en souvenir de toi, on t’aime !
        </h1>

        {/* Contenu */}
        <div className="space-y-6 text-white/80 leading-relaxed text-base md:text-lg">
          <p>
            Le manque que nous ressentons en permanence, nous pousse naturellement à créer ce blog. 
            Le but évident est de permettre, à ceux qui aiment ou ont aimé Jonathan, de réccupérer des photos de lui, 
            des anecdotes vécues, des messages personnels, des thèmes qui lui correspondent, etc. …
          </p>

          <p>
            Joe est inoubliable, certains n’osent pas prendre contact, pour des raisons qui leur sont propres. 
            C’est normal, et tout à fait bien compris. En tout cas jamais jugé, ou mal interprété…
          </p>

          <p>
            Cependant, nous avons également le secret espoir, que certains oseront placer des images ou photos de lui, ou tout autre souvenirs. 
            Bref tout fichier image ou audio qu’ils ont la possibilité d’échanger.
          </p>

          <p>
            L’idée est également de laisser la possibilité à ceux qui le désire de laisser un message, un hommage à Joe. 
            C’est pourquoi nous avons l’intention de créer un livre d’or où les plus beaux hommages seront mis en valeur.
          </p>
        </div>
        <ImageSection 
            image="/articles/2009-06-14image1.jpg"
            fit="contain" />
        <div className="absolute right-0 -bottom-6 text-xs tracking-[0.4em] uppercase text-white/40 hidden md:block">
            Auteur : <span className="text-white/70">Michel</span>
        </div>

      </div>
        

      {/* Section commentaires */}
      <Comments/>
    </main>
    <Footer />
    </>
  );
}
