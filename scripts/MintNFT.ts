import { ethers } from "hardhat";

async function main() {
    // Use the latest deployed PropertyNFT address
    const nftAddress = "0x32FB31A9d36b5acAFfb03C978c1F7E194c577AF7";
    const [owner] = await ethers.getSigners();
    console.log("Using owner address:", owner.address);
    const nft = await ethers.getContractAt("MyToken", nftAddress, owner);
    const tx = await nft.safeMint(owner.address, 3, "https://example.com/metadata/3.json");
    await tx.wait();
    console.log("NFT minted!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});