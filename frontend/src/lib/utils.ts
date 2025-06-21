
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

export function getHealthFactorColor(healthFactor: number) {
  if (healthFactor < 1.5) return 'text-red-300';
  if (healthFactor < 2.0) return 'text-yellow-300';
  return 'text-cyan-300';
}

export function getHealthFactorWidth(healthFactor: number) {
  return Math.min((healthFactor / 3) * 100, 100);
}
