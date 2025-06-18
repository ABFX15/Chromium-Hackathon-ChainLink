import { usePropertyNFTs } from '@/hooks/use-property-nfts'
import { useLoans } from '@/hooks/use-loans'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Building2, CreditCard, DollarSign } from 'lucide-react'

export function QuickStats() {
  const { nfts } = usePropertyNFTs()
  const { loans } = useLoans()

  const totalPortfolioValue = nfts.reduce((sum, nft) => sum + nft.propertyValue, 0)
  const activeLoansCount = loans.filter(loan => loan.isActive).length
  const totalBorrowed = loans
    .filter(loan => loan.isActive)
    .reduce((sum, loan) => sum + loan.debt, 0)
  const avgAPR = loans.length > 0 ? 
    loans.reduce((sum, loan) => sum + loan.interest, 0) / loans.length : 0

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(totalPortfolioValue),
      icon: Building2,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/20'
    },
    {
      title: 'Active Loans',
      value: activeLoansCount.toString(),
      icon: CreditCard,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      borderColor: 'border-blue-400/20'
    },
    {
      title: 'Total Borrowed',
      value: formatCurrency(totalBorrowed),
      icon: DollarSign,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      borderColor: 'border-purple-400/20'
    },
    {
      title: 'Average APR',
      value: `${avgAPR.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div 
            key={index}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-4 transition-all duration-300 hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="space-y-1">
              <p className="text-white text-xl font-bold">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}