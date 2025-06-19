"use client";

import { useContracts } from "../../hooks/use-contracts";
import { usePropertyNFTs } from "../../hooks/use-property-nfts";
import { PropertyNFTCard } from "../components/PropertyNFTCard";
import { StatsCard } from "../../components/ui/stats-card";
import { Building2, Wallet, TrendingUp } from "lucide-react";
import { Property } from "../../types/property";
import { propertyService } from "../../services/propertyService";

export default function PortfolioPage() {
  const { userNFTs, userUSDCBalance } = useContracts();
  const { nfts, isLoading } = usePropertyNFTs();

  // Get mock properties for display
  const propertyNfts = propertyService.getMockProperties();

  const totalValue =
    propertyNfts?.reduce((sum: number, nft: Property) => sum + nft.value, 0) ||
    0;
  const averageValue = propertyNfts?.length
    ? totalValue / propertyNfts.length
    : 0;

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "#0ff",
        fontFamily: "monospace",
        padding: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>📊</span>
          <span>My Portfolio</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <StatsCard
          title="Total Properties"
          value={String(userNFTs || 0)}
          icon={Building2}
          description="Number of properties owned"
        />
        <StatsCard
          title="Portfolio Value"
          value={`$${totalValue.toLocaleString()}`}
          icon={Wallet}
          description="Total value of properties"
        />
        <StatsCard
          title="Average Value"
          value={`$${averageValue.toLocaleString()}`}
          icon={TrendingUp}
          description="Average property value"
        />
      </div>

      {/* Properties Grid */}
      <div
        style={{
          border: "1px solid rgba(0, 255, 255, 0.2)",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div style={{ color: "#0ff", marginBottom: "20px" }}>My Properties</div>
        {isLoading ? (
          <div>Loading properties...</div>
        ) : propertyNfts?.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {propertyNfts.map((nft: Property) => (
              <PropertyNFTCard key={nft.tokenId} property={nft} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ marginBottom: "20px" }}>No properties found</div>
            <div style={{ color: "rgba(0, 255, 255, 0.6)" }}>
              Visit the marketplace to browse available properties
            </div>
          </div>
        )}
      </div>

      {/* USDC Balance */}
      <div
        style={{
          border: "1px solid rgba(0, 255, 255, 0.2)",
          padding: "20px",
        }}
      >
        <div style={{ color: "#0ff", marginBottom: "10px" }}>
          Available USDC Balance
        </div>
        <div style={{ fontSize: "24px" }}>
          ${Number(userUSDCBalance).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
