"use client";

import { useState, useMemo, useEffect } from "react";
import { useContracts } from "../contexts/ContractsContext";
import { PropertyNFTCard } from "@/app/components/PropertyNFTCard";
import { AdvancedSearch, SearchFilters } from "@/app/components/AdvancedSearch";
import {
  Building,
  Building2,
  Landmark,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { PropertyNFT } from "@/types/contracts";
import { Skeleton } from "@/app/components/ui/skeleton";
import { CompleteWorkflowModal } from "@/app/components/CompleteWorkflowModal";
import { Card } from "@/app/components/ui/card";

export default function MarketplacePage() {
  const {
    allProperties: properties,
    loading,
    loadAllProperties,
  } = useContracts();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 5000000],
    propertyType: [],
    location: [],
    yearBuilt: [1900, 2024],
    ltvRange: [0, 100],
    riskLevel: [],
  });

  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState<PropertyNFT | null>(null);

  const handleBuyClick = (nft: PropertyNFT) => {
    setSelectedNft(nft);
    setWorkflowModalOpen(true);
  };

  const filteredNfts = useMemo(() => {
    if (!properties) return [];
    return properties.filter((nft) => {
      const nameMatch = nft.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const priceMatch =
        nft.price >= filters.priceRange[0] &&
        nft.price <= filters.priceRange[1];
      const typeMatch =
        filters.propertyType.length === 0 ||
        filters.propertyType.some((type: string) =>
          nft.description.toLowerCase().includes(type.toLowerCase())
        );
      const locationMatch =
        filters.location.length === 0 ||
        filters.location.includes(nft.location);

      return nameMatch && priceMatch && typeMatch && locationMatch;
    });
  }, [properties, searchTerm, filters]);

  const stats = useMemo(() => {
    const totalValue = properties.reduce(
      (sum, nft) => sum + (nft.propertyValue || 0),
      0
    );
    const availableForLoan = properties.filter(
      (nft) => !nft.isCollateral
    ).length;

    return [
      {
        title: "Total Properties Listed",
        value: properties.length,
        icon: Building2,
        color: "from-cyan-500 to-cyan-600",
        description: "All properties available on the platform",
      },
      {
        title: "Total Value Locked",
        value: `$${(totalValue / 1_000_000).toFixed(1)}M`,
        icon: Landmark,
        color: "from-blue-500 to-blue-600",
        description: "Total value of all listed assets",
      },
      {
        title: "Available for Loans",
        value: availableForLoan,
        icon: DollarSign,
        color: "from-green-500 to-green-600",
        description: "Properties ready for new loan applications",
      },
      {
        title: "Avg. Property Value",
        value: `$${(totalValue / (properties.length || 1) / 1000).toFixed(0)}K`,
        icon: TrendingUp,
        color: "from-purple-500 to-purple-600",
        description: "Average value per listed property",
      },
    ];
  }, [properties]);

  if (loading && properties.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Building2 className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl lg:text-5xl font-bold font-heading bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Real World Asset Marketplace
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Browse, purchase, and invest in tokenized real-world properties.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="font-medium text-gray-300">{stat.title}</p>
                  <p className="text-sm text-gray-400">{stat.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border-white/20 p-6">
          <h2 className="text-2xl font-bold font-heading text-white mb-6">
            All Properties ({properties.length})
          </h2>
          <button
            onClick={loadAllProperties}
            className="mb-6 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
          >
            Refresh Marketplace
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((nft) => (
              <PropertyNFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </Card>
      </div>

      {selectedNft && (
        <CompleteWorkflowModal
          isOpen={workflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          nft={selectedNft}
          mode="buy"
        />
      )}
    </div>
  );
}

const mockProperties = [
  {
    id: "1",
    name: "Luxury Downtown Apartment",
    location: "New York, NY",
    price: "500000",
    imageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=face",
    beds: 2,
    baths: 2,
    sqft: 1200,
    propertyType: "Apartment",
    yearBuilt: 2020,
    description: "Modern luxury apartment in the heart of downtown",
  },
  {
    id: "2",
    name: "Suburban Family Home",
    location: "Austin, TX",
    price: "350000",
    imageUrl:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&crop=face",
    beds: 4,
    baths: 3,
    sqft: 2400,
    propertyType: "House",
    yearBuilt: 2015,
    description: "Spacious family home in quiet neighborhood",
  },
  {
    id: "3",
    name: "Modern Condo",
    location: "San Francisco, CA",
    price: "750000",
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&crop=face",
    beds: 3,
    baths: 2,
    sqft: 1800,
    propertyType: "Condo",
    yearBuilt: 2018,
    description: "Sleek modern condo with bay views",
  },
  {
    id: "4",
    name: "Investment Property",
    location: "Miami, FL",
    price: "425000",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&crop=face",
    beds: 3,
    baths: 2,
    sqft: 1600,
    propertyType: "House",
    yearBuilt: 2016,
    description: "Prime investment property in growing market",
  },
];
