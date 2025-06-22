"use client";

import { Logo } from "./Logo";
import { Building, Home, LineChart, Repeat, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnectButton } from "./WalletConnectButton";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: Building },
    { href: "/portfolio", label: "Portfolio", icon: Wallet },
    { href: "/loans", label: "Loans", icon: LineChart },
    { href: "/cross-chain", label: "Cross-Chain", icon: Repeat },
  ];

  return (
    <header className="flex items-center justify-between p-4 bg-transparent text-white">
      <div className="flex items-center gap-8">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 transition-colors hover:text-cyan-400 ${
                pathname === link.href ? "text-cyan-400" : "text-gray-300"
              }`}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <WalletConnectButton />
      </div>
    </header>
  );
}
