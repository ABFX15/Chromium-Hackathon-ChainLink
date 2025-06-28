import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useContracts } from "../contexts/ContractsContext";
import { Shield, Loader2, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [coverage, setCoverage] = useState<number>(Number(principal));
  const [duration, setDuration] = useState<number>(12); // months
  const premiumRateBps = 100; // 1% premium (hardcoded, or fetch from contract if needed)
  const maxDuration = 12;
  const minDuration = 1;
  const minCoverage = Math.max(1, Math.floor(Number(principal) * 0.1));
  const maxCoverage = Number(principal);
  const premium = Math.floor((coverage * premiumRateBps) / 10000);

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
    await buyInsurance(loanId, BigInt(coverage));
    setBuying(false);
    setModalOpen(false);
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
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={buying}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700"
        >
          <Shield className="w-4 h-4" />
          {buying ? "Processing..." : "Buy Insurance"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Loan Insurance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="coverage">Coverage Amount (USDC)</Label>
            <Input
              id="coverage"
              type="number"
              min={minCoverage}
              max={maxCoverage}
              value={coverage}
              onChange={(e) =>
                setCoverage(
                  Math.max(
                    minCoverage,
                    Math.min(maxCoverage, Number(e.target.value))
                  )
                )
              }
              className="mt-1"
            />
            <Slider
              min={minCoverage}
              max={maxCoverage}
              step={1}
              value={[coverage]}
              onValueChange={([val]: number[]) => setCoverage(val)}
              className="mt-2"
            />
            <div className="text-xs text-gray-400 mt-1">
              Max: {maxCoverage} USDC
            </div>
          </div>
          <div>
            <Label htmlFor="duration">Duration (months)</Label>
            <Input
              id="duration"
              type="number"
              min={minDuration}
              max={maxDuration}
              value={duration}
              onChange={(e) =>
                setDuration(
                  Math.max(
                    minDuration,
                    Math.min(maxDuration, Number(e.target.value))
                  )
                )
              }
              className="mt-1"
            />
            <Slider
              min={minDuration}
              max={maxDuration}
              step={1}
              value={[duration]}
              onValueChange={([val]: number[]) => setDuration(val)}
              className="mt-2"
            />
            <div className="text-xs text-gray-400 mt-1">
              1-12 months (MVP: duration is not enforced on-chain)
            </div>
          </div>
          <div className="p-3 bg-cyan-900/20 rounded-lg text-cyan-300">
            <div>
              Premium: <span className="font-bold">{premium} USDC</span> (1% of
              coverage)
            </div>
            <div className="text-xs text-gray-400">
              (MVP: premium rate is fixed, duration is for UI only)
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleBuyInsurance}
            disabled={
              buying || coverage < minCoverage || coverage > maxCoverage
            }
          >
            {buying ? "Processing..." : "Confirm & Buy Insurance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
