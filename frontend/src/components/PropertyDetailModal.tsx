import { useState } from "react";
import { Property } from "../types/property";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Home,
  Building,
  Factory,
  DollarSign,
  Calendar,
  Ruler,
} from "lucide-react";
import Image from "next/image";

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateLoan: (property: Property) => void;
  onBuyProperty: (property: Property) => void;
}

export function PropertyDetailModal({
  property,
  isOpen,
  onClose,
  onCreateLoan,
  onBuyProperty,
}: PropertyDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!property) return null;

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

  const handleAction = async (action: "loan" | "buy") => {
    setIsLoading(true);
    try {
      if (action === "loan") {
        await onCreateLoan(property);
      } else {
        await onBuyProperty(property);
      }
      onClose();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f1c2e] border-[#0ff]/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0ff] flex items-center gap-2">
            {getPropertyIcon(property.type)}
            {property.name}
          </DialogTitle>
          <DialogDescription className="text-[#88ccff] flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {property.location}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {/* Property Image */}
          <div className="relative h-64 rounded-lg overflow-hidden mb-6">
            <Image
              src={property.imageUrl}
              alt={property.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-[#0f1c2e]/50 p-4 rounded-lg border border-[#0ff]/20">
              <div className="flex items-center gap-2 text-[#0ff] mb-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm">Value</span>
              </div>
              <div className="text-xl font-medium">
                ${property.value.toLocaleString()}
              </div>
            </div>
            <div className="bg-[#0f1c2e]/50 p-4 rounded-lg border border-[#0ff]/20">
              <div className="flex items-center gap-2 text-[#0ff] mb-2">
                <Ruler className="w-4 h-4" />
                <span className="text-sm">Size</span>
              </div>
              <div className="text-xl font-medium">
                {property.metrics.sqft.toLocaleString()} sqft
              </div>
            </div>
            <div className="bg-[#0f1c2e]/50 p-4 rounded-lg border border-[#0ff]/20">
              <div className="flex items-center gap-2 text-[#0ff] mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Built</span>
              </div>
              <div className="text-xl font-medium">
                {property.metrics.yearBuilt}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-[#0ff] text-lg font-medium mb-2">
              Description
            </h3>
            <p className="text-[#88ccff]">{property.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              className="flex-1 bg-gradient-to-r from-[#0ff] to-[#2d6dff] hover:from-[#0ff]/80 hover:to-[#2d6dff]/80 text-white"
              onClick={() => handleAction("loan")}
              disabled={isLoading || property.status !== "available"}
            >
              {isLoading ? "Processing..." : "Create Loan"}
            </Button>
            <Button
              className="flex-1 bg-[#0ff]/10 hover:bg-[#0ff]/20 text-[#0ff] border border-[#0ff]/20"
              onClick={() => handleAction("buy")}
              disabled={isLoading || property.status !== "available"}
            >
              {isLoading ? "Processing..." : "Buy Property"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
