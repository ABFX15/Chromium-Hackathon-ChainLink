import { ethers } from "hardhat";

async function main() {
    const collateralVaultAddress = "0xC30280b65A5C429AAb25594C62c0C0687c2CDDaD";
    const propertyOracleAddress = "0x681E8Ca5D2E520e867Fe6f9AEC7D946EfcFed6bE";
    const [owner] = await ethers.getSigners();
    const vault = await ethers.getContractAt("CollateralVault", collateralVaultAddress, owner);
    const tx = await vault.setOracle(propertyOracleAddress);
    await tx.wait();
    console.log("Oracle set to:", propertyOracleAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 