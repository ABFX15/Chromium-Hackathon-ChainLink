import { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { Inter } from "next/font/google";
import { ClientNav } from "./components/client-nav";
import ParticlesBackground from "./components/ParticlesBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ORACLEND - AI Lending Dashboard",
  description:
    "Cross-chain, AI-powered private credit protocol for real-world assets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ParticlesBackground />
          <ClientNav />
          <main className="pl-60">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
