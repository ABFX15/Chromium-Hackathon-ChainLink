import dotenv from 'dotenv';
import { ethers } from "hardhat";
dotenv.config();

const LOAN_MANAGER_ADDRESS = '0xa06E2EC33adD56Eab0629Ba6A0C9A709822941ac';
const PROPERTY_ORACLE_ADDRESS = '0xB778e095E88da7466005B72ceBF6e78341401a30';
const COLLATERAL_VAULT_ADDRESS = '0xe2f72471c2D1Acc74F410a1AD481F87d77A512A7';
const NFT_ADDRESS = '0x23d7Ae1B750e174a915A95606E64927324df3548';
const USDC_ADDRESS = '0x4d06f916930877A66530913AF69c3890c431D892'; // Mock USDC on Sepolia
const TOKEN_ID = 2;

import loanManagerArtifact from '../artifacts/contracts/LoanManager.sol/LoanManager.json';
const loanManagerAbi = loanManagerArtifact.abi;
import propertyOracleArtifact from '../artifacts/contracts/PropertyOracle.sol/PropertyOracle.json';
const propertyOracleAbi = propertyOracleArtifact.abi;
import collateralVaultArtifact from '../artifacts/contracts/CollateralVault.sol/CollateralVault.json';
const collateralVaultAbi = collateralVaultArtifact.abi;
import nftArtifact from '../artifacts/contracts/PropertyNFT.sol/PropertyNFT.json';
const nftAbi = nftArtifact.abi;
import usdcArtifact from '../artifacts/contracts/MockUSDC.sol/MockUSDC.json';
const usdcAbi = usdcArtifact.abi;

async function main() {
    const [signer] = await ethers.getSigners();
    console.log('Using account:', signer.address);

    // USDC Contract
    const usdc = await ethers.getContractAt(usdcAbi, USDC_ADDRESS, signer);
    // NFT Contract
    const nft = await ethers.getContractAt(nftAbi, NFT_ADDRESS, signer);
    // LoanManager Contract
    const loanManager = await ethers.getContractAt(loanManagerAbi, LOAN_MANAGER_ADDRESS, signer);
    // CollateralVault Contract
    const vault = await ethers.getContractAt(collateralVaultAbi, COLLATERAL_VAULT_ADDRESS, signer);

    // 1. Check and print MockUSDC balance
    const balance = await usdc.balanceOf(signer.address);
    console.log('MockUSDC balance:', balance.toString());

    // 2. Approve LoanManager to spend USDC (origination fee)
    const loanAmount = ethers.parseUnits("1000", 6); // Example loan amount
    const fee = loanAmount / 100n; // 1% fee
    const approveFeeTx = await usdc.approve(LOAN_MANAGER_ADDRESS, fee);
    await approveFeeTx.wait();
    console.log('USDC approved for origination fee:', fee.toString());

    // 3. Approve NFT for LoanManager
    const approveNftTx = await nft.approve(LOAN_MANAGER_ADDRESS, TOKEN_ID);
    await approveNftTx.wait();
    console.log('NFT approved for LoanManager');

    // 4. Approve USDC for LoanManager (full loan amount)
    const approveLoanTx = await usdc.approve(LOAN_MANAGER_ADDRESS, loanAmount);
    await approveLoanTx.wait();
    console.log('USDC approved for LoanManager (loan amount):', loanAmount.toString());

    // 5. Create loan
    const createLoanTx = await loanManager.createLoan(TOKEN_ID, loanAmount);
    await createLoanTx.wait();
    console.log('Loan created');

    // 6. Approve USDC for loan repayment (principal + interest)
    const repayAmount = ethers.parseUnits("1100", 6); // Repay principal + interest
    const approveRepayTx = await usdc.approve(LOAN_MANAGER_ADDRESS, repayAmount);
    await approveRepayTx.wait();
    console.log('USDC approved for loan repayment:', repayAmount.toString());

    // 7. Repay loan
    // Find the latest loanId (assuming incrementing loanId)
    const nextLoanId = await loanManager.nextLoanId();
    const loanId = nextLoanId.toNumber();
    const repayTx = await loanManager.repayLoan(loanId);
    await repayTx.wait();
    console.log('Loan repaid');

    // 8. Withdraw protocol yield
    const withdrawTx = await loanManager.withdrawYield();
    await withdrawTx.wait();
    console.log('Protocol yield withdrawn');

    // 9. Read loan details
    const loan = await loanManager.loans(loanId);
    console.log('Loan:', loan);

    // 10. Read deposit details
    const deposit = await vault.getDeposit(TOKEN_ID);
    console.log('Deposit:', deposit);
}

main().catch(console.error); 