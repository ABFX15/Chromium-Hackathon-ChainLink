import { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { Inter } from "next/font/google";
import { ClientNav } from "./components/client-nav";
import ParticlesBackground from "@/app/components/ParticlesBackground";
import MainLayout from "./components/MainLayout";

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
      <body className={`${inter.className} text-foreground`}>
        <ParticlesBackground />
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
