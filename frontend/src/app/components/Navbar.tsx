
'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Home, Wallet, Activity, Shield, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from './NotificationCenter'
import { Logo } from './Logo'

type NavigationTab = 'marketplace' | 'portfolio' | 'loans' | 'liquidation'

interface NavbarProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const navigationItems = [
    { id: 'marketplace', label: 'Marketplace', icon: Home },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'loans', label: 'Loans', icon: Activity },
    { id: 'liquidation', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Logo className="w-10 h-10" showText={true} />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gradient">NEXUS VAULT</h1>
              <p className="text-xs text-white/50">Real World Assets</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as NavigationTab)}
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Network Status */}
            <div className="hidden sm:flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-white/80">Sepolia</span>
              </div>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* Connect Wallet */}
            <div className="connect-wallet-wrapper">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-white/10">
        <div className="flex justify-around py-3">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavigationTab)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .connect-wallet-wrapper :global([data-rk]) {
          background: linear-gradient(135deg, rgb(99, 102, 241), rgb(168, 85, 247)) !important;
          border: none !important;
          border-radius: 12px !important;
          padding: 12px 24px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3) !important;
        }

        .connect-wallet-wrapper :global([data-rk]:hover) {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4) !important;
        }
      `}</style>
    </nav>
  )
}
