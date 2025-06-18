import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin, DollarSign, Calendar, Home, X } from 'lucide-react'

interface SearchFilters {
  priceRange: [number, number]
  propertyType: string[]
  location: string[]
  yearBuilt: [number, number]
  ltvRange: [number, number]
  riskLevel: string[]
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  onSearchChange: (term: string) => void
}

export function AdvancedSearch({ onFiltersChange, onSearchChange }: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 2000000],
    propertyType: [],
    location: [],
    yearBuilt: [1980, 2024],
    ltvRange: [0, 80],
    riskLevel: []
  })

  const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Mixed-Use', 'Retail']
  const locations = ['Downtown', 'Suburbs', 'Waterfront', 'Historic District', 'Business Center']
  const riskLevels = ['Low Risk', 'Medium Risk', 'High Risk']

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearchChange(value)
  }

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      priceRange: [0, 2000000],
      propertyType: [],
      location: [],
      yearBuilt: [1980, 2024],
      ltvRange: [0, 80],
      riskLevel: []
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const toggleArrayFilter = (key: 'propertyType' | 'location' | 'riskLevel', value: string) => {
    const currentArray = filters[key]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    handleFilterChange(key, newArray)
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-cyan-500/20 p-6 mb-8">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Advanced Filters
        </button>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-gray-700 pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Price Range */}
            <div>
              <label className="text-white font-medium mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                Price Range
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                    className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                    className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="text-white font-medium mb-3 flex items-center gap-2">
                <Home className="w-4 h-4 text-cyan-400" />
                Property Type
              </label>
              <div className="space-y-2">
                {propertyTypes.map(type => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.propertyType.includes(type)}
                      onChange={() => toggleArrayFilter('propertyType', type)}
                      className="rounded border-gray-600 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-gray-300 text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-white font-medium mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Location
              </label>
              <div className="space-y-2">
                {locations.map(location => (
                  <label key={location} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.location.includes(location)}
                      onChange={() => toggleArrayFilter('location', location)}
                      className="rounded border-gray-600 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-gray-300 text-sm">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Year Built */}
            <div>
              <label className="text-white font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Year Built
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="From"
                  value={filters.yearBuilt[0]}
                  onChange={(e) => handleFilterChange('yearBuilt', [Number(e.target.value), filters.yearBuilt[1]])}
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="To"
                  value={filters.yearBuilt[1]}
                  onChange={(e) => handleFilterChange('yearBuilt', [filters.yearBuilt[0], Number(e.target.value)])}
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
            </div>

            {/* LTV Range */}
            <div>
              <label className="text-white font-medium mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                Max LTV %
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.ltvRange[0]}
                  onChange={(e) => handleFilterChange('ltvRange', [Number(e.target.value), filters.ltvRange[1]])}
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.ltvRange[1]}
                  onChange={(e) => handleFilterChange('ltvRange', [filters.ltvRange[0], Number(e.target.value)])}
                  className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm"
                />
              </div>
            </div>

            {/* Risk Level */}
            <div>
              <label className="text-white font-medium mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                Risk Level
              </label>
              <div className="space-y-2">
                {riskLevels.map(level => (
                  <label key={level} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.riskLevel.includes(level)}
                      onChange={() => toggleArrayFilter('riskLevel', level)}
                      className="rounded border-gray-600 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-gray-300 text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}