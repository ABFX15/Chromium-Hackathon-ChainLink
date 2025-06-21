import { useState, useMemo } from 'react'
import { PropertyNFTCard } from './PropertyNFTCard'
import { NFTDetailModal } from './NFTDetailModal'
import { QuickStats } from './QuickStats'
import { usePropertyNFTs } from '@/hooks/use-property-nfts'
import { Search, Filter, MapPin, TrendingUp, Building2, Star } from 'lucide-react'
import { PropertyNFT } from '@/types/contracts'
import { LoadingSpinner } from './LoadingSpinner'

type SortOption = 'price_low' | 'price_high' | 'newest' | 'rarity'
type FilterOption = 'all' | 'available' | 'collateralized' | 'legendary' | 'epic' | 'rare' | 'common'

export function NFTMarketplace() {
  const { nfts, loading: isLoading } = usePropertyNFTs()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [selectedNFT, setSelectedNFT] = useState<PropertyNFT | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getRarity = (nft: PropertyNFT) => {
    if (nft.propertyValue > 800000) return 'LEGENDARY'
    if (nft.propertyValue > 650000) return 'EPIC'
    if (nft.propertyValue > 500000) return 'RARE'
    return 'COMMON'
  }

  const handleNFTClick = (nft: PropertyNFT) => {
    setSelectedNFT(nft)
    setIsModalOpen(true)
  }

  const filteredAndSortedNFTs = useMemo(() => {
    let filtered = nfts.filter(nft => {
      // Search filter
      const matchesSearch = nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           nft.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Category filter
      let matchesFilter = true
      switch (filterBy) {
        case 'available':
          matchesFilter = !nft.isCollateral
          break
        case 'collateralized':
          matchesFilter = nft.isCollateral
          break
        case 'legendary':
          matchesFilter = getRarity(nft) === 'LEGENDARY'
          break
        case 'epic':
          matchesFilter = getRarity(nft) === 'EPIC'
          break
        case 'rare':
          matchesFilter = getRarity(nft) === 'RARE'
          break
        case 'common':
          matchesFilter = getRarity(nft) === 'COMMON'
          break
        default:
          matchesFilter = true
      }

      return matchesSearch && matchesFilter
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.propertyValue - b.propertyValue
        case 'price_high':
          return b.propertyValue - a.propertyValue
        case 'rarity':
          const rarityOrder = { 'LEGENDARY': 4, 'EPIC': 3, 'RARE': 2, 'COMMON': 1 }
          return rarityOrder[getRarity(b) as keyof typeof rarityOrder] - rarityOrder[getRarity(a) as keyof typeof rarityOrder]
        case 'newest':
        default:
          return b.tokenId - a.tokenId
      }
    })

    return filtered
  }, [nfts, searchTerm, sortBy, filterBy])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 relative">
        <div className="particle-bg"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center py-20">
            <LoadingSpinner size="lg" text="Loading NFT Marketplace..." />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 relative">
      {/* Particle Background */}
      <div className="particle-bg"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Quick Stats */}
        <QuickStats />
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Building2 className="w-10 h-10 text-cyan-400" />
            RWA NFT Marketplace
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover premium real estate NFTs available for purchase or collateral loans. 
            Browse properties, analyze AI risk scores, and secure financing with our advanced lending platform.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-effect-dark rounded-2xl p-6 mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-2xl"></div>
          <div className="relative z-10">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search properties by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <TrendingUp className="text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-gray-700/50 border border-gray-600 rounded-xl text-white px-4 py-3 focus:border-cyan-500 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rarity">Rarity: Legendary First</option>
              </select>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="bg-gray-700/50 border border-gray-600 rounded-xl text-white px-4 py-3 focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Properties</option>
                <option value="available">Available for Loan</option>
                <option value="collateralized">Currently Collateralized</option>
                <option value="legendary">Legendary Properties</option>
                <option value="epic">Epic Properties</option>
                <option value="rare">Rare Properties</option>
                <option value="common">Common Properties</option>
              </select>
            </div>
          </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 text-center">
            <div className="text-cyan-400 text-2xl font-bold">{filteredAndSortedNFTs.length}</div>
            <div className="text-gray-400 text-sm">Properties Found</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 text-center">
            <div className="text-green-400 text-2xl font-bold">
              {filteredAndSortedNFTs.filter(nft => !nft.isCollateral).length}
            </div>
            <div className="text-gray-400 text-sm">Available</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 text-center">
            <div className="text-yellow-400 text-2xl font-bold">
              {filteredAndSortedNFTs.filter(nft => getRarity(nft) === 'LEGENDARY').length}
            </div>
            <div className="text-gray-400 text-sm">Legendary</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 text-center">
            <div className="text-purple-400 text-2xl font-bold">
              {Math.round(filteredAndSortedNFTs.reduce((acc, nft) => acc + nft.propertyValue, 0) / 1000000)}M
            </div>
            <div className="text-gray-400 text-sm">Total Value</div>
          </div>
        </div>

        {/* Results */}
        {filteredAndSortedNFTs.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">No Properties Found</h3>
            <p className="text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedNFTs.map((nft) => (
              <div key={nft.tokenId} onClick={() => handleNFTClick(nft)} className="cursor-pointer">
                <PropertyNFTCard nft={nft} />
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 py-12 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 rounded-2xl border border-cyan-500/20">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-white text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Browse available properties, click "BUY RWA" to purchase directly, or "AI LOAN" to get instant financing with our AI-powered risk assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/20">
              <div className="text-green-400 font-bold mb-1">Purchase Property</div>
              <div className="text-gray-400 text-sm">Buy RWA NFTs directly with USDC</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-blue-500/20">
              <div className="text-blue-400 font-bold mb-1">Get AI Loan</div>
              <div className="text-gray-400 text-sm">Instant financing with risk assessment</div>
            </div>
          </div>
        </div>

        {/* NFT Detail Modal */}
        <NFTDetailModal 
          nft={selectedNFT}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedNFT(null)
          }}
        />
      </div>
    </div>
  )
}