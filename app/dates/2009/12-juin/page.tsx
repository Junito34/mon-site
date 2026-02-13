import Comments from "@/components/Comments";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageSection from "@/components/ImageSection";

export default function Page12Juin2009() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto relative pb-16">


        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
          Les mots exacts pour le dire
        </h1>

        {/* Contenu */}
        <div className="space-y-6 text-white/80 leading-relaxed text-base md:text-lg">
          <p>
            Je vous en prie, ne me demandez pas si j’ai réussi à le surmonter,<br/>
            Je ne le surmonterai jamais.<br/>
            <br/>
            Je vous en prie, ne me dites pas qu’il est mieux là où il est maintenant,<br/>
            Il n’est pas ici auprès de moi.<br/>
            <br/>
            Je vous en prie, ne me dites pas qu’il ne souffre plus,<br/>
            Je n’ai toujours pas accepté qu’il ait dû souffrir.<br/>
            <br/>
            Je vous en prie, ne me dites pas que vous savez ce que je ressens,<br/>
            À moins que vous aussi, vous ayez perdu un enfant.<br/>
            <br/>
            Je vous en prie, ne me demandez pas de guérir,<br/>
            Le deuil n’est pas une maladie dont on peut se débarrasser.<br/>
            <br/>
            Je vous en prie, ne me dites pas<br/>
            « Au moins vous l’avez eu pendant tel nombre d’années »,<br/>
            Selon vous, à quel âge votre enfant devrait-il mourir ?<br/>
            <br/>
            Je vous en prie, ne me dites pas que Dieu n’inflige pas plus que ce que l’homme peut supporter.<br/>
            Je vous en prie, dites-moi simplement que vous êtes désolés.<br/>
            <br/>
            Je vous en prie, dites-moi simplement que vous vous souvenez de mon enfant,<br/>
            si vous vous rappelez de lui.<br/>
            Je vous en prie, laissez-moi simplement parler de mon enfant.<br/>
            Je vous en prie, mentionnez le nom de mon enfant.<br/>
            Je vous en prie, laissez-moi simplement pleurer.<br/>
          </p>
        </div>
        <ImageSection 
            image="/articles/2009-06-12image1.jpg"
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
