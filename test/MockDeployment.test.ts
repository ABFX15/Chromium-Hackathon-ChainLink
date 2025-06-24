import { ethers } from "hardhat";

describe("Mock contract deployment sanity check", function () {
    it("deploys MockERC721 and MockERC20 and logs their addresses", async function () {
        const ERC721Mock = await ethers.getContractFactory("MockERC721");
        const nft = await ERC721Mock.deploy("MockNFT", "MNFT");
        console.log("MockERC721 address:", nft.target);

        const ERC20Mock = await ethers.getContractFactory("MockERC20");
        const usdc = await ERC20Mock.deploy("MockUSDC", "MUSDC");
        console.log("MockERC20 address:", usdc.target);

        // Add a simple assertion
        if (!nft.target || !usdc.target) {
            throw new Error("Deployment failed: address is undefined");
        }
    });
});