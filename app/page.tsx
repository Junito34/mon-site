import Hero from "@/components/Hero";
import ImageSection from "@/components/ImageSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
