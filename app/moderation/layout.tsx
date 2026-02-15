import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { requireAdmin } from "@/features/auth/lib/requireAdmin";

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