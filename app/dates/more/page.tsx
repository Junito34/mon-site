import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AllPages() {
  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <h2 className="text-[3vw] font-light">Toutes les pages</h2><br/>
      <li>
            <a href="/dates/2026" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                2026
            </a>
        </li>
        <li>
            <a href="/dates/2024" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                2024
            </a>
        </li>
        <li>
            <a href="/dates/2022" className="block px-4 py-2 text-sm hover:bg-white/10 transition">
                2022
            </a>
        </li>
    </main>
    <Footer />
    </>
  );
}
