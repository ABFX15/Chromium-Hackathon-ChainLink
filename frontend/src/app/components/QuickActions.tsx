'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Plus, RefreshCw, BarChart3 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function QuickActions() {
  const { toast } = useToast()

  const handleMintNFT = () => {
    toast({
      title: "Coming Soon",
      description: "NFT minting functionality will be available soon",
      variant: "default",
    })
  }

  const handleUpdateValues = () => {
    toast({
      title: "Values Updated",
      description: "Property values refreshed from oracle",
      variant: "success",
    })
  }

  const handleViewAnalytics = () => {
    toast({
      title: "Coming Soon",
      description: "Advanced analytics dashboard coming soon",
      variant: "default",
    })
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start glass-effect border-primary-500/50 hover:border-primary-500"
            onClick={handleMintNFT}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <Plus className="text-primary-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Mint Property NFT</p>
                <p className="text-dark-400 text-sm">Add new property to portfolio</p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start glass-effect border-secondary-500/50 hover:border-secondary-500"
            onClick={handleUpdateValues}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary-500/20 rounded-lg flex items-center justify-center">
                <RefreshCw className="text-secondary-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Update Property Values</p>
                <p className="text-dark-400 text-sm">Refresh oracle pricing</p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start glass-effect border-green-500/50 hover:border-green-500"
            onClick={handleViewAnalytics}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">View Analytics</p>
                <p className="text-dark-400 text-sm">Detailed performance metrics</p>
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
