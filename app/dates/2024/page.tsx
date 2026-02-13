import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Comments from "@/components/Comments";
import ImageSection from "@/components/ImageSection";

export default function Page2024() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
          <div className="max-w-3xl mx-auto relative pb-16">
    
            {/* Titre */}
            <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
              12 février 2024 – Toujours un petit mot qui nous parvient …
            </h1>
    
            {/* Contenu */}
            <div className="space-y-6 text-white/80 leading-relaxed text-base md:text-lg">
              <p>
                Toujours un petit mot qui nous parvient pour nous dire que tu es toujours dans les pensées de quelqu’un, 
                ce matin, le premier mot a été de Nadège : quatre smiley cœurs trois mots « à notre ange » un smiley 3 bisous. 
                 Tu vois tout est dit, on est sur les mêmes pensées. On retient une larme, et on sourit. 
                 Oui bien sûr tu es toujours là, en nous…. C’est fort, c’est beau…
              </p>
    
              <p>
                Cette année Alex, nous a fait parvenir, un superbe cadeau, magnifique, fabriqué de ses mains, avec tout son talent, 
                avec son savoir faire, mais aussi avec toute son amitié indéfectible,  
                il a réalisé en bois d’olivier une couteau QUERE marqué de son logo et de sa marque coutellerie HIMMONET,  
                Et de l’autre côté il l’a personnalisé avec l’inscription « Joecasanova » sur la garde et mon prénom sur la lame.
              </p>
    
              <p>
                Voilà un cadeau qui va droit au cœur et qui ne me quittera plus. Milles mercis à lui et pleins de belles pensées 
                pour sa famille, ainsi que ceux qui ont la chance d’être aimé de lui.
              </p>
            </div>
            <ImageSection 
                    image="/articles/2024image1.jpg"
                    fit="contain" />
            <ImageSection 
                    image="/articles/2024image2.jpg"
                    fit="contain"/>
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
