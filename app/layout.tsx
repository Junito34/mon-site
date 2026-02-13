import "./globals.css";
import { Playfair_Display } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { AuthProvider } from "@/context/AuthContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata = {
  title: "Hommage à mon frère",
  description: "Hommage à Jonathan Denis-Quanquin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${playfair.className} bg-black text-white overflow-x-hidden`}>
        <AuthProvider>
          <SmoothScroll />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
