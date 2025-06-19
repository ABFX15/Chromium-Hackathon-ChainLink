import { Metadata } from "next";
import { Providers } from "./providers";
import { ClientNav } from "./components/client-nav";
import "./globals.css";

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
      <body>
        <Providers>
          <ClientNav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
