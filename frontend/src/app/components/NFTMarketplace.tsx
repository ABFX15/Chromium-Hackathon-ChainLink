
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { PropertyNFT } from '@/types/contracts'
import { PropertyNFTCard } from './PropertyNFTCard'
import { RWAPurchaseModal } from './RWAPurchaseModal'
import { usePropertyNFTs } from '../hooks/use-property-nfts'
import { LoadingSpinner } from './LoadingSpinner'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  TrendingUp,
  MapPin,
  DollarSign,
  Activity
} from 'lucide-react'

interface QuickStatsProps {
  totalValue: string
  totalProperties: number
  avgReturn: string
  activeLoans: number
}

function QuickStats({ totalValue, totalProperties, avgReturn, activeLoans }: QuickStatsProps) {
  const stats = [
    {
      label: 'Total Market Value',
      value: totalValue,
      icon: DollarSign,
      change: '+12.5%',
      positive: true
    },
    {
      label: 'Available Properties',
      value: typeof totalProperties === 'number' ? totalProperties.toString() : '0',
      icon: Building2,
      change: '+3',
      positive: true
    },
    {
      label: 'Average Returns',
      value: avgReturn,
      icon: TrendingUp,
      change: '+0.8%',
      positive: true
    },
    {
      label: 'Active Loans',
      value: activeLoans.toString(),
      icon: Activity,
      change: '+5',
      positive: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div 
            key={stat.label} 
            className="glass-card p-6 animate-slide-up group hover:shadow-glow transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6 text-blue-400" />
              </div>
              <Badge className={`${stat.positive ? 'text-green-400 bg-green-400/10 border-green-400/30' : 'text-red-400 bg-red-400/10 border-red-400/30'} border`}>
                {stat.change}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-white/60 text-sm font-medium">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function NFTMarketplace() {
  const { address } = useAccount()
  const { properties, loading, error } = usePropertyNFTs()
  const [selectedNFT, setSelectedNFT] = useState<PropertyNFT | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('price')
  const [filterBy, setFilterBy] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'low-risk' && property.riskScore <= 30) ||
                         (filterBy === 'medium-risk' && property.riskScore > 30 && property.riskScore <= 70) ||
                         (filterBy === 'high-risk' && property.riskScore > 70)
    
    return matchesSearch && matchesFilter
  })

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.price - a.price
      case 'risk':
        return a.riskScore - b.riskScore
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  const totalValue = properties.reduce((sum, p) => sum + p.price, 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  const handleBuyNFT = (nft: PropertyNFT) => {
    setSelectedNFT(nft)
    setShowPurchaseModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md mx-auto">
          <Building2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-white/60">Unable to load marketplace data. Please check your connection and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full">
            <Building2 className="w-6 h-6 text-blue-400" />
            <span className="text-white font-medium">Premium Real Estate NFTs</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
            Discover Premium
            <span className="block text-gradient">Real Estate NFTs</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Browse institutional-grade properties, analyze AI-powered risk assessments, 
            and secure financing through our advanced DeFi lending platform.
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats 
          totalValue={totalValue}
          totalProperties={properties.length}
          avgReturn="8.4%"
          activeLoans={12}
        />

        {/* Search and Filters */}
        <div className="glass-card p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search properties or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              >
                <option value="price">Sort by Price</option>
                <option value="risk">Sort by Risk</option>
                <option value="name">Sort by Name</option>
              </select>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              >
                <option value="all">All Properties</option>
                <option value="low-risk">Low Risk</option>
                <option value="medium-risk">Medium Risk</option>
                <option value="high-risk">High Risk</option>
              </select>

              {/* View Toggle */}
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {sortedProperties.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {sortedProperties.map((property, index) => (
              <div 
                key={property.tokenId} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PropertyNFTCard
                  nft={property}
                  showBuyButton={true}
                  onBuy={handleBuyNFT}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="glass-card p-12 max-w-md mx-auto">
              <Building2 className="w-16 h-16 text-white/40 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-3">No Properties Found</h3>
              <p className="text-white/60">
                {searchTerm ? 'Try adjusting your search terms or filters.' : 'No properties available at the moment.'}
              </p>
            </div>
          </div>
        )}

        {/* Purchase Modal */}
        {selectedNFT && (
          <RWAPurchaseModal
            nft={selectedNFT}
            isOpen={showPurchaseModal}
            onClose={() => {
              setShowPurchaseModal(false)
              setSelectedNFT(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
