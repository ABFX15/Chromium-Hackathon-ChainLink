import { ethers } from "hardhat";

async function main() {
    const collateralVaultAddress = "0xf037094Ac1380Ec6359d87aaEb244322c7502175";
    const propertyOracleAddress = "0x5c82BBDD0828E4D4b4546ACD870921b79445Aa26";
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