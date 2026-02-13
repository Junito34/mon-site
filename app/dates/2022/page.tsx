import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Comments from "@/components/Comments";
import YouTubeEmbed from "@/components/YouTubeEmbed";

export default function Page2022() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-black text-white pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto relative pb-16">
        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-12">
          12 février 2022 – je ne voulais pas que cette date efface petit à petit celle de ton anniversaire
        </h1>

        {/* Texte */}
        <div className="space-y-6 text-white/80 leading-relaxed text-base md:text-lg">
          <p>
            J’ai du mal à me dire que la date de ton départ prenne le pas sur celle
            de ta naissance. Et puis finalement, il est clair que cette date, personne
            ne l’a choisie. Mais c’est un décompte de la durée depuis la date de ton
            départ, et donc de la durée des jours où tu nous as manqué. Sauf que ce
            n’est pas un « départ », on le sait tous.
          </p>

          <p>
            Cela nous ramène au drame qui t’a été fatal. Cette date, c’est celle qui
            nous ramène au plus grand traumatisme de nos vies. C’est vrai que c’est
            aussi un moment où le moindre témoignage, le moindre souvenir, nous va
            droit au cœur. Nos cœurs écorchés, fragiles, sensibles. On a ainsi la
            meilleure des preuves que les personnes que tu as connues, que tu as
            aimées, ne t’oublient pas. Et ça, ça nous fait du bien.
          </p>

          <p>
            Comme on aime quand quelqu’un vient nous parler de toi, évoquer les bons
            souvenirs de toi. Ça, ça fait du bien. Ça fait tellement de bien de
            recevoir ce type de communication.
          </p>

          <p>
            Alors, je vais juste évoquer ce souvenir de Jonathan. Je le revois arriver
            à la maison avec son Kawa ER6N, noir, et à peine rentré à la maison, il
            enlève son casque, et ses gants, et se colle au radiateur, juste à côté
            de la porte d’entrée. Il faisait cette pause à la maison avant de repartir
            vers le lycée de Pons, où il suivait ses études en BTS bâtiment.
          </p>

          <p>
            Cette petite pause pour embrasser sa mère, puis se réchauffer contre ce
            radiateur. Un court moment de pause avant de repartir dans le froid vers
            le lycée.
          </p>

          <p>
            Ce matin-là, ce 12 février 2009, il n’arrive pas à la maison. Pensant à
            un simple retard, je pars au boulot à pied, comme d’habitude vers la
            brigade. Avant d’arriver au bureau, j’entends le klaxon deux tons des
            collègues qui partent en intervention. (Puis la suite, vous la connaissez
            ou vous la découvrirez dans ces pages.)
          </p>

          <p>
            Mais parfois, il m’arrive de fermer les yeux, et je le revois contre ce
            radiateur, avec ses mains sous ses fesses pour les réchauffer. On se
            regarde, et il me dit : « oui, je sais, ça se mérite une vie de motard ! »
            Je l’embrasse et je pars au boulot, comme si tout cela n’était jamais
            arrivé… Comme si on allait s’appeler plus tard pour fixer une date à
            laquelle il viendrait manger à la maison avec Nadège.
          </p>

          <p>
            Puis j’ouvre les yeux, ils sont humides, et je me dis que notre vie tient
            à bien peu de choses. Et pourtant, il aurait suffi que quelqu’un ne grille
            pas un « stop » pour qu’il puisse continuer sa vie… sa vie qu’on lui a
            volée. Alors non, cette date n’efface rien. Comme ce chauffard n’a pas
            effacé ta vie : il t’a tué, mais il ne t’a pas effacé. Personne ne peut
            t’effacer.
          </p>

          <p>
            Pardon si ces mots sont durs à lire, mais si vous saviez comme parfois
            c’est dur à vivre… sans lui.
          </p>

          <p>
            Cette année, Nadège m’a demandé de placer ce morceau de musique sur le blog.
            Les paroles sont touchantes… Des bises à vous tous qui venez lire ces lignes
            et entendre ce morceau.
          </p>
        </div>

        <div className="absolute right-0 -bottom-6 text-xs tracking-[0.4em] uppercase text-white/40 hidden md:block">
            Auteur : <span className="text-white/70">Michel</span>
        </div>

      </div>


            {/* Bloc musique */}
        <YouTubeEmbed url="https://youtu.be/rtunffvBdFg" title="Morceau demandé par Nadège" />
      {/* Commentaires */}
      <Comments />
    </main>
    <Footer />
    </>
  );
}
