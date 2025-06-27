'use client'

import { useState } from 'react'
import { Search, Hash, DollarSign } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { usePropertyNFTs } from '@/hooks/use-property-nfts'
import { useLoans } from '@/hooks/use-loans'
import { PropertyNFTCard } from './PropertyNFTCard'
import { LoanCard } from './LoanCard'

export function TokenSearch() {
  const [searchType, setSearchType] = useState<'token' | 'loan'>('token')
  const [searchValue, setSearchValue] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  const { nfts } = usePropertyNFTs()
  const { loans } = useLoans()

  const handleSearch = async () => {
    if (!searchValue) return
    
    setIsSearching(true)
    const id = parseInt(searchValue)
    
    if (searchType === 'token') {
      const foundNFT = nfts?.find((nft) => nft.tokenId === id)
      setSearchResult(foundNFT || null)
    } else {
      const foundLoan = loans?.find((loan) => loan.loanId === id)
      setSearchResult(foundLoan || null)
    }
    
    setIsSearching(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="bg-gradient-to-br from-black/90 to-cyan-950/20 border border-cyan-500/30 p-5 font-mono text-sm rounded-lg backdrop-blur-sm">
      <div className="space-y-5">
        {/* Search Header */}
        <div className="border-b border-cyan-500/20 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            <span className="text-cyan-300 font-semibold">Search Protocol</span>
          </div>
        </div>

        {/* Search Type Toggle */}
        <div className="flex space-x-4">
          <button
            onClick={() => setSearchType('token')}
            className={`px-4 py-2 border font-mono text-xs rounded-lg transition-all duration-200 ${
              searchType === 'token'
                ? 'border-cyan-400 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 text-cyan-300 shadow-lg shadow-cyan-400/20'
                : 'border-cyan-500/50 text-cyan-500/70 hover:text-cyan-400 hover:bg-cyan-500/10'
            }`}
          >
            [TOKEN_ID]
          </button>
          <button
            onClick={() => setSearchType('loan')}
            className={`px-4 py-2 border font-mono text-xs rounded-lg transition-all duration-200 ${
              searchType === 'loan'
                ? 'border-cyan-400 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 text-cyan-300 shadow-lg shadow-cyan-400/20'
                : 'border-cyan-500/50 text-cyan-500/70 hover:text-cyan-400 hover:bg-cyan-500/10'
            }`}
          >
            [LOAN_ID]
          </button>
        </div>

        {/* Search Input */}
        <div className="flex space-x-3 items-center">
          <span className="text-cyan-400 shrink-0 font-semibold">query:</span>
          <Input
            type="number"
            placeholder={`${searchType}_id`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-gradient-to-r from-black/80 to-cyan-950/20 border-cyan-500/30 text-cyan-300 placeholder-cyan-500/50 
                       font-mono text-sm focus:border-cyan-400 focus:ring-cyan-400/20 px-3 py-2 rounded-lg
                       focus:shadow-lg focus:shadow-cyan-400/10 transition-all duration-200"
          />
          <Button
            onClick={handleSearch}
            disabled={!searchValue || isSearching}
            className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/50 
                       hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 font-mono text-xs px-4 py-2 rounded-lg
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                       hover:shadow-lg hover:shadow-cyan-400/20"
          >
            {isSearching ? 'searching...' : 'execute'}
          </Button>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-4 mt-6">
            <div className="text-cyan-400 text-xs flex items-center space-x-2">
              <span className="w-1 h-1 bg-cyan-400 rounded-full"></span>
              <span>► result found: {searchType}_id={searchValue}</span>
            </div>
            <div className="border border-cyan-500/30 p-4 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-lg backdrop-blur-sm">
              {searchType === 'token' ? (
                <PropertyNFTCard nft={searchResult} />
              ) : (
                <LoanCard loan={searchResult} />
              )}
            </div>
          </div>
        )}

        {searchValue && !searchResult && !isSearching && (
          <div className="text-center py-6 bg-gradient-to-r from-red-900/10 to-red-800/10 border border-red-500/30 rounded-lg">
            <div className="text-red-400 font-mono text-xs flex items-center justify-center space-x-2">
              <span>✗</span>
              <span>error: {searchType}_id={searchValue} not found</span>
            </div>
            <div className="text-cyan-500/70 text-xs mt-2">
              {searchType === 'token' ? 'hint: try minting first' : 'hint: try creating loan first'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}