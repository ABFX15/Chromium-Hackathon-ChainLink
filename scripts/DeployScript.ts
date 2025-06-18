import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-toolbox-viem";
import { ethers } from "hardhat";

async function main() {
    const PropertyNFT = await ethers.getContractFactory("MyToken");
    const propertyNFT = await PropertyNFT.deploy();
    await propertyNFT.waitForDeployment();
    console.log("PropertyNFT deployed to:", await propertyNFT.getAddress());

    const CollateralVault = await ethers.getContractFactory("CollateralVault");
    const collateralVault = await CollateralVault.deploy(await propertyNFT.getAddress());
    await collateralVault.waitForDeployment();
    console.log("CollateralVault deployed to:", await collateralVault.getAddress());


    const ccipRouter = "0xD0daae2231E9CB96b94C8512223533293C3693Bf";
    const usdc = "0x4d06f916930877A66530913AF69c3890c431D892"; // Mock USDC on Sepolia
    const LoanManager = await ethers.getContractFactory("LoanManager");
    const loanManager = await LoanManager.deploy(
        await propertyNFT.getAddress(),
        await collateralVault.getAddress(),
        ccipRouter,
        usdc
    );
    await loanManager.waitForDeployment();
    console.log("LoanManager deployed to:", await loanManager.getAddress());


    const functionsRouter = "0x6eed6a1c74bb1ea4e6cc7e0201c7ba8db6bdaba0";
    const PropertyOracle = await ethers.getContractFactory("PropertyOracle");
    const propertyOracle = await PropertyOracle.deploy(
        functionsRouter,
        await collateralVault.getAddress()
    );
    await propertyOracle.waitForDeployment();
    console.log("PropertyOracle deployed to:", await propertyOracle.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});