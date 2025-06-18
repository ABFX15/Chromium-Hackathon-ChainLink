import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";

async function main() {
    // Use the already deployed CollateralVault address
    const collateralVaultAddress = "0xF4e50eAF410930032c18b69A7B563C3937070286"; // <-- your deployed address
    const functionsRouter = "0x6eed6a1c74bb1ea4e6cc7e0201c7ba8db6bdaba0"; // Sepolia Functions router (all lowercase)

    const PropertyOracle = await ethers.getContractFactory("PropertyOracle");
    const propertyOracle = await PropertyOracle.deploy(
        functionsRouter,
        collateralVaultAddress
    );
    await propertyOracle.waitForDeployment();
    console.log("PropertyOracle deployed to:", await propertyOracle.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 