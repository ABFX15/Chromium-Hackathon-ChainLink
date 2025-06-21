'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Home, Wallet, Activity, Shield, BarChart3, Building2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationCenter } from './NotificationCenter'
import { Logo } from './Logo'

type NavigationTab = 'marketplace' | 'portfolio' | 'loans' | 'liquidation' | 'cross-chain'

interface NavbarProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const navigationItems = [
    { id: 'marketplace', label: 'Marketplace', icon: Building2, description: 'Browse Properties' },
    { id: 'portfolio', label: 'Portfolio', icon: Wallet, description: 'Your Assets' },
    { id: 'loans', label: 'Loans', icon: Activity, description: 'Active Loans' },
    { id: 'liquidation', label: 'Analytics', icon: TrendingUp, description: 'Market Insights' },
    { id: 'cross-chain', label: 'Cross-Chain', icon: Shield, description: 'Cross Chain Lending' },
  ]

  return (
    <nav className="premium-nav fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Logo className="w-12 h-12" showText={true} />
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                ORACLEND
              </h1>
              <p className="text-sm text-cyan-400/70 font-mono tracking-wider">AI LENDING PROTOCOL</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as NavigationTab)}
                  className={`premium-nav-link group ${isActive ? 'active' : ''}`}
                  title={item.description}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-cyan-400' : 'text-white/60 group-hover:text-cyan-400'}`} />
                    <span className={`font-semibold tracking-wide transition-all duration-300 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                      {item.label}
                    </span>
                  </div>

                  {/* Active indicator */}
                  <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />

                  {/* Hover glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-xl transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            {/* Network Status */}
            <div className="hidden sm:flex items-center space-x-3 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-400/20 px-4 py-2 rounded-full">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                <span className="text-sm font-semibold text-emerald-400">Sepolia</span>
              </div>
            </div>

            {/* Notifications */}
            <NotificationCenter />

            {/* Connect Wallet */}
            <div className="premium-wallet-wrapper">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-cyan-400/20 bg-black/40 backdrop-blur-xl">
        <div className="flex justify-around py-4">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavigationTab)}
                className={`flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-cyan-400/10 text-cyan-400 shadow-lg shadow-cyan-400/20'
                    : 'text-white/60 hover:text-cyan-400 hover:bg-cyan-400/5'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold tracking-wide">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .premium-nav {
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(6, 182, 212, 0.05) 100%);
          backdrop-filter: blur(40px);
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 4px 16px rgba(6, 182, 212, 0.1);
        }

        .premium-nav-link {
          position: relative;
          padding: 12px 20px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: hidden;
        }

        .premium-nav-link:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.15);
        }

        .premium-wallet-wrapper :global([data-rk]) {
          background: linear-gradient(135deg, rgb(6, 182, 212), rgb(59, 130, 246)) !important;
          border: none !important;
          border-radius: 16px !important;
          padding: 14px 28px !important;
          font-weight: 700 !important;
          font-size: 15px !important;
          font-family: 'Inter', sans-serif !important;
          letter-spacing: 0.5px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          box-shadow: 
            0 6px 20px rgba(6, 182, 212, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }

        .premium-wallet-wrapper :global([data-rk]:hover) {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 
            0 12px 40px rgba(6, 182, 212, 0.5),
            0 4px 16px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </nav>
  )
}