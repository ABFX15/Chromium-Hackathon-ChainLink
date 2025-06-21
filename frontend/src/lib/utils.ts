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

export function getHealthFactorColor(healthFactor: number): string {
  if (healthFactor >= 1.5) return "text-green-600";
  if (healthFactor >= 1.2) return "text-yellow-600";
  return "text-red-600";
}

export function getHealthFactorWidth(healthFactor: number): string {
  const percentage = Math.min(100, (healthFactor / 2) * 100);
  return `${percentage}%`;
}