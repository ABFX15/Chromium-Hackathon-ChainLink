import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import dotenv from 'dotenv';
dotenv.config();


const LOAN_MANAGER_ADDRESS = '0x88cc3c656e7022e99d64849738ded1CFC2630773';
const PROPERTY_ORACLE_ADDRESS = '0xc565EB65E92f04927C329aC75Ef0cBD87a29f45f';
const COLLATERAL_VAULT_ADDRESS = '0xFBc99667CFc0Fd6389855065F0FF017202d3b18a';
const NFT_ADDRESS = '0x32FB31A9d36b5acAFfb03C978c1F7E194c577AF7';
const USDC_ADDRESS = '0x4d06f916930877A66530913AF69c3890c431D892'; // Mock USDC on Sepolia

import loanManagerArtifact from '../artifacts/contracts/LoanManager.sol/LoanManager.json';
const loanManagerAbi = loanManagerArtifact.abi;
import propertyOracleArtifact from '../artifacts/contracts/PropertyOracle.sol/PropertyOracle.json';
const propertyOracleAbi = propertyOracleArtifact.abi;
import collateralVaultArtifact from '../artifacts/contracts/CollateralVault.sol/CollateralVault.json';
const collateralVaultAbi = collateralVaultArtifact.abi;
import nftArtifact from '../artifacts/contracts/PropertyNFT.sol/MyToken.json';
const nftAbi = nftArtifact.abi;


const usdcAbi = [
    { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "type": "function" },
    { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "type": "function" },
    { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" },
    { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "type": "function" },
    { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "type": "function" }
];

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
console.log('Using account:', account.address);

const publicClient = createPublicClient({ chain: sepolia, transport: http(process.env.SEPOLIA_RPC_URL) });
const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
});

const TOKEN_ID = 2;

async function main() {
    // Check and print MockUSDC balance
    const balance = await publicClient.readContract({
        address: USDC_ADDRESS,
        abi: usdcAbi,
        functionName: 'balanceOf',
        args: [account.address],
    });
    console.log('MockUSDC balance:', (balance as bigint).toString());

    await walletClient.writeContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: 'approve',
        args: [LOAN_MANAGER_ADDRESS, TOKEN_ID],
    });
    console.log('NFT approved for LoanManager');


    await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: usdcAbi,
        functionName: 'approve',
        args: [LOAN_MANAGER_ADDRESS, 1_000_000n * 10n ** 6n], // Approve 1,000,000 USDC
    });
    console.log('USDC approved for LoanManager');
    await walletClient.writeContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: loanManagerAbi,
        functionName: 'createLoan',
        args: [TOKEN_ID, 1000n * 10n ** 6n], // tokenId, debt (e.g., 1000 USDC)
    });
    console.log('Loan created');

    await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: usdcAbi,
        functionName: 'approve',
        args: [LOAN_MANAGER_ADDRESS, 1100n * 10n ** 6n], // Repay principal + interest
    });
    await walletClient.writeContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: loanManagerAbi,
        functionName: 'repayLoan',
        args: [TOKEN_ID], // loanId (assuming loanId == tokenId for demo)
    });
    console.log('Loan repaid');

    await walletClient.writeContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: loanManagerAbi,
        functionName: 'withdrawYield',
        args: [],
    });
    console.log('Protocol yield withdrawn');


    const loan = await publicClient.readContract({
        address: LOAN_MANAGER_ADDRESS,
        abi: loanManagerAbi,
        functionName: 'loans',
        args: [TOKEN_ID], // loanId
    });
    console.log('Loan:', loan);


    const deposit = await publicClient.readContract({
        address: COLLATERAL_VAULT_ADDRESS,
        abi: collateralVaultAbi,
        functionName: 'getDepositNft',
        args: [TOKEN_ID], // tokenId
    });
    console.log('Deposit:', deposit);
}

main().catch(console.error); 