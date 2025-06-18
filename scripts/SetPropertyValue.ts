import { ethers } from "hardhat";

async function main() {
    const collateralVaultAddress = "0x14CB1bFE6E8D65953D05EB3782b1424ff513f9E9";
    const tokenId = 2;
    const value = ethers.parseUnits("1000000", 6); // Example: 1,000,000 (USDC 6 decimals)
    const [owner] = await ethers.getSigners();
    console.log("Using owner address:", owner.address);
    const vault = await ethers.getContractAt("CollateralVault", collateralVaultAddress, owner);
    console.log(`Setting property value for tokenId ${tokenId} to ${value.toString()}...`);
    const tx = await vault.setPropertyValueTest(tokenId, value);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("Property value set!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 