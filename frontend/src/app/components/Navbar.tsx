'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Home, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from './NotificationCenter'
import { Logo } from './Logo'

type NavigationTab = 'marketplace' | 'portfolio' | 'loans' | 'liquidation'

interface NavbarProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="border-b border-cyan-500/30 bg-gradient-to-r from-black/95 to-cyan-950/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* NEXUS VAULT Logo */}
          <Logo className="w-8 h-8" showText={true} />

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8 font-mono text-sm">
            <button
              onClick={() => onTabChange('marketplace')}
              className={`cursor-pointer transition-colors duration-200 hover:bg-cyan-500/10 px-2 py-1 rounded ${
                activeTab === 'marketplace' 
                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/50' 
                  : 'text-cyan-500/70 hover:text-cyan-400'
              }`}
            >
              [buy properties]
            </button>
            <button
              onClick={() => onTabChange('portfolio')}
              className={`cursor-pointer transition-colors duration-200 hover:bg-cyan-500/10 px-2 py-1 rounded ${
                activeTab === 'portfolio' 
                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/50' 
                  : 'text-cyan-500/70 hover:text-cyan-400'
              }`}
            >
              [my properties]
            </button>
            <button
              onClick={() => onTabChange('loans')}
              className={`cursor-pointer transition-colors duration-200 hover:bg-cyan-500/10 px-2 py-1 rounded ${
                activeTab === 'loans' 
                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/50' 
                  : 'text-cyan-500/70 hover:text-cyan-400'
              }`}
            >
              [my loans]
            </button>
            <button
              onClick={() => onTabChange('liquidation')}
              className={`cursor-pointer transition-colors duration-200 hover:bg-cyan-500/10 px-2 py-1 rounded ${
                activeTab === 'liquidation' 
                  ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/50' 
                  : 'text-cyan-500/70 hover:text-cyan-400'
              }`}
            >
              [liquidation]
            </button>
          </div>

          {/* Connect Wallet */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono bg-cyan-900/20 border border-cyan-500/30 px-3 py-1 rounded-lg">
              <span className="text-cyan-400 animate-pulse">●</span>
              <span className="text-cyan-300">ETH</span>
            </div>
            <NotificationCenter />
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
