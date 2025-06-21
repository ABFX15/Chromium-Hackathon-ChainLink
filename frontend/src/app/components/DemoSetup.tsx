import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Building2, TrendingUp, MapPin } from 'lucide-react'

const DEMO_PROPERTIES = [
  "123 Main St, New York, NY 10001",
  "456 Oak Ave, Los Angeles, CA 90210",
  "789 Pine St, Chicago, IL 60601"
]

export function DemoSetup() {
  const { address, isConnected } = useAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [propertyData, setPropertyData] = useState<any[]>([])

  const handleFetchRentCastData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/rentcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: '' }) // Empty address for demo data
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch RentCast data')
      }
      
      const result = await response.json()
      
      // Fetch multiple demo properties
      const addresses = [
        "123 Main St, New York, NY 10001",
        "456 Oak Ave, Los Angeles, CA 90210",
        "789 Pine St, Chicago, IL 60601"
      ]
      
      const propertiesData = []
      for (const address of addresses) {
        const propResponse = await fetch('/api/rentcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ address })
        })
        
        if (propResponse.ok) {
          const propResult = await propResponse.json()
          propertiesData.push(propResult.property)
        }
      }
      
      setPropertyData(propertiesData)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch RentCast data:', error)
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="glass-effect rounded-xl p-6 text-center gradient-border floating-animation">
        <div className="w-16 h-16 mx-auto mb-4 gradient-border glow-effect">
          <div className="w-full h-full bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <Building2 className="text-white text-2xl pulse-animation" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gradient mb-2">RentCast Integration</h3>
        <p className="text-muted-foreground mb-4">
          Connect your wallet to fetch real property data from RentCast API
        </p>
      </div>
    )
  }

  return (
    <div className="glass-effect rounded-xl p-6 gradient-border glow-effect floating-animation">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 gradient-border">
          <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <Building2 className="text-white pulse-animation" />
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gradient">RentCast Property Data</h3>
          <p className="text-xs text-muted-foreground">Real estate valuations API</p>
        </div>
      </div>
      
      <Button 
        onClick={handleFetchRentCastData}
        disabled={isLoading}
        className="w-full mb-4 gradient-border glow-effect"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Fetching property data...</span>
          </div>
        ) : (
          'Fetch RentCast Data'
        )}
      </Button>

      {propertyData.length > 0 && (
        <div className="space-y-3">
          {propertyData.map((property, index) => (
            <div 
              key={index} 
              className="stats-card p-4 floating-animation"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-white font-semibold text-sm">{property.address}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gradient">
                    ${property.valueEstimate?.toLocaleString() || 'N/A'}
                  </div>
                  <div className="text-xs text-green-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5.2%
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {property.propertyType} • {property.city}, {property.state}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}