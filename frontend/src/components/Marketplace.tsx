import { useState } from "react";
import { Property } from "../types/property";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Home, Building, Factory, MapPin } from "lucide-react";

interface MarketplaceProps {
  properties: Property[];
  isLoading: boolean;
  onLoadMore: () => void;
}

export function Marketplace({
  properties,
  isLoading,
  onLoadMore,
}: MarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<
    "all" | "residential" | "commercial" | "industrial"
  >("all");
  const [sortBy, setSortBy] = useState<string>("value-desc");

  const filteredProperties = properties
    .filter((property) => {
      const matchesSearch =
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || property.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0ff]" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#0f1c2e]/30 border border-[#0ff]/20 rounded-md text-[#0ff] placeholder-[#0ff]/50 focus:outline-none focus:border-[#0ff]/50"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 px-4 bg-[#0f1c2e]/30 border border-[#0ff]/20 rounded-md text-[#0ff] focus:outline-none focus:border-[#0ff]/50"
        >
          <option value="value-desc">Highest Value</option>
          <option value="value-asc">Lowest Value</option>
        </select>
      </div>

      {/* Property Type Filters */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setSelectedType("all")}
          className={`h-10 px-6 rounded-md transition-colors ${
            selectedType === "all"
              ? "bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/50"
              : "text-[#0ff]/70 hover:bg-[#0ff]/10 border border-[#0ff]/20"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedType("residential")}
          className={`h-10 px-6 rounded-md transition-colors flex items-center gap-2 ${
            selectedType === "residential"
              ? "bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/50"
              : "text-[#0ff]/70 hover:bg-[#0ff]/10 border border-[#0ff]/20"
          }`}
        >
          <Home className="w-4 h-4" /> Residential
        </button>
        <button
          onClick={() => setSelectedType("commercial")}
          className={`h-10 px-6 rounded-md transition-colors flex items-center gap-2 ${
            selectedType === "commercial"
              ? "bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/50"
              : "text-[#0ff]/70 hover:bg-[#0ff]/10 border border-[#0ff]/20"
          }`}
        >
          <Building className="w-4 h-4" /> Commercial
        </button>
        <button
          onClick={() => setSelectedType("industrial")}
          className={`h-10 px-6 rounded-md transition-colors flex items-center gap-2 ${
            selectedType === "industrial"
              ? "bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/50"
              : "text-[#0ff]/70 hover:bg-[#0ff]/10 border border-[#0ff]/20"
          }`}
        >
          <Factory className="w-4 h-4" /> Industrial
        </button>
      </div>

      {/* Property List */}
      <div className="space-y-4">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className="bg-[#0f1c2e]/30 border border-[#0ff]/20 rounded-lg hover:border-[#0ff]/50 transition-colors"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-medium text-[#0ff] mb-2">
                    {property.name}
                  </h3>
                  <div className="flex items-center text-[#0ff]/70">
                    <MapPin className="w-4 h-4 mr-1" />
                    {property.location}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    property.status === "available"
                      ? "bg-[#0ff]/10 text-[#0ff]"
                      : "bg-[#2d6dff]/10 text-[#2d6dff]"
                  }`}
                >
                  {property.status.charAt(0).toUpperCase() +
                    property.status.slice(1)}
                </span>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-[#0ff]/70 text-sm mb-1">Value</div>
                  <div className="text-xl font-medium text-[#0ff]">
                    ${property.value.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[#0ff]/70 text-sm mb-1">Size</div>
                  <div className="text-xl font-medium text-[#0ff]">
                    {property.metrics.sqft.toLocaleString()} sqft
                  </div>
                </div>
                <div>
                  <div className="text-[#0ff]/70 text-sm mb-1">Built</div>
                  <div className="text-xl font-medium text-[#0ff]">
                    {property.metrics.yearBuilt}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button className="w-full bg-[#0ff]/10 hover:bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/20 hover:border-[#0ff]/50 transition-colors">
                View Property
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-[#0ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        filteredProperties.length > 0 && (
          <Button
            onClick={onLoadMore}
            className="w-full mt-4 bg-[#0f1c2e]/30 hover:bg-[#0f1c2e]/50 text-[#0ff] border border-[#0ff]/20 hover:border-[#0ff]/50 transition-colors"
          >
            Load More Properties
          </Button>
        )
      )}
    </div>
  );
}
