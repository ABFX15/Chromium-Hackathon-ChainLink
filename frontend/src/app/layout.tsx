import { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { Inter, Orbitron } from "next/font/google";
import MainLayout from "./components/MainLayout";
import ParticlesBackground from "./components/ParticlesBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "ORACLEND",
  description: "Next-gen RWA lending with AI risk analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable} font-sans`}>
        <ParticlesBackground />
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
