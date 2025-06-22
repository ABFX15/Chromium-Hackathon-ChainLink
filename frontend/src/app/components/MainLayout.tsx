"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navbar, type NavigationTab } from "./Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = (): NavigationTab => {
    const currentPath = pathname.substring(1);
    if (currentPath.startsWith("portfolio")) return "portfolio";
    if (currentPath.startsWith("loans")) return "loans";
    if (currentPath.startsWith("liquidation")) return "liquidation";
    if (currentPath.startsWith("cross-chain")) return "cross-chain";
    return "marketplace";
  };

  const [activeTab, setActiveTab] = useState<NavigationTab>(getActiveTab());

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname]);

  const handleTabChange = (tab: NavigationTab) => {
    router.push(`/${tab}`);
  };

  return (
    <>
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="relative z-10 pt-20">{children}</main>
    </>
  );
}
