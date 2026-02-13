import Comments from "@/components/Comments";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Page2026() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto relative pb-16">


        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
          12 février 2026 - Pour que l'on ne t'oublie pas...
        </h1>

        {/* Contenu */}
        <div className="space-y-6 text-white/80 leading-relaxed text-base md:text-lg">
          <p>
            Ce site a été créé en mémoire de mon frère, Jonathan.
            Plus qu’un simple espace en ligne, il représente un lieu où ses souvenirs,
            ses moments de vie et tout ce qu’il a laissé derrière lui peuvent continuer
            d’exister.
          </p>

          <p>
            Jonathan était quelqu’un de profondément humain, sincère et présent pour les
            autres. Ceux qui l’ont connu savent à quel point il savait marquer les gens par
            sa personnalité, sa simplicité et sa façon d’être lui-même, sans artifice.
          </p>

          <p>
            L’année 2026 marque une étape dans ce travail de mémoire. Ce projet est né du
            besoin de garder une trace, de rassembler des photos, des moments et des mots.
            Non pas pour rester tourné vers le passé, mais pour que son histoire continue
            d’être racontée, partagée et transmise.
          </p>

          <p>
            Cet espace est aussi le vôtre. Famille, amis, proches ou simples visiteurs,
            chacun peut y laisser un message, un souvenir ou une pensée.
            Chaque mot contribue à faire vivre sa mémoire autrement.
          </p>

          <p>
            Parce que l’on ne disparaît jamais vraiment tant qu’il reste des souvenirs,
            des images, des histoires… et des personnes pour s’en souvenir.
          </p>
        </div>
        <div className="absolute right-0 -bottom-6 text-xs tracking-[0.4em] uppercase text-white/40 hidden md:block">
            Auteur : <span className="text-white/70">Anthony</span>
        </div>

      </div>
        

      {/* Section commentaires */}
      <Comments articleId="dates-2026" />
    </main>
    <Footer />
    </>
  );
}
