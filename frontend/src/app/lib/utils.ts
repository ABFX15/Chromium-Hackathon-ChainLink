import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | bigint): string {
    const num = typeof amount === 'bigint' ? Number(amount) / 1e6 : amount // Assuming 6 decimals for USDC
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num)
}

export function formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTokenId(tokenId: number | bigint): string {
    return `#${tokenId.toString()}`
}

export function formatTimestamp(timestamp: number | bigint): string {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export function calculateLTV(collateralValue: number, loanAmount: number): number {
    if (collateralValue === 0) return 0
    return (loanAmount / collateralValue) * 100
}

export function calculateMaxLoan(collateralValue: number, ltvRatio: number = 70): number {
    return (collateralValue * ltvRatio) / 100
}

export function calculateHealthFactor(collateralValue: number, debt: number): number {
    if (debt === 0) return 100
    return (collateralValue / debt) * 100
}

export function getHealthFactorColor(healthFactor: number): string {
    if (healthFactor >= 150) return 'text-green-400'
    if (healthFactor >= 120) return 'text-yellow-400'
    if (healthFactor >= 100) return 'text-orange-400'
    return 'text-red-400'
}

export function getHealthFactorWidth(healthFactor: number): string {
    if (healthFactor >= 150) return 'w-full'
    if (healthFactor >= 120) return 'w-3/4'
    if (healthFactor >= 100) return 'w-1/2'
    return 'w-1/4'
} 
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
