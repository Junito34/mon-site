import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}