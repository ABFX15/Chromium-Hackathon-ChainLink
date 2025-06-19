import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-toolbox-viem";
import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting deployment of Private Credit Vault contracts...\n");

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
    const collateralVault = await CollateralVault.deploy(propertyNFTAddress);
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

    // 4. Deploy AIRiskManager
    console.log("\n📦 Deploying AIRiskManager...");
    const functionsRouter = "0x6eed6a1c74bb1ea4e6cc7e0201c7ba8db6bdaba0"; // Sepolia Functions Router
    const AIRiskManager = await ethers.getContractFactory("AIRiskManager");
    const aiRiskManager = await AIRiskManager.deploy(functionsRouter);
    await aiRiskManager.waitForDeployment();
    const aiRiskManagerAddress = await aiRiskManager.getAddress();
    console.log("✅ AIRiskManager deployed to:", aiRiskManagerAddress);

    // 5. Deploy PropertyOracle
    console.log("\n📦 Deploying PropertyOracle...");
    const linkToken = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia LINK
    const PropertyOracle = await ethers.getContractFactory("PropertyOracle");
    const propertyOracle = await PropertyOracle.deploy(
        functionsRouter,
        linkToken,
        collateralVaultAddress
    );
    await propertyOracle.waitForDeployment();
    const propertyOracleAddress = await propertyOracle.getAddress();
    console.log("✅ PropertyOracle deployed to:", propertyOracleAddress);

    // 6. Deploy LoanManager
    console.log("\n📦 Deploying LoanManager...");
    const ccipRouter = "0xD0daae2231E9CB96b94C8512223533293C3693Bf"; // Sepolia CCIP Router
    const usdc = "0x4d06f916930877A66530913AF69c3890c431D892"; // Mock USDC on Sepolia
    const priceFeed = "0x694AA1769357215DE4FAC081bf1f309aDC325306"; // ETH/USD Sepolia
    const destinationChainSelector = 12532609583862916517n; // Avalanche Fuji testnet

    const LoanManager = await ethers.getContractFactory("LoanManager");
    const loanManager = await LoanManager.deploy(
        propertyNFTAddress,
        collateralVaultAddress,
        lenderNFTAddress,
        ccipRouter,
        usdc,
        priceFeed,
        destinationChainSelector
    );
    await loanManager.waitForDeployment();
    const loanManagerAddress = await loanManager.getAddress();
    console.log("✅ LoanManager deployed to:", loanManagerAddress);

    // 7. Configure contracts
    console.log("\n🔧 Configuring contracts...");

    // Set Oracle and LoanManager in CollateralVault
    await collateralVault.setOracle(propertyOracleAddress);
    await collateralVault.setLoanManager(loanManagerAddress);
    console.log("✅ CollateralVault oracle and loanManager set.");

    // Set LoanManager in LenderNFT
    await lenderNFT.setLoanManager(loanManagerAddress);
    console.log("✅ LenderNFT loanManager set.");

    // Set LoanManager in AIRiskManager
    await aiRiskManager.setLoanManager(loanManagerAddress);
    console.log("✅ AIRiskManager loanManager set.");

    // Add price feeds for different asset types
    await loanManager.addPriceFeed(0, priceFeed); // Real estate
    await loanManager.addPriceFeed(1, priceFeed); // Art (using same feed for demo)
    await loanManager.addPriceFeed(2, priceFeed); // Invoice (using same feed for demo)
    console.log("✅ Price feeds added for asset types.");

    // 8. Mint some demo NFTs
    console.log("\n🎨 Minting demo NFTs...");
    const demoURIs = [
        "https://ipfs.io/ipfs/QmDemo1",
        "https://ipfs.io/ipfs/QmDemo2",
        "https://ipfs.io/ipfs/QmDemo3"
    ];

    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();

    for (let i = 0; i < demoURIs.length; i++) {
        await propertyNFT.safeMint(
            signerAddress,
            i + 1,
            demoURIs[i]
        );
        console.log(`✅ Demo NFT ${i + 1} minted.`);
    }

    // 9. Set property values for demo NFTs
    console.log("\n💰 Setting demo property values...");
    const demoValues = [500000, 750000, 1000000]; // $500k, $750k, $1M

    for (let i = 0; i < demoValues.length; i++) {
        await collateralVault.setPropertyValueTest(i + 1, demoValues[i]);
        console.log(`✅ Property value set for NFT ${i + 1}: $${demoValues[i].toLocaleString()}`);
    }

    // 10. Print deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:");
    console.log(`PropertyNFT: ${propertyNFTAddress}`);
    console.log(`CollateralVault: ${collateralVaultAddress}`);
    console.log(`LenderNFT: ${lenderNFTAddress}`);
    console.log(`AIRiskManager: ${aiRiskManagerAddress}`);
    console.log(`PropertyOracle: ${propertyOracleAddress}`);
    console.log(`LoanManager: ${loanManagerAddress}`);

    console.log("\n🔗 Next Steps:");
    console.log("1. Update frontend/src/constants.ts with these addresses");
    console.log("2. Set up Chainlink Functions subscription");
    console.log("3. Configure AWS Bedrock integration");
    console.log("4. Test the complete workflow");

    console.log("\n" + "=".repeat(60));
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
}); 