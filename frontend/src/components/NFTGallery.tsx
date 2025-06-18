import { useReadContract } from "wagmi";
import {
  PROPERTY_NFT_ADDRESS,
  COLLATERAL_VAULT_ADDRESS,
  LOAN_MANAGER_ADDRESS,
} from "../constants";
import LoanActions from "./LoanActions";

// Replace with your actual deployed PropertyNFT address and ABI
const NFT_ABI = [
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    name: "tokenOfOwnerByIndex",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
];

const VAULT_ABI = [
  {
    constant: true,
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "activeLoans",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getDeposit",
    outputs: [
      {
        components: [
          { name: "tokenId", type: "uint256" },
          { name: "loanId", type: "uint256" },
          { name: "collateralValue", type: "uint256" },
          { name: "timestamp", type: "uint256" },
          { name: "borrower", type: "address" },
          { name: "isActive", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    type: "function",
  },
];

const LOAN_MANAGER_ABI = [
  {
    constant: true,
    inputs: [{ name: "loanId", type: "uint256" }],
    name: "loans",
    outputs: [
      { name: "loanId", type: "uint256" },
      { name: "tokenId", type: "uint256" },
      { name: "debt", type: "uint256" },
      { name: "startTimestamp", type: "uint256" },
      { name: "borrower", type: "address" },
      { name: "isActive", type: "bool" },
    ],
    type: "function",
  },
];

export default function NFTGallery({ address }: { address: string }) {
  const { data: balance, isLoading: loadingBalance } = useReadContract({
    address: PROPERTY_NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  const nftCount = Number(balance ?? 0n);

  // For demo: just show tokenIds, not tokenURIs/images
  const tokenIds = Array.from({ length: nftCount }, (_, i) => i);

  return (
    <div className="mb-6 w-full">
      <span className="font-semibold">Your Property NFTs:</span>
      {loadingBalance ? (
        <div>Loading...</div>
      ) : nftCount === 0 ? (
        <div>No NFTs found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {tokenIds.map((idx) => (
            <NFTCard key={idx} address={address} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

function NFTCard({ address, index }: { address: string; index: number }) {
  const { data: tokenId, isLoading } = useReadContract({
    address: PROPERTY_NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "tokenOfOwnerByIndex",
    args: [address, BigInt(index)],
  });

  const { data: isCollateralized, isLoading: loadingStatus } = useReadContract({
    address: COLLATERAL_VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "activeLoans",
    args: [tokenId ?? 0n],
    query: { enabled: typeof tokenId === "bigint" },
  });

  const { data: deposit } = useReadContract({
    address: COLLATERAL_VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "getDeposit",
    args: [tokenId ?? 0n],
    query: { enabled: typeof tokenId === "bigint" },
  });

  const loanId =
    deposit && typeof deposit === "object" && "loanId" in deposit
      ? (deposit as any).loanId
      : undefined;

  const { data: loan } = useReadContract({
    address: LOAN_MANAGER_ADDRESS,
    abi: LOAN_MANAGER_ABI,
    functionName: "loans",
    args: [loanId ?? 0n],
    query: { enabled: typeof loanId === "bigint" },
  });

  return (
    <div className="glass-card border border-blue-200 shadow-lg mb-2 p-4 transition-transform hover:scale-[1.02]">
      {isLoading ? (
        "Loading..."
      ) : (
        <div>
          <div className="font-bold text-lg mb-1">
            Token ID: {tokenId?.toString()}
          </div>
          <div className="text-sm text-zinc-500 mb-2">
            Loan/Collateral Status:{" "}
            {loadingStatus ? (
              <span>Loading...</span>
            ) : isCollateralized ? (
              <span className="text-green-600 font-semibold">
                Collateralized
              </span>
            ) : (
              <span className="text-gray-600">Not Collateralized</span>
            )}
          </div>
          {!!loan && typeof loan === "object" && (
            <div className="text-sm text-zinc-700 mb-2">
              <div>Loan ID: {(loan as any).loanId?.toString()}</div>
              <div>Debt: {(loan as any).debt?.toString()}</div>
              <div>
                Start:{" "}
                {(loan as any).startTimestamp
                  ? new Date(
                      Number((loan as any).startTimestamp) * 1000
                    ).toLocaleString()
                  : "-"}
              </div>
              <div>Status: {(loan as any).isActive ? "Active" : "Closed"}</div>
            </div>
          )}
          {typeof tokenId === "bigint" && (
            <LoanActions tokenId={Number(tokenId)} />
          )}
        </div>
      )}
    </div>
  );
}
