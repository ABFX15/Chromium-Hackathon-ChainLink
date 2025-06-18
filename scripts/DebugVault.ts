import { ethers } from "hardhat";

async function main() {
    const vaultAddress = "0x14CB1bFE6E8D65953D05EB3782b1424ff513f9E9";
    const expectedLoanManager = "0xDFCb7F89666a4B4E334C91E22fC96e9F311CC0D7";
    const [owner] = await ethers.getSigners();
    const vault = await ethers.getContractAt("CollateralVault", vaultAddress, owner);
    const loanManager = await vault.loanManager();
    console.log("CollateralVault.loanManager:", loanManager);
    console.log("Expected LoanManager:", expectedLoanManager);
    console.log("Match:", loanManager.toLowerCase() === expectedLoanManager.toLowerCase());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 