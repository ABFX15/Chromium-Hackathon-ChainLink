import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | bigint): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount))
}

export function getHealthFactorColor(healthFactor: number): string {
  if (healthFactor >= 1.5) return 'text-green-400'
  if (healthFactor >= 1.2) return 'text-yellow-400'
  return 'text-red-400'
}

export function getHealthFactorWidth(healthFactor: number): number {
  // Convert health factor to percentage (1.5 = 100%, 1.0 = 66%, 0.5 = 33%)
  return Math.min(100, (healthFactor / 1.5) * 100)
}
