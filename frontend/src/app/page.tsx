"use client";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useContracts } from "./hooks/useContracts";

function getRandomTip() {
  const tips = [
    "Tip: Diversify your NFT portfolio for better risk management!",
    "AI Insight: Properties in trending locations have higher loan approval rates.",
    "Did you know? You can mint demo NFTs for testing anytime.",
    "Pro move: Monitor your health factor to avoid liquidation.",
    "AI: Your portfolio risk is recalculated every hour for your safety!",
    "Cross-chain: Add liquidity to multiple chains for better yields!",
    "Oracle: Property values are updated in real-time via Chainlink!",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

export default function Home() {
  const { address, isConnected, isConnecting } = useAccount();
  const [tip, setTip] = useState("");
  const [riskScore, setRiskScore] = useState(0);
  const [animValue, setAnimValue] = useState(0);
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null);
  const [loanAmount, setLoanAmount] = useState("");
  const [assetType, setAssetType] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [selectedChain, setSelectedChain] = useState(12532609583862916517n); // Avalanche Fuji
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [propertyValue, setPropertyValueInput] = useState("");
  const [selectedLoanForRisk, setSelectedLoanForRisk] = useState<number | null>(
    null
  );

  const {
    userNFTs,
    userLoans,
    lenderPositions,
    chainLiquidity,
    aiRiskScores,
    loading,
    nextLoanId,
    userUSDCBalance,
    protocolYield,
    minting,
    approving,
    depositing,
    funding,
    repaying,
    requestingValuation,
    addingLiquidity,
    withdrawingYield,
    mintSuccess,
    approveSuccess,
    depositSuccess,
    fundSuccess,
    repaySuccess,
    valuationSuccess,
    liquiditySuccess,
    withdrawSuccess,
    mintPropertyNFT,
    approveNFTForLoan,
    createLoan,
    fundLoanCrossChain,
    repayLoanAmount,
    approveUSDCForLoan,
    requestAIRiskScore,
    updateAIRiskScore,
    requestPropertyValuation,
    addChainLiquidity,
    withdrawChainLiquidity,
    withdrawProtocolYield,
    setPropertyValue,
    calculateCurrentDebt,
    getLoanDetails,
    getAIRiskScore,
    ASSET_TYPES,
    LOAN_CONSTANTS,
    CHAINLINK_FUNCTIONS_ROUTER,
    CHAINLINK_LINK_TOKEN,
    CHAINLINK_CCIP_ROUTER,
  } = useContracts();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate portfolio value
  useEffect(() => {
    if (!mounted) return;

    let start = 0;
    const end = 2600000;
    if (animValue < end) {
      const interval = setInterval(() => {
        setAnimValue((v) => (v + 50000 > end ? end : v + 50000));
      }, 30);
      return () => clearInterval(interval);
    }
  }, [animValue, mounted]);

  // Animate risk score
  useEffect(() => {
    if (!mounted) return;

    let i = 0;
    const target = 72;
    const interval = setInterval(() => {
      setRiskScore((v) => (v < target ? v + 2 : target));
      i++;
      if (i > target / 2) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    setTip(getRandomTip());
  }, []);

  const handleMintNFT = async () => {
    const tokenId = userNFTs.length + 1;
    const uri = `https://ipfs.io/ipfs/QmDemo${tokenId}`;
    await mintPropertyNFT(tokenId, uri);
  };

  const handleCreateLoan = async () => {
    if (!selectedNFT || !loanAmount) return;

    // First approve the NFT
    await approveNFTForLoan(selectedNFT);

    // Then create the loan
    const amount = parseFloat(loanAmount) * 1e6; // Convert to USDC decimals
    await createLoan(selectedNFT, amount, assetType);
  };

  const handleFundLoan = async () => {
    if (!nextLoanId) return;
    await fundLoanCrossChain(nextLoanId - 1); // Use the last created loan
  };

  const handleRepayLoan = async () => {
    if (!nextLoanId) return;
    await repayLoanAmount(nextLoanId - 1); // Use the last created loan
  };

  const handleRequestAIRiskScore = async () => {
    if (!selectedLoanForRisk) return;
    await requestAIRiskScore(selectedLoanForRisk);
  };

  const handleRequestPropertyValuation = async () => {
    if (!selectedNFT) return;
    await requestPropertyValuation(selectedNFT);
  };

  const handleAddChainLiquidity = async () => {
    if (!liquidityAmount) return;
    const amount = parseFloat(liquidityAmount) * 1e6; // Convert to USDC decimals
    await addChainLiquidity(Number(selectedChain), amount);
  };

  const handleWithdrawProtocolYield = async () => {
    await withdrawProtocolYield();
  };

  const handleSetPropertyValue = async () => {
    if (!selectedNFT || !propertyValue) return;
    const value = parseFloat(propertyValue) * 1e6; // Convert to USDC decimals
    await setPropertyValue(selectedNFT, value);
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-3xl font-bold text-cyan-400 mb-4">
          Loading ORACLEND...
        </div>
        <div className="text-cyan-200">
          Please wait while we connect to your wallet.
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-2 bg-cyan-900/30 px-4 py-2 rounded-lg border border-cyan-700">
          <span className="text-cyan-400 font-bold">USDC:</span>
          <span className="text-cyan-200 text-lg font-mono">
            ${(userUSDCBalance / 1e6).toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-cyan-900/30 px-4 py-2 rounded-lg border border-cyan-700">
          <span className="text-cyan-400 font-bold">Yield:</span>
          <span className="text-cyan-200 text-lg font-mono">
            ${(protocolYield / 1e6).toFixed(2)}
          </span>
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
        <div className="text-xl font-bold text-cyan-400 mb-2 flex items-center justify-between">
          <span>NFT Gallery</span>
          <button
            onClick={handleMintNFT}
            disabled={minting}
            className="bg-cyan-700 hover:bg-cyan-600 disabled:bg-cyan-800 text-black font-bold py-2 px-4 rounded transition-colors"
          >
            {minting ? "Minting..." : "Mint New NFT"}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userNFTs.map((nft) => (
            <div
              key={nft.tokenId}
              className={`card p-4 flex flex-col items-center animate-fade-in cursor-pointer transition-all ${
                selectedNFT === nft.tokenId ? "ring-2 ring-cyan-400" : ""
              }`}
              onClick={() => setSelectedNFT(nft.tokenId)}
            >
              <img
                src={`https://source.unsplash.com/400x300/?house,property,${nft.tokenId}`}
                alt="Property"
                className="rounded mb-4 w-full h-32 object-cover"
              />
              <div className="font-bold text-cyan-200 mb-1">
                Waterfront Villa #{nft.tokenId}
              </div>
              <div className="text-xs text-cyan-400 mb-2">
                ${nft.value?.toLocaleString() || "500,000"}
              </div>
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

      {/* AI Risk Management */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-4">
          AI Risk Management
        </div>
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-cyan-200 text-sm mb-2">
                Select Loan for Risk Assessment
              </label>
              <select
                value={selectedLoanForRisk || ""}
                onChange={(e) =>
                  setSelectedLoanForRisk(Number(e.target.value) || null)
                }
                className="w-full bg-cyan-900/30 border border-cyan-700 rounded px-3 py-2 text-cyan-200"
              >
                <option value="">Select a loan...</option>
                {userLoans.map((loan) => (
                  <option key={Number(loan.loanId)} value={Number(loan.loanId)}>
                    Loan #{Number(loan.loanId)} - $
                    {Number(loan.principalAmount) / 1e6}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleRequestAIRiskScore}
                disabled={requestingValuation || !selectedLoanForRisk}
                className="bg-purple-700 hover:bg-purple-600 disabled:bg-purple-800 text-black font-bold py-2 px-4 rounded transition-colors"
              >
                {requestingValuation
                  ? "Requesting..."
                  : "Request AI Risk Score"}
              </button>
            </div>
          </div>

          {/* AI Risk Scores Display */}
          {aiRiskScores.length > 0 && (
            <div className="mt-4">
              <h4 className="text-cyan-300 font-bold mb-2">
                Current Risk Scores
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRiskScores.map((score) => (
                  <div
                    key={score.loanId}
                    className="bg-cyan-900/20 p-3 rounded border border-cyan-700"
                  >
                    <div className="text-cyan-200 font-bold">
                      Loan #{score.loanId}
                    </div>
                    <div className="text-cyan-400 text-sm">
                      Risk: {score.riskScore}/100
                    </div>
                    <div className="text-cyan-400 text-sm">
                      Rate: {score.interestRate / 100}%
                    </div>
                    <div className="text-cyan-400 text-sm">
                      Volatility: {score.volatilityScore}/100
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Valuation */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-4">
          Property Valuation
        </div>
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-cyan-200 text-sm mb-2">
                Selected NFT
              </label>
              <div className="text-cyan-400 font-mono">
                #{selectedNFT || "None"}
              </div>
            </div>
            <div>
              <label className="block text-cyan-200 text-sm mb-2">
                Property Value (USD)
              </label>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValueInput(e.target.value)}
                placeholder="500000"
                className="w-full bg-cyan-900/30 border border-cyan-700 rounded px-3 py-2 text-cyan-200"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleRequestPropertyValuation}
                disabled={requestingValuation || !selectedNFT}
                className="bg-blue-700 hover:bg-blue-600 disabled:bg-blue-800 text-black font-bold py-2 px-4 rounded transition-colors"
              >
                {requestingValuation ? "Requesting..." : "Request Valuation"}
              </button>
              <button
                onClick={handleSetPropertyValue}
                disabled={!selectedNFT || !propertyValue}
                className="bg-green-700 hover:bg-green-600 disabled:bg-green-800 text-black font-bold py-2 px-4 rounded transition-colors"
              >
                Set Value
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Chain Liquidity */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-4">
          Cross-Chain Liquidity
        </div>
        <div className="card p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-cyan-200 text-sm mb-2">
                Target Chain
              </label>
              <select
                value={selectedChain.toString()}
                onChange={(e) => setSelectedChain(BigInt(e.target.value))}
                className="w-full bg-cyan-900/30 border border-cyan-700 rounded px-3 py-2 text-cyan-200"
              >
                <option value="12532609583862916517">Avalanche Fuji</option>
                <option value="16015286601757825753">Polygon Mumbai</option>
                <option value="12532609583862916518">Arbitrum Sepolia</option>
              </select>
            </div>
            <div>
              <label className="block text-cyan-200 text-sm mb-2">
                Liquidity Amount (USDC)
              </label>
              <input
                type="number"
                value={liquidityAmount}
                onChange={(e) => setLiquidityAmount(e.target.value)}
                placeholder="10000"
                className="w-full bg-cyan-900/30 border border-cyan-700 rounded px-3 py-2 text-cyan-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddChainLiquidity}
                disabled={addingLiquidity || !liquidityAmount}
                className="bg-orange-700 hover:bg-orange-600 disabled:bg-orange-800 text-black font-bold py-2 px-4 rounded transition-colors"
              >
                {addingLiquidity ? "Adding..." : "Add Liquidity"}
              </button>
            </div>
          </div>

          {/* Chain Liquidity Display */}
          {chainLiquidity.length > 0 && (
            <div className="mt-4">
              <h4 className="text-cyan-300 font-bold mb-2">
                Current Liquidity Positions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {chainLiquidity.map((liquidity, index) => (
                  <div
                    key={index}
                    className="bg-cyan-900/20 p-3 rounded border border-cyan-700"
                  >
                    <div className="text-cyan-200 font-bold">
                      Chain {liquidity.chainSelector.toString()}
                    </div>
                    <div className="text-cyan-400 text-sm">
                      Total: ${Number(liquidity.totalLiquidity) / 1e6}
                    </div>
                    <div className="text-cyan-400 text-sm">
                      Available: ${Number(liquidity.availableLiquidity) / 1e6}
                    </div>
                    <div className="text-cyan-400 text-sm">
                      Utilization: {Number(liquidity.utilizationRate) / 100}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loan Creation */}
      {selectedNFT && (
        <div className="mb-8">
          <div className="text-xl font-bold text-cyan-400 mb-4">
            Create Loan
          </div>
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-cyan-200 text-sm mb-2">
                  Selected NFT
                </label>
                <div className="text-cyan-400 font-mono">#{selectedNFT}</div>
              </div>
              <div>
                <label className="block text-cyan-200 text-sm mb-2">
                  Loan Amount (USDC)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="100000"
                  className="w-full bg-cyan-900/30 border border-cyan-700 rounded px-3 py-2 text-cyan-200"
                />
              </div>
              <div>
                <label className="block text-cyan-200 text-sm mb-2">
                  Asset Type
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(Number(e.target.value))}
                  className="w-full bg-cyan-900/30 border border-cyan-700 rounded px-3 py-2 text-cyan-200"
                >
                  <option value={ASSET_TYPES.REAL_ESTATE}>Real Estate</option>
                  <option value={ASSET_TYPES.ART}>Art</option>
                  <option value={ASSET_TYPES.INVOICE}>Invoice</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCreateLoan}
                disabled={approving || depositing || !loanAmount}
                className="bg-cyan-700 hover:bg-cyan-600 disabled:bg-cyan-800 text-black font-bold py-2 px-6 rounded transition-colors"
              >
                {approving
                  ? "Approving..."
                  : depositing
                  ? "Creating Loan..."
                  : "Create Loan"}
              </button>
              <button
                onClick={handleFundLoan}
                disabled={funding || !nextLoanId}
                className="bg-green-700 hover:bg-green-600 disabled:bg-green-800 text-black font-bold py-2 px-6 rounded transition-colors"
              >
                {funding ? "Funding..." : "Fund Loan"}
              </button>
              <button
                onClick={handleRepayLoan}
                disabled={repaying || !nextLoanId}
                className="bg-blue-700 hover:bg-blue-600 disabled:bg-blue-800 text-black font-bold py-2 px-6 rounded transition-colors"
              >
                {repaying ? "Repaying..." : "Repay Loan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Loans */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-2">Active Loans</div>
        <div className="card p-4">
          {userLoans.length > 0 ? (
            userLoans.map((loan) => (
              <div
                key={Number(loan.loanId)}
                className="flex items-center gap-8 mb-4"
              >
                <div className="text-cyan-200 font-bold">
                  Loan #{Number(loan.loanId)}
                </div>
                <div className="text-cyan-400">
                  ${Number(loan.principalAmount) / 1e6} borrowed
                </div>
                <div className="text-cyan-400">
                  {Number(loan.interestRate) / 100}% APR
                </div>
                <div className="text-green-400">
                  Health: <span className="font-mono">1.23</span>
                </div>
                <div className="text-cyan-400">
                  Asset:{" "}
                  {Number(loan.assetType) === ASSET_TYPES.REAL_ESTATE
                    ? "Real Estate"
                    : Number(loan.assetType) === ASSET_TYPES.ART
                    ? "Art"
                    : "Invoice"}
                </div>
              </div>
            ))
          ) : (
            <div className="text-cyan-200">No active loans</div>
          )}
        </div>
      </div>

      {/* Lender Positions */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-2">
          Lender Positions
        </div>
        <div className="card p-4">
          {lenderPositions.length > 0 ? (
            lenderPositions.map((position) => (
              <div
                key={position.tokenId}
                className="flex items-center gap-8 mb-4"
              >
                <div className="text-cyan-200 font-bold">
                  Position #{position.tokenId}
                </div>
                <div className="text-cyan-400">Loan #{position.loanId}</div>
                <div className="text-cyan-400">
                  ${Number(position.amount) / 1e6} lent
                </div>
                <div className="text-cyan-400">
                  Lender: {position.lender.slice(0, 6)}...
                  {position.lender.slice(-4)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-cyan-200">No lender positions</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="text-xl font-bold text-cyan-400 mb-2">
          Quick Actions
        </div>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleMintNFT}
            disabled={minting}
            className="bg-cyan-700 hover:bg-cyan-600 disabled:bg-cyan-800 text-black font-bold py-2 px-6 rounded transition-colors"
          >
            {minting ? "Minting..." : "Mint Property NFT"}
          </button>
          <button
            onClick={handleWithdrawProtocolYield}
            disabled={withdrawingYield || protocolYield === 0}
            className="bg-yellow-700 hover:bg-yellow-600 disabled:bg-yellow-800 text-black font-bold py-2 px-6 rounded transition-colors"
          >
            {withdrawingYield ? "Withdrawing..." : "Withdraw Yield"}
          </button>
          <button
            onClick={handleSetPropertyValue}
            disabled={!selectedNFT || !propertyValue}
            className="bg-green-700 hover:bg-green-600 disabled:bg-green-800 text-black font-bold py-2 px-6 rounded transition-colors"
          >
            Set Property Value
          </button>
          <button
            onClick={handleRequestPropertyValuation}
            disabled={requestingValuation || !selectedNFT}
            className="bg-blue-700 hover:bg-blue-600 disabled:bg-blue-800 text-black font-bold py-2 px-6 rounded transition-colors"
          >
            {requestingValuation ? "Requesting..." : "Request Valuation"}
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
            {mintSuccess && <div>🟢 NFT minted successfully!</div>}
            {approveSuccess && <div>🟢 NFT approved for loan!</div>}
            {depositSuccess && <div>🟢 Loan created successfully!</div>}
            {fundSuccess && <div>🟢 Loan funded successfully!</div>}
            {repaySuccess && <div>🟢 Loan repaid successfully!</div>}
            {valuationSuccess && <div>🟢 Property valuation requested!</div>}
            {liquiditySuccess && <div>🟢 Cross-chain liquidity added!</div>}
            {withdrawSuccess && <div>🟢 Protocol yield withdrawn!</div>}
            {!mintSuccess &&
              !approveSuccess &&
              !depositSuccess &&
              !fundSuccess &&
              !repaySuccess &&
              !valuationSuccess &&
              !liquiditySuccess &&
              !withdrawSuccess && (
                <>
                  <div>🟢 Loan repaid: $350,000 (Today)</div>
                  <div>🔵 NFT minted: Waterfront Villa #4 (Yesterday)</div>
                  <div>🟡 Property value updated: $500,000 (2 days ago)</div>
                  <div>🟣 AI risk score updated: 72/100 (3 days ago)</div>
                  <div>
                    🟠 Cross-chain liquidity added: $10,000 to Avalanche (4 days
                    ago)
                  </div>
                </>
              )}
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
