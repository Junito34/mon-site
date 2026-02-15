import Hero from "@/components/layout/Hero";
import ImageSection from "@/features/articles/components/ImageSection";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ImageSection 
        image="/images/acceuil_photo1.jpg"
        title="Photo à 3"
        overlay={0.4} />

        <ImageSection 
        image="/images/acceuil_photo2.jpg"
        overlay={0.2} />
      </main>
      <Footer />
    </>
  );
}
