
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Building2, 
  CreditCard, 
  TrendingDown, 
  Wallet, 
  BarChart3,
  Brain,
  DollarSign
} from "lucide-react";

export function ClientNav() {
  const pathname = usePathname();

  const navItems = [
    { 
      href: "/", 
      label: "Dashboard", 
      icon: Home,
      description: "Overview & Analytics"
    },
    { 
      href: "/marketplace", 
      label: "Marketplace", 
      icon: Building2,
      description: "Property NFTs"
    },
    { 
      href: "/loans", 
      label: "AI Loans", 
      icon: Brain,
      description: "Smart Lending"
    },
    { 
      href: "/portfolio", 
      label: "Portfolio", 
      icon: Wallet,
      description: "Your Assets"
    },
    { 
      href: "/liquidation", 
      label: "Liquidation", 
      icon: TrendingDown,
      description: "Risk Management"
    },
    { 
      href: "/analytics", 
      label: "Analytics", 
      icon: BarChart3,
      description: "Market Insights"
    }
  ];

  return (
    <nav style={{
      background: "linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(6, 182, 212, 0.1) 100%)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(6, 182, 212, 0.2)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
    }}>
      {/* Main Navigation Bar */}
      <div style={{
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <DollarSign style={{ color: "white", width: "24px", height: "24px" }} />
          </div>
          <div>
            <h1 style={{
              fontSize: "20px",
              fontWeight: "bold",
              background: "linear-gradient(to right, #06b6d4, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0
            }}>
              ORACLEND
            </h1>
            <p style={{
              fontSize: "10px",
              color: "rgba(6, 182, 212, 0.7)",
              fontFamily: "monospace",
              letterSpacing: "1px",
              margin: 0
            }}>
              AI LENDING PROTOCOL
            </p>
          </div>
        </div>

        {/* Connect Wallet */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          {/* Network Status */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "6px 12px",
            borderRadius: "20px"
          }}>
            <div style={{
              width: "8px",
              height: "8px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
              animation: "pulse 2s infinite"
            }} />
            <span style={{ color: "#10b981", fontSize: "12px", fontWeight: "600" }}>
              Sepolia
            </span>
          </div>
          
          <div style={{
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
            borderRadius: "12px",
            padding: "2px"
          }}>
            <div style={{ background: "black", borderRadius: "10px" }}>
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        borderTop: "1px solid rgba(6, 182, 212, 0.1)",
        background: "rgba(0, 0, 0, 0.4)"
      }}>
        <div style={{
          display: "flex",
          overflowX: "auto",
          padding: "0 2rem"
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "16px 20px",
                  textDecoration: "none",
                  position: "relative",
                  transition: "all 0.3s ease",
                  borderBottom: isActive 
                    ? "2px solid #06b6d4" 
                    : "2px solid transparent",
                  color: isActive ? "#06b6d4" : "rgba(255, 255, 255, 0.7)",
                  background: isActive 
                    ? "rgba(6, 182, 212, 0.1)" 
                    : "transparent",
                  whiteSpace: "nowrap",
                  minWidth: "fit-content"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "#06b6d4";
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon style={{ width: "18px", height: "18px" }} />
                <div>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: isActive ? "600" : "500"
                  }}>
                    {item.label}
                  </div>
                  <div style={{ 
                    fontSize: "10px", 
                    color: "rgba(255, 255, 255, 0.5)",
                    lineHeight: "1"
                  }}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </nav>
  );
}
