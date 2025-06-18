import { ethers } from "hardhat";

async function main() {
    const usdcAddress = "0x741f7929daa14476ee7c987b4C17a48AFC9dA35A";
    const [owner] = await ethers.getSigners();
    const usdc = await ethers.getContractAt("MockUSDC", usdcAddress, owner);
    const amount = ethers.parseUnits("1000000", 6); // Mint 1,000,000 USDC
    console.log("Minting USDC to:", owner.address);
    const tx = await usdc.mint(owner.address, amount);
    console.log("Mint tx hash:", tx.hash);
    await tx.wait();
    const balance = await usdc.balanceOf(owner.address);
    console.log("New USDC balance:", balance.toString());
}

main().catch(console.error); 