"use client";

import { useState, useMemo, useEffect } from "react";
import { useContracts } from "@/app/hooks/useContracts";
import { PropertyNFTCard } from "@/app/components/PropertyNFTCard";
import { AdvancedSearch, SearchFilters } from "@/app/components/AdvancedSearch";
import { Building } from "lucide-react";
import { PropertyNFT } from "@/types/contracts";
import { Skeleton } from "@/app/components/ui/skeleton";
import { CompleteWorkflowModal } from "@/app/components/CompleteWorkflowModal";

export default function MarketplacePage() {
  const { allProperties: nfts, loading, loadAllProperties } = useContracts();
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

  useEffect(() => {
    loadAllProperties();
  }, [loadAllProperties]);

  const handleBuyClick = (nft: PropertyNFT) => {
    setSelectedNft(nft);
    setWorkflowModalOpen(true);
  };

  const filteredNfts = useMemo(() => {
    if (!nfts) return [];
    return nfts.filter((nft) => {
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
  }, [nfts, searchTerm, filters]);

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 font-heading">
          Real World Asset Marketplace
        </h1>
        <p className="text-white/60">
          Browse, purchase, and invest in tokenized real-world properties.
        </p>
      </div>

      {/* Search and Filters */}
      <AdvancedSearch
        onSearchChange={setSearchTerm}
        onFiltersChange={setFilters}
      />

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-effect rounded-2xl p-4 space-y-3">
                <Skeleton className="h-48 w-full rounded-xl bg-gray-700/50" />
                <Skeleton className="h-6 w-3/4 rounded-lg bg-gray-700/50" />
                <Skeleton className="h-4 w-1/2 rounded-lg bg-gray-700/50" />
                <Skeleton className="h-8 w-full rounded-lg bg-gray-700/50" />
              </div>
            ))
          : filteredNfts.map((nft: PropertyNFT) => (
              <PropertyNFTCard
                key={nft.id}
                nft={nft}
                showBuyButton={true}
                onBuy={handleBuyClick}
              />
            ))}
      </div>

      {!loading && filteredNfts.length === 0 && (
        <div className="text-center py-20 col-span-full">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            No properties found
          </h3>
          <p className="text-gray-400">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      )}

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
