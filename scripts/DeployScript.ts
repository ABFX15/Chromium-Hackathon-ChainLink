import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-toolbox-viem";
import { ethers } from "hardhat";
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
    console.log("🚀 Starting deployment of Private Credit Vault contracts...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);


    // 1. Deploy PropertyNFT
    console.log("📦 Deploying PropertyNFT...");
    const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
    const propertyNFT = await PropertyNFT.deploy(
        "PropertyNFT",
        "pNFT",
        "https://your-base-uri.com/"
    );
    await propertyNFT.waitForDeployment();
    const propertyNFTAddress = await propertyNFT.getAddress();
    console.log("✅ PropertyNFT deployed to:", propertyNFTAddress);

    // 2. Deploy CollateralVault
    console.log("\n📦 Deploying CollateralVault...");
    const CollateralVault = await ethers.getContractFactory("CollateralVault");
    const collateralVault = await CollateralVault.deploy(propertyNFTAddress, deployer.address);
    await collateralVault.waitForDeployment();
    const collateralVaultAddress = await collateralVault.getAddress();
    console.log("✅ CollateralVault deployed to:", collateralVaultAddress);

    // 3. Deploy LenderNFT
    console.log("\n📦 Deploying LenderNFT...");
    const LenderNFT = await ethers.getContractFactory("LenderNFT");
    const lenderNFT = await LenderNFT.deploy();
    await lenderNFT.waitForDeployment();
    const lenderNFTAddress = await lenderNFT.getAddress();
    console.log("✅ LenderNFT deployed to:", lenderNFTAddress);

    // 4. Deploy PropertyOracle
    console.log("\n📦 Deploying PropertyOracle...");
    const PropertyOracle = await ethers.getContractFactory("PropertyOracle");
    const propertyOracle = await PropertyOracle.deploy();
    await propertyOracle.waitForDeployment();
    const propertyOracleAddress = await propertyOracle.getAddress();
    console.log("✅ PropertyOracle deployed to:", propertyOracleAddress);

    // 5. Deploy LoanManager
    console.log("\n📦 Deploying LoanManager...");
    const ccipRouter = "0xD0daae2231E9CB96b94C8512223533293C3693Bf"; // Sepolia CCIP Router
    const usdc = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Mock USDC on Sepolia
    const destinationChainSelector = 12532609583862916517n; // Avalanche Fuji testnet

    const LoanManager = await ethers.getContractFactory("LoanManager");
    const loanManager = await LoanManager.deploy(
        propertyNFTAddress,
        collateralVaultAddress,
        lenderNFTAddress,
        ccipRouter,
        usdc,
        destinationChainSelector
    );
    await loanManager.waitForDeployment();
    const loanManagerAddress = await loanManager.getAddress();
    console.log("✅ LoanManager deployed to:", loanManagerAddress);

    // 6. Deploy CrossChainLiquidityPool
    console.log("\n📦 Deploying CrossChainLiquidityPool...");
    const CrossChainLiquidityPool = await ethers.getContractFactory("CrossChainLiquidityPool");
    const crossChainLiquidityPool = await CrossChainLiquidityPool.deploy(ccipRouter, usdc);
    await crossChainLiquidityPool.waitForDeployment();
    const crossChainLiquidityPoolAddress = await crossChainLiquidityPool.getAddress();
    console.log("✅ CrossChainLiquidityPool deployed to:", crossChainLiquidityPoolAddress);

    // 7. Configure contracts
    console.log("\n🔧 Configuring contracts...");

    // Set LoanManager in CollateralVault
    await collateralVault.setLoanManager(loanManagerAddress);
    console.log("✅ CollateralVault loanManager set.");

    // Set LoanManager in LenderNFT
    await lenderNFT.setLoanManager(loanManagerAddress);
    console.log("✅ LenderNFT loanManager set.");

    // Set PropertyOracle in LoanManager
    await loanManager.setPropertyOracle(propertyOracleAddress);
    console.log("✅ LoanManager propertyOracle set.");

    // 8. Mint some demo NFTs
    console.log("🎨 Minting demo NFTs...");
    const nftOwner = deployer.address;
    const demoNFTs = [
        {
            uri: "ipfs://bafkreifvw55x3smukoehchotb3o37xafwha56cduk7f54kq5b5f7g5ktta",
            value: 750000,
        },
        {
            uri: "ipfs://bafkreicg47qjbil26q5wudnzl7s3rqmhasvwwqil3aevl2i3fsnsyjsf5m",
            value: 1200000,
        },
    ];

    for (const [index, nft] of demoNFTs.entries()) {
        const tx = await propertyNFT.safeMint(nftOwner, nft.uri);
        await tx.wait();
        const tokenId = index + 1; // Since we start minting from ID 1 now
        console.log(`✅ Minted NFT ${tokenId} for ${nftOwner}`);

        // Set the property value in the oracle
        await propertyOracle.setPropertyValue(tokenId, nft.value);
        console.log(`✓ Set value for NFT ${tokenId} to $${nft.value}`);
    }

    // 9. Print deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:");
    console.log(`PropertyNFT: ${propertyNFTAddress}`);
    console.log(`CollateralVault: ${collateralVaultAddress}`);
    console.log(`LenderNFT: ${lenderNFTAddress}`);
    console.log(`PropertyOracle: ${propertyOracleAddress}`);
    console.log(`LoanManager: ${loanManagerAddress}`);
    console.log(`CrossChainLiquidityPool: ${crossChainLiquidityPoolAddress}`);

    // Generate a contracts.ts file for the frontend
    const contractsConfig = `
export const CONTRACT_ADDRESSES = {
  PROPERTY_NFT: "${propertyNFTAddress}",
  COLLATERAL_VAULT: "${collateralVaultAddress}",
  LENDER_NFT: "${lenderNFTAddress}",
  PROPERTY_ORACLE: "${propertyOracleAddress}",
  LOAN_MANAGER: "${loanManagerAddress}",
  CROSS_CHAIN_LIQUIDITY_POOL: "${crossChainLiquidityPoolAddress}",
  USDC: "${usdc}", // Using static address for MockUSDC on Sepolia
};
`;
    const outputPath = join(__dirname, '../frontend/src/lib/contracts.ts');
    writeFileSync(outputPath, contractsConfig.trim());
    console.log(`\n✅ Frontend configuration written to ${outputPath}`);


    console.log("\n🔗 Next Steps:");
    console.log("1. Restart your frontend development server");
    console.log("2. Test the complete borrow and lend workflow");

    console.log("\n🎉 Deployment and setup complete! 🎉\n");
    console.log("📈 You can now interact with the dApp on the frontend.");

    console.log("\n" + "=".repeat(60));
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});