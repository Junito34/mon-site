import "./globals.css";
import { Playfair_Display } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Providers from "./providers";
import { getInitialUser } from "@/lib/auth/getInitialUser";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata = {
  title: "Hommage à mon frère",
  description: "Hommage à Jonathan Denis-Quanquin",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialUser = await getInitialUser();

  return (
    <html lang="fr">
      <body className={`${playfair.className} bg-black text-white overflow-x-hidden`}>
        <Providers initialUser={initialUser}>
          <SmoothScroll />
          {children}
        </Providers>
      </body>
    </html>
  );
}