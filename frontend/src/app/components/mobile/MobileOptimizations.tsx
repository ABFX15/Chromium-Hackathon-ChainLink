"use client";

import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Menu, X } from 'lucide-react';

// Mobile Navigation
export const MobileNavigation = ({ children }: { children: React.ReactNode }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="w-80">
      {children}
    </SheetContent>
  </Sheet>
);

// Mobile-optimized Property Card
export const MobilePropertyCard = ({ property, onView, onCreateLoan }: any) => (
  <div className="p-4 border rounded-lg space-y-3">
    <div className="flex gap-3">
      <img
        src={property.image}
        alt={property.name}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{property.name}</h3>
        <p className="text-xs text-gray-500 truncate">{property.location}</p>
        <p className="text-lg font-bold">${property.propertyValue.toLocaleString()}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => onView(property)} className="flex-1">
        View
      </Button>
      <Button size="sm" onClick={() => onCreateLoan(property)} className="flex-1">
        Loan
      </Button>
    </div>
  </div>
);

// Touch-optimized controls
export const TouchSlider = ({ value, onChange, min, max, step }: any) => (
  <input
    type="range"
    value={value}
    onChange={(e) => onChange(parseFloat(e.target.value))}
    min={min}
    max={max}
    step={step}
    className="w-full h-8 appearance-none bg-gray-200 rounded-lg outline-none touch-pan-x"
    style={{
      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
    }}
  />
);