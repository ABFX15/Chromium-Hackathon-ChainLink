"use client";

import React, { memo, useMemo, useState, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { OptimizedPropertyCard } from './OptimizedPropertyCard';
import { PropertyNFTData } from '../../types/enhanced-contracts';
import { useFilteredProperties } from '../../store/appStore';

interface VirtualizedPropertyGridProps {
  properties: PropertyNFTData[];
  onPropertyView?: (property: PropertyNFTData) => void;
  onCreateLoan?: (property: PropertyNFTData) => void;
  itemsPerRow?: number;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

// Memoized grid item component
const GridItem = memo(({ 
  columnIndex, 
  rowIndex, 
  style, 
  data 
}: {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    properties: PropertyNFTData[];
    itemsPerRow: number;
    onPropertyView?: (property: PropertyNFTData) => void;
    onCreateLoan?: (property: PropertyNFTData) => void;
  };
}) => {
  const { properties, itemsPerRow, onPropertyView, onCreateLoan } = data;
  const index = rowIndex * itemsPerRow + columnIndex;
  const property = properties[index];

  if (!property) {
    return <div style={style} />;
  }

  return (
    <div 
      style={{
        ...style,
        padding: '8px',
      }}
    >
      <OptimizedPropertyCard
        property={property}
        onView={onPropertyView}
        onCreateLoan={onCreateLoan}
        className="h-full"
      />
    </div>
  );
});

GridItem.displayName = 'GridItem';

// Main virtualized grid component
export const VirtualizedPropertyGrid = memo<VirtualizedPropertyGridProps>(({
  properties,
  onPropertyView,
  onCreateLoan,
  itemsPerRow = 3,
  itemHeight = 400,
  containerHeight = 600,
  className = '',
}) => {
  const [containerWidth, setContainerWidth] = useState(1200);

  // Calculate grid dimensions
  const gridData = useMemo(() => {
    const rowCount = Math.ceil(properties.length / itemsPerRow);
    const columnWidth = Math.floor(containerWidth / itemsPerRow);
    
    return {
      rowCount,
      columnWidth,
      itemData: {
        properties,
        itemsPerRow,
        onPropertyView,
        onCreateLoan,
      },
    };
  }, [properties, itemsPerRow, containerWidth, onPropertyView, onCreateLoan]);

  // Handle container resize
  const handleResize = useCallback((width: number) => {
    setContainerWidth(width);
  }, []);

  // Render empty state
  if (properties.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <p className="text-lg font-medium">No properties found</p>
          <p className="text-sm">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResizeObserver onResize={handleResize}>
        <Grid
          columnCount={itemsPerRow}
          columnWidth={gridData.columnWidth}
          height={containerHeight}
          rowCount={gridData.rowCount}
          rowHeight={itemHeight}
          width={containerWidth}
          itemData={gridData.itemData}
          overscanRowCount={2}
          overscanColumnCount={1}
        >
          {GridItem}
        </Grid>
      </ResizeObserver>
    </div>
  );
});

VirtualizedPropertyGrid.displayName = 'VirtualizedPropertyGrid';

// Resize observer component
interface ResizeObserverProps {
  onResize: (width: number) => void;
  children: React.ReactNode;
}

const ResizeObserver = memo<ResizeObserverProps>(({ onResize, children }) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!ref) return;

    const resizeObserver = new window.ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        onResize(entry.contentRect.width);
      }
    });

    resizeObserver.observe(ref);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, onResize]);

  return (
    <div ref={setRef} className="w-full">
      {children}
    </div>
  );
});

ResizeObserver.displayName = 'ResizeObserver';

// Hook for optimized property filtering and search
export const useOptimizedPropertyFiltering = (
  properties: PropertyNFTData[],
  searchTerm: string,
  filters: {
    priceRange?: [number, number];
    riskLevel?: string;
    propertyType?: string;
    location?: string;
  }
) => {
  return useMemo(() => {
    return properties.filter((property) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          property.name.toLowerCase().includes(searchLower) ||
          property.location.toLowerCase().includes(searchLower) ||
          property.description.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Price range filter
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        const valueInEth = Number(property.propertyValue) / 1e18;
        if (valueInEth < min || valueInEth > max) return false;
      }

      // Risk level filter
      if (filters.riskLevel) {
        const riskCategory = property.riskScore < 30 ? 'low' : 
                            property.riskScore < 70 ? 'medium' : 'high';
        if (riskCategory !== filters.riskLevel) return false;
      }

      // Property type filter
      if (filters.propertyType) {
        const propertyType = property.metadata?.attributes?.find(
          attr => attr.trait_type === 'Property Type'
        )?.value;
        if (propertyType !== filters.propertyType) return false;
      }

      // Location filter
      if (filters.location) {
        if (!property.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [properties, searchTerm, filters]);
};