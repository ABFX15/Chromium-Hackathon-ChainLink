import { useContracts } from "@/app/hooks/useContracts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Building2, CreditCard, DollarSign } from "lucide-react";
import { useMemo } from "react";

export function QuickStats() {
  const { userNFTs, userLoans } = useContracts();

  const stats = useMemo(() => {
    const totalPortfolioValue = userNFTs.reduce(
      (sum, nft) => sum + nft.propertyValue,
      0
    );
    const activeLoansCount = userLoans.filter((loan) => loan.isActive).length;
    const totalBorrowed = userLoans
      .filter((loan) => loan.isActive)
      .reduce((sum, loan) => sum + Number(loan.principalAmount) / 1e6, 0);

    const totalInterest = userLoans
      .filter((loan) => loan.isActive)
      .reduce((sum, loan) => sum + Number(loan.interestRate) / 100, 0); // Assuming interest rate is in basis points
    const avgAPR = activeLoansCount > 0 ? totalInterest / activeLoansCount : 0;

    return [
      {
        title: "Total Portfolio Value",
        value: formatCurrency(totalPortfolioValue),
        icon: Building2,
        color: "text-green-400",
        bgColor: "bg-green-400/10",
        borderColor: "border-green-400/20",
      },
      {
        title: "Active Loans",
        value: activeLoansCount.toString(),
        icon: CreditCard,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/20",
      },
      {
        title: "Total Borrowed",
        value: formatCurrency(totalBorrowed),
        icon: DollarSign,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        borderColor: "border-purple-400/20",
      },
      {
        title: "Average APR",
        value: `${avgAPR.toFixed(1)}%`,
        icon: TrendingUp,
        color: "text-cyan-400",
        bgColor: "bg-cyan-400/10",
        borderColor: "border-cyan-400/20",
      },
    ];
  }, [userNFTs, userLoans]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
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
        );
      })}
    </div>
  );
}
