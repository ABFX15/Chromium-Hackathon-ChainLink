import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";

async function main() {
    // Use the already deployed CollateralVault address
    const collateralVaultAddress = "0xC30280b65A5C429AAb25594C62c0C0687c2CDDaD"; // <-- your deployed address
    const functionsRouter = "0x6eed6a1c74bb1ea4e6cc7e0201c7ba8db6bdaba0"; // Sepolia Functions router (all lowercase)
    const linkToken = "0x779877A7B0D9E8603169DdbD7836e478b4624789"; // Sepolia LINK

    const PropertyOracle = await ethers.getContractFactory("PropertyOracle");
    const propertyOracle = await PropertyOracle.deploy(
        functionsRouter,
        linkToken,
        collateralVaultAddress
    );
    await propertyOracle.waitForDeployment();
    console.log("PropertyOracle deployed to:", await propertyOracle.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 