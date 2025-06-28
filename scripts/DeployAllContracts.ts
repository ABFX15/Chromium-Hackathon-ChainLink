import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-toolbox-viem";
import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting deployment of Private Credit Vault contracts...\n");

    const [owner] = await ethers.getSigners();

    // 1. Deploy MockUSDC
    console.log("\n📦 Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const initialSupply = ethers.parseUnits("1000000", 6); // 1,000,000 USDC
    const mockUSDC = await MockUSDC.deploy(initialSupply);
    await mockUSDC.waitForDeployment();
    const usdc = await mockUSDC.getAddress();
    console.log("✅ MockUSDC deployed to:", usdc);

    // 2. Deploy PropertyNFT
    console.log("📦 Deploying PropertyNFT...");
    const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
    const propertyNFT = await PropertyNFT.deploy(
        "Real World Asset NFT",
        "RWA-NFT",
        "https://api.oraclend.com/nfts/"
    );
    await propertyNFT.waitForDeployment();
    const propertyNFTAddress = await propertyNFT.getAddress();
    console.log("✅ PropertyNFT deployed to:", propertyNFTAddress);

    // 3. Deploy CollateralVault
    console.log("\n📦 Deploying CollateralVault...");
    const CollateralVault = await ethers.getContractFactory("CollateralVault");
    const collateralVault = await CollateralVault.deploy(propertyNFTAddress, owner.address);
    await collateralVault.waitForDeployment();
    const collateralVaultAddress = await collateralVault.getAddress();
    console.log("✅ CollateralVault deployed to:", collateralVaultAddress);

    // 4. Deploy LenderNFT
    console.log("\n📦 Deploying LenderNFT...");
    const LenderNFT = await ethers.getContractFactory("LenderNFT");
    const lenderNFT = await LenderNFT.deploy();
    await lenderNFT.waitForDeployment();
    const lenderNFTAddress = await lenderNFT.getAddress();
    console.log("✅ LenderNFT deployed to:", lenderNFTAddress);

    // 5. Deploy PropertyOracle
    console.log("\n📦 Deploying PropertyOracle...");
    const PropertyOracle = await ethers.getContractFactory("PropertyOracle");
    const propertyOracle = await PropertyOracle.deploy(propertyNFTAddress);
    await propertyOracle.waitForDeployment();
    const propertyOracleAddress = await propertyOracle.getAddress();
    console.log("✅ PropertyOracle deployed to:", propertyOracleAddress);

    // 6. Deploy LoanManager
    console.log("\n📦 Deploying LoanManager...");
    const ccipRouter = "0xD0daae2231E9CB96b94C8512223533293C3693Bf"; // Sepolia CCIP Router
    const destinationChainSelector = 12532609583862916517n; // Avalanche Fuji testnet

    // Debug: Print all addresses before LoanManager deployment
    console.log("\n🔎 LoanManager constructor arguments:");
    console.log("NFT:", propertyNFTAddress);
    console.log("CollateralVault:", collateralVaultAddress);
    console.log("LenderNFT:", lenderNFTAddress);
    console.log("CCIP Router:", ccipRouter);
    console.log("DestinationChainSelector:", destinationChainSelector);

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

    // Deploy MockAavePool
    console.log("\n📦 Deploying MockAavePool...");
    const MockAavePool = await ethers.getContractFactory("MockAavePool");
    const mockAavePool = await MockAavePool.deploy(usdc);
    await mockAavePool.waitForDeployment();
    const mockAavePoolAddress = await mockAavePool.getAddress();
    console.log("✅ MockAavePool deployed to:", mockAavePoolAddress);

    // Deploy MockERC20 as aUSDC
    console.log("\n📦 Deploying MockERC20 as aUSDC...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const aUSDC = await MockERC20.deploy("Aave USDC", "aUSDC");
    await aUSDC.waitForDeployment();
    const aUSDCAddress = await aUSDC.getAddress();
    console.log("✅ aUSDC deployed to:", aUSDCAddress);

    // 7. Deploy YieldVault (for destination chain simulation)
    console.log("\n📦 Deploying YieldVault (for Avalanche Fuji)...");
    const YieldVault = await ethers.getContractFactory("YieldVault");
    const yieldVault = await YieldVault.deploy(
        ccipRouter,
        mockAavePoolAddress,
        usdc,
        aUSDCAddress
    );
    await yieldVault.waitForDeployment();
    const yieldVaultAddress = await yieldVault.getAddress();
    console.log("✅ YieldVault deployed to:", yieldVaultAddress);

    // 8. Deploy InsurancePool
    console.log("\n📦 Deploying InsurancePool...");
    const InsurancePool = await ethers.getContractFactory("InsurancePool");
    const insurancePool = await InsurancePool.deploy(usdc);
    await insurancePool.waitForDeployment();
    const insurancePoolAddress = await insurancePool.getAddress();
    console.log("✅ InsurancePool deployed to:", insurancePoolAddress);

    // 9. Configure contracts
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

    // Set YieldVault in LoanManager
    await loanManager.setYieldVault(yieldVaultAddress);
    console.log("✅ LoanManager yieldVault set.");

    // 10. Mint some demo NFTs
    console.log("\n🎨 Minting demo NFTs...");
    const demoURIs = [
        "https://ipfs.io/ipfs/QmDemo1",
        "https://ipfs.io/ipfs/QmDemo2",
        "https://ipfs.io/ipfs/QmDemo3"
    ];

    // Get PropertyNFT owner
    const propertyNFTOwner = await propertyNFT.owner();
    const propertyNFTOwnerSigner = await ethers.getSigner(propertyNFTOwner);
    const propertyNFTWithOwner = propertyNFT.connect(propertyNFTOwnerSigner);
    const signerAddress = await propertyNFTOwnerSigner.getAddress();

    for (let i = 0; i < demoURIs.length; i++) {
        try {
            await propertyNFTWithOwner.safeMint(
                signerAddress,
                demoURIs[i]
            );
            console.log(`✅ Demo NFT ${i + 1} minted: ${demoURIs[i]}`);
        } catch (error) {
            console.error(`❌ Failed to mint NFT ${i + 1} (${demoURIs[i]}):`, error);
        }
    }

    // 11. Set property values for demo NFTs
    console.log("\n💰 Setting demo property values...");
    const demoValues = [500000, 750000, 1000000]; // $500k, $750k, $1M

    for (let i = 0; i < demoValues.length; i++) {
        await propertyOracle.setPropertyValue(i + 1, demoValues[i]);
        console.log(`✅ Property value set for NFT ${i + 1}: $${demoValues[i].toLocaleString()}`);
    }

    // 12. Print deployment summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(60));
    console.log("\n📋 Contract Addresses:");
    console.log(`PropertyNFT: ${propertyNFTAddress}`);
    console.log(`CollateralVault: ${collateralVaultAddress}`);
    console.log(`LenderNFT: ${lenderNFTAddress}`);
    console.log(`PropertyOracle: ${propertyOracleAddress}`);
    console.log(`LoanManager: ${loanManagerAddress}`);
    console.log(`YieldVault (Avalanche Fuji): ${yieldVaultAddress}`);
    console.log(`InsurancePool: ${insurancePoolAddress}`);
    console.log(`MockAavePool: ${mockAavePoolAddress}`);
    console.log(`aUSDC: ${aUSDCAddress}`);

    console.log("\n🔗 Next Steps:");
    console.log("1. Update frontend/src/lib/contracts.ts with these addresses");
    console.log("2. Test the complete workflow");

    console.log("\n" + "=".repeat(60));
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
}); 