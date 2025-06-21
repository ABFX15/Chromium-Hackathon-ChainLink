import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getHealthFactorColor(factor: number): string {
  if (factor >= 1.5) return 'text-green-400'
  if (factor >= 1.2) return 'text-yellow-400' 
  if (factor >= 1.0) return 'text-orange-400'
  return 'text-red-400'
}

export function getHealthFactorWidth(factor: number): string {
  const percentage = Math.min(factor * 50, 100); // Scale factor to percentage
  return `${percentage}%`;
}

export function calculateHealthFactor(propertyValue: number, totalDebt: number): number {
  if (totalDebt === 0) return Infinity;
  return propertyValue / totalDebt;
}