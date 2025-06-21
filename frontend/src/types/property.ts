
export interface Property {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  value: number;
  location: string;
  propertyType: string;
  sqft: number;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt?: number;
}
