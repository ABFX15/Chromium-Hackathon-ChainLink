import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface QuickActionsProps {
  onCreateLoan: () => void;
  onAddLiquidity: () => void;
  onWithdrawYield: () => void;
  isLoading?: {
    createLoan?: boolean;
    addLiquidity?: boolean;
    withdrawYield?: boolean;
  };
}

export function QuickActions({
  onCreateLoan,
  onAddLiquidity,
  onWithdrawYield,
  isLoading = {},
}: QuickActionsProps) {
  return (
    <Card className="bg-gray-800/50 border-emerald-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-emerald-400 flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
          onClick={onCreateLoan}
          disabled={isLoading.createLoan}
        >
          {isLoading.createLoan ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create New Loan"
          )}
        </Button>

        <Button
          className="w-full bg-purple-600 hover:bg-purple-500 text-white"
          onClick={onAddLiquidity}
          disabled={isLoading.addLiquidity}
        >
          {isLoading.addLiquidity ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Adding...
            </>
          ) : (
            "Add Liquidity"
          )}
        </Button>

        <Button
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white"
          onClick={onWithdrawYield}
          disabled={isLoading.withdrawYield}
        >
          {isLoading.withdrawYield ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
              Withdrawing...
            </>
          ) : (
            "Withdraw Yield"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
