import { useState } from "react";
import { Property } from "../types/property";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  MapPin,
  Home,
  Building,
  Factory,
  DollarSign,
  Calendar,
  Ruler,
  ImageIcon,
} from "lucide-react";

interface MarketplaceProps {
  properties: Property[];
  isLoading: boolean;
  onLoadMore: () => void;
  onCreateLoan?: (property: Property) => Promise<void>;
  onBuyProperty?: (property: Property) => Promise<void>;
}

const FALLBACK_IMAGE = "/properties/property-placeholder.jpg";

export function Marketplace({
  properties,
  isLoading: isLoadingProps,
  onLoadMore,
  onCreateLoan,
  onBuyProperty,
}: MarketplaceProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleImageError = (propertyId: string) => {
    setFailedImages((prev) => new Set(prev).add(propertyId));
  };

  const handleCreateLoan = async (property: Property) => {
    if (!onCreateLoan) return;
    setIsActionLoading(true);
    try {
      await onCreateLoan(property);
      setSelectedProperty(null);
    } catch (error) {
      console.error("Failed to create loan:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBuyProperty = async (property: Property) => {
    if (!onBuyProperty) return;
    setIsActionLoading(true);
    try {
      await onBuyProperty(property);
      setSelectedProperty(null);
    } catch (error) {
      console.error("Failed to buy property:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case "residential":
        return <Home className="w-5 h-5" />;
      case "commercial":
        return <Building className="w-5 h-5" />;
      case "industrial":
        return <Factory className="w-5 h-5" />;
      default:
        return <Building className="w-5 h-5" />;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            className="bg-[#0f1c2e]/30 border border-[#0ff]/20 rounded-lg overflow-hidden cursor-pointer group hover:border-[#0ff]/50 transition-all duration-200"
            onClick={() => handlePropertyClick(property)}
          >
            <div className="relative h-48">
              {failedImages.has(property.id) ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0f1c2e]/50">
                  <ImageIcon className="w-12 h-12 text-[#0ff]/50" />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={property.imageUrl || FALLBACK_IMAGE}
                    alt={property.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={() => handleImageError(property.id)}
                    priority
                  />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-medium text-[#0ff]">
                {property.name}
              </h3>
              <p className="text-[#0ff]/70">{property.location}</p>
              <p className="text-xl font-bold text-[#0ff] mt-2">
                ${property.value.toLocaleString()}
              </p>
              <Button
                className="w-full mt-4 bg-[#0ff]/10 hover:bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/20 hover:border-[#0ff]/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePropertyClick(property);
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={selectedProperty !== null}
        onOpenChange={(open) => !open && setSelectedProperty(null)}
      >
        {selectedProperty && (
          <DialogPortal>
            <DialogOverlay className="bg-black/80 backdrop-blur-sm fixed inset-0" />
            <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-[#0f1c2e] p-6 shadow-lg duration-200 rounded-lg border-[#0ff]/20 text-white data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#0ff] flex items-center gap-2">
                  {getPropertyIcon(selectedProperty.type)}
                  {selectedProperty.name}
                </DialogTitle>
                <DialogDescription className="text-[#88ccff] flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {selectedProperty.location}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4">
                <div className="relative h-64 rounded-lg overflow-hidden mb-6">
                  {failedImages.has(selectedProperty.id) ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0f1c2e]/50">
                      <ImageIcon className="w-16 h-16 text-[#0ff]/50" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={selectedProperty.imageUrl || FALLBACK_IMAGE}
                        alt={selectedProperty.name}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(selectedProperty.id)}
                        priority
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#0f1c2e]/50 p-4 rounded-lg border border-[#0ff]/20">
                    <div className="flex items-center gap-2 text-[#0ff] mb-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Value</span>
                    </div>
                    <div className="text-xl font-medium">
                      ${selectedProperty.value.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-[#0f1c2e]/50 p-4 rounded-lg border border-[#0ff]/20">
                    <div className="flex items-center gap-2 text-[#0ff] mb-2">
                      <Ruler className="w-4 h-4" />
                      <span className="text-sm">Size</span>
                    </div>
                    <div className="text-xl font-medium">
                      {selectedProperty.metrics.sqft.toLocaleString()} sqft
                    </div>
                  </div>
                  <div className="bg-[#0f1c2e]/50 p-4 rounded-lg border border-[#0ff]/20">
                    <div className="flex items-center gap-2 text-[#0ff] mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Year Built</span>
                    </div>
                    <div className="text-xl font-medium">
                      {selectedProperty.metrics.yearBuilt}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-[#0ff] font-medium mb-2">Description</h4>
                  <p className="text-[#88ccff]">
                    {selectedProperty.description}
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#0ff] to-[#2d6dff] hover:from-[#0ff]/80 hover:to-[#2d6dff]/80 transition-all duration-200 shadow-[0_0_15px_rgba(45,109,255,0.3)]"
                    onClick={() => handleCreateLoan(selectedProperty)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? "Processing..." : "Create Loan"}
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-[#0ff] to-[#2d6dff] hover:from-[#0ff]/80 hover:to-[#2d6dff]/80 transition-all duration-200 shadow-[0_0_15px_rgba(45,109,255,0.3)]"
                    onClick={() => handleBuyProperty(selectedProperty)}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? "Processing..." : "Buy Property"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </DialogPortal>
        )}
      </Dialog>

      {properties.length > 0 && !isLoadingProps && (
        <div className="mt-6 text-center">
          <Button
            onClick={onLoadMore}
            disabled={isLoadingProps}
            className="bg-[#0ff]/10 hover:bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/20"
          >
            {isLoadingProps ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  );
}
