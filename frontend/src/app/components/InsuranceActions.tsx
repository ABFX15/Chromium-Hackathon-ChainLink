import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useContracts } from "../contexts/ContractsContext";
import { Shield, Loader2, CheckCircle } from "lucide-react";

interface InsuranceActionsProps {
  loanId: bigint;
  principal: bigint;
  refresh?: () => void;
}

export function InsuranceActions({
  loanId,
  principal,
  refresh,
}: InsuranceActionsProps) {
  const { buyInsurance, getPolicy } = useContracts();
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  // Fetch policy status on mount/loanId change
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getPolicy(loanId)
      .then((p) => mounted && setPolicy(p))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [loanId, getPolicy]);

  const handleBuyInsurance = async () => {
    setBuying(true);
    await buyInsurance(loanId, principal);
    setBuying(false);
    // Refresh policy status
    setLoading(true);
    const p = await getPolicy(loanId);
    setPolicy(p);
    setLoading(false);
    if (refresh) refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin" /> Checking insurance
        status...
      </div>
    );
  }

  if (policy && policy.active) {
    return (
      <div className="flex items-center gap-2 text-green-500">
        <CheckCircle className="w-4 h-4" />
        Insured (Premium: {policy.premiumPaid?.toString() || "-"} USDC)
        {policy.claimed && (
          <span className="ml-2 text-yellow-400">(Claimed)</span>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handleBuyInsurance}
      disabled={buying}
      className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
    >
      <Shield className="w-4 h-4" />
      {buying ? "Processing..." : "Buy Insurance"}
    </Button>
  );
}
