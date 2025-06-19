"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function ClientNav() {
  return (
    <nav
      style={{
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(0, 255, 255, 0.2)",
        backgroundColor: "black",
        color: "#0ff",
      }}
    >
      <div style={{ display: "flex", gap: "2rem" }}>
        <Link href="/" style={{ color: "#0ff", textDecoration: "none" }}>
          Dashboard
        </Link>
        <Link
          href="/marketplace"
          style={{ color: "#0ff", textDecoration: "none" }}
        >
          Marketplace
        </Link>
        <Link href="/loans" style={{ color: "#0ff", textDecoration: "none" }}>
          Loans
        </Link>
        <Link
          href="/liquidation"
          style={{ color: "#0ff", textDecoration: "none" }}
        >
          Liquidation
        </Link>
        <Link
          href="/portfolio"
          style={{ color: "#0ff", textDecoration: "none" }}
        >
          Portfolio
        </Link>
      </div>
      <ConnectButton />
    </nav>
  );
}
