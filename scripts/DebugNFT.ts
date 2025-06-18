import { ethers } from "hardhat";

async function main() {
    const nftAddress = "0x4E67Cb78CFAE488CA81290Bf3184453D4EF0d3a8";
    const loanManagerAddress = "0xDFCb7F89666a4B4E334C91E22fC96e9F311CC0D7";
    const tokenId = 2;
    const [owner] = await ethers.getSigners();
    const nft = await ethers.getContractAt("PropertyNFT", nftAddress, owner);
    const nftOwner = await nft.ownerOf(tokenId);
    const approved = await nft.getApproved(tokenId);
    const isApprovedForAll = await nft.isApprovedForAll(owner.address, loanManagerAddress);
    console.log(`NFT tokenId ${tokenId} owner:`, nftOwner);
    console.log(`NFT tokenId ${tokenId} approved for:`, approved);
    console.log(`Is LoanManager approved for all:`, isApprovedForAll);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 