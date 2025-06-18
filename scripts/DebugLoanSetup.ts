import { ethers } from "hardhat";

async function main() {
    const nftAddress = "0x4E67Cb78CFAE488CA81290Bf3184453D4EF0d3a8";
    const vaultAddress = "0x14CB1bFE6E8D65953D05EB3782b1424ff513f9E9";
    const loanManagerAddress = "0xDFCb7F89666a4B4E334C91E22fC96e9F311CC0D7";
    const tokenId = 2;
    const [owner] = await ethers.getSigners();
    const nft = await ethers.getContractAt("PropertyNFT", nftAddress, owner);
    const vault = await ethers.getContractAt("CollateralVault", vaultAddress, owner);

    // 1. NFT owner and approval
    const nftOwner = await nft.ownerOf(tokenId);
    const approved = await nft.getApproved(tokenId);
    const isApprovedForAll = await nft.isApprovedForAll(owner.address, loanManagerAddress);
    console.log(`NFT tokenId ${tokenId} owner:`, nftOwner);
    console.log(`NFT tokenId ${tokenId} approved for:`, approved);
    console.log(`Is LoanManager approved for all:`, isApprovedForAll);

    // 2. Property value in CollateralVault
    const propertyValue = await vault.propertyValues(tokenId);
    console.log(`Property value for tokenId ${tokenId}:`, propertyValue.toString());

    // 3. Is tokenId already collateral for an active loan?
    const active = await vault.activeLoans(tokenId);
    console.log(`Is tokenId ${tokenId} active collateral:`, active);
}

main().catch(console.error); 