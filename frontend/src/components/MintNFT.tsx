"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { PROPERTY_NFT_ADDRESS } from "../constants";

const PROPERTY_NFT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "uri", type: "string" },
    ],
    name: "safeMint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export default function MintNFT() {
  const { address } = useAccount();
  const [tokenId, setTokenId] = useState("");
  const [uri, setUri] = useState("");
  const [status, setStatus] = useState("");
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const handleMint = async () => {
    setStatus("");
    try {
      await writeContract({
        address: PROPERTY_NFT_ADDRESS,
        abi: PROPERTY_NFT_ABI,
        functionName: "safeMint",
        args: [address, BigInt(tokenId), uri],
      });
      setStatus("Minted!");
    } catch (e) {
      setStatus("Error minting NFT");
    }
  };

  return (
    <div className="mb-8 p-4 border rounded bg-white shadow max-w-md w-full">
      <h2 className="font-semibold mb-2">Mint New Property NFT</h2>
      <input
        className="border p-1 rounded mb-2 w-full"
        type="number"
        placeholder="Token ID"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />
      <input
        className="border p-1 rounded mb-2 w-full"
        type="text"
        placeholder="Token URI"
        value={uri}
        onChange={(e) => setUri(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleMint}
        disabled={isPending || !tokenId || !uri}
      >
        {isPending ? "Minting..." : "Mint NFT"}
      </button>
      {status && <div className="mt-2 text-sm">{status}</div>}
      {isSuccess && (
        <div className="mt-2 text-green-600">Transaction successful!</div>
      )}
      {error && <div className="mt-2 text-red-600">{error.message}</div>}
    </div>
  );
}
