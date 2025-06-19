import { Property } from "../types/property";
import { Card } from "./ui/card";

interface PropertyNFTCardProps {
  property: Property;
}

export function PropertyNFTCard({ property }: PropertyNFTCardProps) {
  return (
    <Card className="overflow-hidden border border-cyan-500/20 bg-black/50 backdrop-blur-sm">
      <div className="relative aspect-square">
        <img
          src={property.imageUrl}
          alt={property.name}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold text-cyan-400">{property.name}</h3>
        <p className="text-cyan-300/70">{property.location}</p>
        <p className="text-xl font-mono text-cyan-400">
          ${property.value.toLocaleString()}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm text-cyan-300/60">
          <div>{property.metrics.sqft.toLocaleString()} sqft</div>
          {property.metrics.bedrooms && (
            <div>{property.metrics.bedrooms} beds</div>
          )}
          {property.metrics.bathrooms && (
            <div>{property.metrics.bathrooms} baths</div>
          )}
          <div>Built {property.metrics.yearBuilt}</div>
        </div>
      </div>
    </Card>
  );
}
