"use client";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";

function getRandomTip() {
  const tips = [
    "Tip: Diversify your NFT portfolio for better risk management!",
    "AI Insight: Properties in trending locations have higher loan approval rates.",
    "Did you know? You can mint demo NFTs for testing anytime.",
    "Pro move: Monitor your health factor to avoid liquidation.",
    "AI: Your portfolio risk is recalculated every hour for your safety!",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [tip, setTip] = useState("");
  const [riskScore, setRiskScore] = useState(0);
  const [animValue, setAnimValue] = useState(0);

  // Animate portfolio value
  useEffect(() => {
    let start = 0;
    const end = 2600000;
    if (animValue < end) {
      const interval = setInterval(() => {
        setAnimValue((v) => (v + 50000 > end ? end : v + 50000));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [animValue]);

  // Animate risk score
  useEffect(() => {
    let i = 0;
    const target = 72;
    const interval = setInterval(() => {
      setRiskScore((v) => (v < target ? v + 2 : target));
      i++;
      if (i > target / 2) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTip(getRandomTip());
  }, []);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-3xl font-bold text-cyan-400 mb-4">
          Welcome to ORACLEND
        </div>
        <div className="text-cyan-200 mb-6">
          Connect your wallet to view your dashboard.
        </div>
        <div className="bg-cyan-900/30 p-6 rounded-lg border border-cyan-700 text-cyan-300">
          🔑 Please connect your wallet using the button in the top right.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Wallet Info */}
      <div className="flex items-center gap-6 mb-8">
        <div className="flex items-center gap-3 bg-cyan-900/30 px-4 py-2 rounded-lg border border-cyan-700">
          <span className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-black font-bold text-lg">
            {address?.slice(2, 4).toUpperCase()}
          </span>
          <span className="font-mono text-cyan-200">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            className="ml-2 text-xs text-cyan-400 hover:text-cyan-200"
            onClick={() => navigator.clipboard.writeText(address || "")}
          >
            Copy
          </button>
        </div>
        <div className="flex items-center gap-2 bg-cyan-900/30 px-4 py-2 rounded-lg border border-cyan-700 animate-pulse">
          <span className="text-cyan-400 font-bold">AI Risk Score:</span>
          <span className="text-cyan-200 text-lg font-mono">{riskScore}</span>
          <span className="text-xs text-cyan-400">/ 100</span>
        </div>
      </div>
      {/* Portfolio Value */}
      <div className="mb-8">
        <div className="text-4xl font-bold text-cyan-300 mb-2 flex items-center gap-3">
          <span className="animate-glow">${animValue.toLocaleString()}</span>
          <span className="text-lg text-cyan-500">Total Portfolio Value</span>
        </div>
        <div className="w-full h-2 bg-cyan-900/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 animate-pulse"
            style={{ width: `${riskScore}%` }}
          />
        </div>
      </div>
      {/* NFT Gallery */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-2">NFT Gallery</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card p-4 flex flex-col items-center animate-fade-in"
            >
              <img
                src={`https://source.unsplash.com/400x300/?house,property,${i}`}
                alt="Property"
                className="rounded mb-4 w-full h-32 object-cover"
              />
              <div className="font-bold text-cyan-200 mb-1">
                Waterfront Villa #{i}
              </div>
              <div className="text-xs text-cyan-400 mb-2">$500,000</div>
              <div className="flex gap-2 text-xs">
                <span className="bg-cyan-900/30 px-2 py-1 rounded">
                  REAL ESTATE
                </span>
                <span className="bg-cyan-900/30 px-2 py-1 rounded">COMMON</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Active Loans */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-2">Active Loans</div>
        <div className="card p-4">
          <div className="flex items-center gap-8">
            <div className="text-cyan-200 font-bold">1 Active Loan</div>
            <div className="text-cyan-400">$350,000 borrowed</div>
            <div className="text-cyan-400">47.9% APR</div>
            <div className="text-green-400">
              Health: <span className="font-mono">1.23</span>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-2">
          Quick Actions
        </div>
        <div className="flex gap-4">
          <button className="bg-cyan-700 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded transition-colors">
            Mint Property NFT
          </button>
          <button className="bg-cyan-700 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded transition-colors">
            Withdraw Yield
          </button>
          <button className="bg-cyan-700 hover:bg-cyan-600 text-black font-bold py-2 px-6 rounded transition-colors">
            Set Property Value
          </button>
        </div>
      </div>
      {/* Recent Activity */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-2">
          Recent Activity
        </div>
        <div className="card p-4">
          <div className="flex flex-col gap-2 text-cyan-200">
            <div>🟢 Loan repaid: $350,000 (Today)</div>
            <div>🔵 NFT minted: Waterfront Villa #4 (Yesterday)</div>
            <div>🟡 Property value updated: $500,000 (2 days ago)</div>
          </div>
        </div>
      </div>
      {/* AI Assistant Tip */}
      <div className="mt-8 flex items-center gap-3 bg-cyan-900/30 px-4 py-3 rounded-lg border border-cyan-700 animate-fade-in">
        <span className="text-cyan-400 text-2xl">🤖</span>
        <span className="text-cyan-200 font-mono">{tip}</span>
      </div>
    </div>
  );
}

// Animations
// Add to globals.css:
// .animate-glow { animation: glow 1.5s infinite alternate; }
// @keyframes glow { from { text-shadow: 0 0 8px #22d3ee; } to { text-shadow: 0 0 24px #67e8f9; } }
// .animate-fade-in { animation: fadeIn 1s ease; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
