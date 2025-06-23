"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileSignature,
  HandCoins,
  Search,
  Landmark,
  PiggyBank,
  CheckCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const steps = [
  {
    stage: "Borrower",
    title: "Step 1: Mint Property NFT",
    description:
      "Tokenize your real-world property into a unique NFT on the blockchain. This creates a digital representation of your asset that can be used as collateral.",
    icon: FileSignature,
    color: "text-blue-400",
  },
  {
    stage: "Borrower",
    title: "Step 2: Request a Loan",
    description:
      "Use our AI-powered risk assessment to determine optimal loan terms. Then, lock your newly minted NFT in our secure vault to create a loan request on the marketplace.",
    icon: HandCoins,
    color: "text-blue-400",
  },
  {
    stage: "Lender",
    title: "Step 3: Browse the Marketplace",
    description:
      "As a lender, you can browse a marketplace of property-backed loan requests. View property details, AI risk scores, and interest rates to find investment opportunities.",
    icon: Search,
    color: "text-green-400",
  },
  {
    stage: "Lender",
    title: "Step 4: Fund a Loan",
    description:
      "Fund a loan request with USDC. Once funded, you receive a LenderNFT, a tradeable token representing your position and right to receive interest payments.",
    icon: Landmark,
    color: "text-green-400",
  },
  {
    stage: "Borrower",
    title: "Step 5: Repay the Loan",
    description:
      "The borrower repays the principal and accrued interest in USDC before the loan term ends. Our smart contracts handle the distribution of funds.",
    icon: PiggyBank,
    color: "text-pink-400",
  },
  {
    stage: "Borrower",
    title: "Step 6: Reclaim Your NFT",
    description:
      "Upon full repayment, the smart contract automatically releases the property NFT from the vault and returns it to the borrower, completing the loan cycle.",
    icon: CheckCircle,
    color: "text-pink-400",
  },
];

export function InteractiveWalkthrough() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
  };

  const { icon: Icon, title, description, stage, color } = steps[currentStep];

  return (
    <div className="bg-gray-800/20 rounded-xl border border-cyan-500/20 p-8 backdrop-blur-sm min-h-[400px] flex flex-col justify-between">
      <div className="flex-grow flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 flex justify-center">
                <div
                  className={`p-6 bg-gray-900/50 rounded-full border-2 border-cyan-500/30 ${color}`}
                >
                  <Icon className="w-24 h-24" />
                </div>
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <p className={`font-bold mb-2 ${color}`}>{stage}</p>
                <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-300 leading-relaxed">{description}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentStep === index
                  ? "bg-cyan-400 scale-125"
                  : "bg-gray-600 hover:bg-gray-500"
              }`}
            ></button>
          ))}
        </div>
        <button
          onClick={nextStep}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
