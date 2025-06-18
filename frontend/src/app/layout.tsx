import "./globals.css";
import type { Metadata } from "next";
import { type ReactNode } from "react";
import Link from "next/link";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ORACLEND - AI Lending Dashboard",
  description:
    "Cross-chain, AI-powered private credit protocol for real-world assets",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black min-h-screen font-mono text-cyan-300 grid-bg">
        <Providers>
          <nav className="w-full border-b border-cyan-700 py-2 px-4 flex items-center justify-between bg-black/90 sticky top-0 z-50">
            <div className="flex items-center gap-6">
              <span className="font-bold text-cyan-400 text-lg tracking-widest">
                ORACLEND
              </span>
              <span className="text-xs text-cyan-600 ml-1">AI LENDING</span>
              <Link
                href="/marketplace"
                className="px-2 py-1 hover:bg-cyan-900/30 rounded transition-colors"
              >
                [buy properties]
              </Link>
              <Link
                href="/portfolio"
                className="px-2 py-1 hover:bg-cyan-900/30 rounded transition-colors"
              >
                [my properties]
              </Link>
              <Link
                href="/loans"
                className="px-2 py-1 hover:bg-cyan-900/30 rounded transition-colors"
              >
                [my loans]
              </Link>
              <Link
                href="/liquidation"
                className="px-2 py-1 hover:bg-cyan-900/30 rounded transition-colors"
              >
                [liquidation]
              </Link>
              <Link
                href="/earnings"
                className="px-2 py-1 hover:bg-cyan-900/30 rounded transition-colors"
              >
                [earnings]
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* Wallet/network/notification icons placeholder */}
              <span className="text-cyan-400 text-xs bg-cyan-900/30 px-2 py-1 rounded">
                ETH
              </span>
              <span className="text-cyan-400 text-xs bg-cyan-900/30 px-2 py-1 rounded">
                Sepolia
              </span>
              <span className="text-cyan-400 text-xs bg-cyan-900/30 px-2 py-1 rounded">
                0.045 ETH
              </span>
              <span className="text-cyan-400 text-xs bg-cyan-900/30 px-2 py-1 rounded">
                0x88...cF9F
              </span>
              <span className="text-cyan-400 text-xs bg-cyan-900/30 px-2 py-1 rounded">
                🔔
              </span>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
