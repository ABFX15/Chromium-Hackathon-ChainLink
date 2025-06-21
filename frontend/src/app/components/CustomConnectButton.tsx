'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, ChevronDown } from 'lucide-react'

export const CustomConnectButton = () => {
  const handleModalOpen = (openModal: () => void) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openModal()
  }

  return (
    <div className="relative z-50">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading'
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus ||
              authenticationStatus === 'authenticated')

          return (
            <div
              className="relative"
              {...(!ready && {
                'aria-hidden': true,
                'style': {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        openConnectModal?.()
                      }}
                      type="button"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 border border-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      <Wallet className="w-5 h-5" />
                      Connect Wallet
                    </button>
                  )
                }

                if (chain.unsupported) {
                  return (
                    <button
                      onClick={handleModalOpen(openChainModal)}
                      type="button"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 border border-red-400/20 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      Wrong network
                    </button>
                  )
                }

                return (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleModalOpen(openChainModal)}
                      className="inline-flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                      type="button"
                    >
                      {chain.hasIcon && (
                        <div
                          style={{
                            background: chain.iconBackground,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            overflow: 'hidden',
                            marginRight: 4,
                          }}
                        >
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              style={{ width: 20, height: 20 }}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleModalOpen(openAccountModal)}
                      type="button"
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 border border-cyan-400/30 hover:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                        {account.displayName?.[0] || account.address?.slice(2, 4)}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {account.displayName}
                        </span>
                        {account.displayBalance && (
                          <span className="text-xs text-gray-400">
                            {account.displayBalance}
                          </span>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                )
              })()}
            </div>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}