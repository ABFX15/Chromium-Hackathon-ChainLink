import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { USDC_ADDRESS } from "../constants";

// Replace with your actual deployed USDC address and ABI
const USDC_ABI = [
  {
    constant: true,
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

export default function Balance({ address }: { address: string }) {
  const { data, isLoading, error } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  return (
    <div className="mb-6">
      <span className="font-semibold">USDC Balance:</span>{" "}
      {isLoading
        ? "Loading..."
        : error
        ? "Error"
        : formatUnits((data as bigint) ?? 0n, 6)}
    </div>
  );
}
