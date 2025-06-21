"use client";

import { Property } from "../../types/property";
import { Card, CardContent, CardHeader } from "../../components/ui/card";

interface PropertyNFTCardProps {
  property: Property;
}

export function PropertyNFTCard({ property }: PropertyNFTCardProps) {
  return (
    <div className="card-enhanced nft-card p-4 hover:border-cyan-400/50 transition-all duration-300 relative group">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:via-cyan-500/5 group-hover:to-blue-500/10 rounded-xl transition-all duration-500"></div>
      <div className="relative z-10">
        <CardHeader className="relative p-0">
          <img
            src={property.imageUrl}
            alt={property.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-[#0ff] mb-2">
            {property.name}
          </h3>
          <div className="text-sm text-[#0ff]/60 mb-4">{property.location}</div>
          <div className="flex justify-between items-center">
            <div className="text-[#0ff]">${property.value.toLocaleString()}</div>
            <div className="text-xs px-2 py-1 rounded bg-[#0ff]/10 text-[#0ff]">
              {property.type}
            </div>
          </div>
          {property.metrics && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-[#0ff]/60">
              {property.metrics.sqft && (
                <div>{property.metrics.sqft.toLocaleString()} sqft</div>
              )}
              {property.metrics.bedrooms && (
                <div>{property.metrics.bedrooms} beds</div>
              )}
              {property.metrics.bathrooms && (
                <div>{property.metrics.bathrooms} baths</div>
              )}
              {property.metrics.yearBuilt && (
                <div>Built {property.metrics.yearBuilt}</div>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}