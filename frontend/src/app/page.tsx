"use client";

import { useAccount } from "wagmi";
import Balance from "../components/Balance";
import NFTGallery from "../components/NFTGallery";
import MintNFT from "../components/MintNFT";

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">
        Private Credit Vault Dashboard
      </h1>
      {!isConnected ? (
        <p className="text-lg">Connect your wallet to view your dashboard.</p>
      ) : (
        <>
          <MintNFT />
          <div className="mb-6">
            <span className="font-semibold">Connected Wallet:</span> {address}
          </div>
          <Balance address={address!} />
          <NFTGallery address={address!} />
        </>
      )}
    </main>
  );
}
