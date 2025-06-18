import { ethers } from "hardhat";

async function main() {
    // 1,000,000 tokens with 6 decimals
    const initialSupply = ethers.parseUnits("1000000", 6);
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy(initialSupply);
    await mockUSDC.waitForDeployment();
    console.log("MockUSDC deployed to:", await mockUSDC.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 