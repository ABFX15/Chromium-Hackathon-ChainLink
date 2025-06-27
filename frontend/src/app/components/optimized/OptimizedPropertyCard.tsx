"use client";

import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  DollarSign, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { PropertyNFTData } from '../../types/enhanced-contracts';
import { formatCurrency, formatNumber } from '../../lib/utils';

interface PropertyCardProps {
  property: PropertyNFTData;
  onView?: (property: PropertyNFTData) => void;
  onCreateLoan?: (property: PropertyNFTData) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

// Memoized internal components
const PropertyImage = memo(({ image, name, isCollateral }: { 
  image: string; 
  name: string; 
  isCollateral: boolean;
}) => (
  <div className="relative overflow-hidden rounded-t-lg">
    <img
      src={image || '/properties/mock-1.jpg'}
      alt={name}
      className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
      loading="lazy"
    />
    {isCollateral && (
      <Badge className="absolute top-2 right-2 bg-blue-500/90 text-white">
        Collateralized
      </Badge>
    )}
  </div>
));

PropertyImage.displayName = 'PropertyImage';

const PropertyStats = memo(({ 
  propertyValue, 
  maxLoan, 
  riskScore, 
  compact 
}: { 
  propertyValue: bigint; 
  maxLoan: bigint; 
  riskScore: number; 
  compact?: boolean;
}) => {
  const calculations = useMemo(() => {
    const valueInEth = Number(propertyValue) / 1e18;
    const maxLoanInEth = Number(maxLoan) / 1e18;
    const ltv = propertyValue > 0n ? (maxLoan * 100n) / propertyValue : 0n;
    
    const riskCategory = riskScore < 30 ? 'low' : riskScore < 70 ? 'medium' : 'high';
    const riskColor = riskCategory === 'low' ? 'text-green-500' : 
                     riskCategory === 'medium' ? 'text-yellow-500' : 'text-red-500';
    const riskIcon = riskCategory === 'low' ? CheckCircle : 
                    riskCategory === 'medium' ? Clock : AlertTriangle;
    
    return {
      valueInEth,
      maxLoanInEth,
      ltv: Number(ltv),
      riskCategory,
      riskColor,
      RiskIcon: riskIcon,
    };
  }, [propertyValue, maxLoan, riskScore]);

  if (compact) {
    return (
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold">${formatNumber(calculations.valueInEth)}</span>
        <div className={`flex items-center gap-1 ${calculations.riskColor}`}>
          <calculations.RiskIcon className="w-3 h-3" />
          <span>{calculations.riskCategory}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-gray-500">Property Value</p>
        <p className="font-semibold text-lg">${formatNumber(calculations.valueInEth)}</p>
      </div>
      <div>
        <p className="text-gray-500">Max Loan</p>
        <p className="font-semibold text-lg">${formatNumber(calculations.maxLoanInEth)}</p>
      </div>
      <div>
        <p className="text-gray-500">LTV</p>
        <p className="font-semibold">{calculations.ltv}%</p>
      </div>
      <div>
        <p className="text-gray-500">Risk Score</p>
        <div className={`flex items-center gap-1 ${calculations.riskColor} font-semibold`}>
          <calculations.RiskIcon className="w-4 h-4" />
          <span>{riskScore}/100</span>
        </div>
      </div>
    </div>
  );
});

PropertyStats.displayName = 'PropertyStats';

const PropertyActions = memo(({ 
  property, 
  onView, 
  onCreateLoan 
}: { 
  property: PropertyNFTData;
  onView?: (property: PropertyNFTData) => void;
  onCreateLoan?: (property: PropertyNFTData) => void;
}) => {
  const handleView = useCallback(() => {
    onView?.(property);
  }, [onView, property]);

  const handleCreateLoan = useCallback(() => {
    onCreateLoan?.(property);
  }, [onCreateLoan, property]);

  const canCreateLoan = useMemo(() => {
    return !property.isCollateral && property.propertyValue > 0n;
  }, [property.isCollateral, property.propertyValue]);

  return (
    <div className="flex gap-2 pt-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleView}
        className="flex-1 flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View Details
      </Button>
      {canCreateLoan && (
        <Button 
          size="sm" 
          onClick={handleCreateLoan}
          className="flex-1 flex items-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          Create Loan
        </Button>
      )}
    </div>
  );
});

PropertyActions.displayName = 'PropertyActions';

// Main component with memoization
export const OptimizedPropertyCard = memo<PropertyCardProps>(({
  property,
  onView,
  onCreateLoan,
  showActions = true,
  compact = false,
  className = '',
}) => {
  const cardContent = useMemo(() => {
    if (compact) {
      return (
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <img
              src={property.image || '/properties/mock-1.jpg'}
              alt={property.name}
              className="w-12 h-12 rounded object-cover"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{property.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{property.location}</span>
              </div>
            </div>
            <div className="text-right">
              <PropertyStats
                propertyValue={property.propertyValue}
                maxLoan={property.maxLoan}
                riskScore={property.riskScore}
                compact={true}
              />
            </div>
          </div>
        </CardContent>
      );
    }

    return (
      <>
        <PropertyImage
          image={property.image}
          name={property.name}
          isCollateral={property.isCollateral}
        />
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{property.name}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{property.location}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>
          
          <PropertyStats
            propertyValue={property.propertyValue}
            maxLoan={property.maxLoan}
            riskScore={property.riskScore}
          />
          
          {showActions && (
            <PropertyActions
              property={property}
              onView={onView}
              onCreateLoan={onCreateLoan}
            />
          )}
        </CardContent>
      </>
    );
  }, [property, onView, onCreateLoan, showActions, compact]);

  return (
    <Card className={`
      transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
      ${compact ? 'h-auto' : 'h-full'} 
      ${className}
    `}>
      {cardContent}
    </Card>
  );
});

OptimizedPropertyCard.displayName = 'OptimizedPropertyCard';