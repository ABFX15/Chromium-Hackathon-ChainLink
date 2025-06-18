import { ethers } from "hardhat";

async function main() {
    // Use the latest deployed PropertyNFT address
    const nftAddress = "0x4E67Cb78CFAE488CA81290Bf3184453D4EF0d3a8";
    const [owner] = await ethers.getSigners();
    console.log("Using owner address:", owner.address);
    const nft = await ethers.getContractAt("PropertyNFT", nftAddress, owner);
    console.log("Minting NFT with tokenId 2...");
    const tx = await nft.safeMint(owner.address, 2, "https://example.com/metadata/2.json");
    await tx.wait();
    console.log("NFT with tokenId 2 minted!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});