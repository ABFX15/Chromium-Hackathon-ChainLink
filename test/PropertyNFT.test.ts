import { expect } from "chai";
import { ethers } from "hardhat";
import { PropertyNFT } from "../typechain-types";
import { Signer } from "ethers";

describe("PropertyNFT", function () {
    let propertyNFT: any;
    let owner: Signer;
    let addr1: Signer;
    let baseURI: string;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        baseURI = "https://example.com/metadata/";
        const PropertyNFTFactory = await ethers.getContractFactory("PropertyNFT");
        propertyNFT = (await PropertyNFTFactory.deploy("PropertyNFT", "PROP", baseURI)) as PropertyNFT;
    });

    it("should deploy with correct name and symbol", async function () {
        expect(await propertyNFT.name()).to.equal("PropertyNFT");
        expect(await propertyNFT.symbol()).to.equal("PROP");
    });

    it("should only allow owner to mint", async function () {
        const tokenURI = "https://example.com/metadata/1.json";
        await expect(propertyNFT.connect(addr1).safeMint(await addr1.getAddress(), tokenURI)).to.be.revertedWithCustomError(propertyNFT, "OwnableUnauthorizedAccount");
        await expect(propertyNFT.connect(owner).safeMint(await addr1.getAddress(), tokenURI)).to.emit(propertyNFT, "Transfer");
    });

    it("should revert if minting to zero address", async function () {
        const tokenURI = "https://example.com/metadata/1.json";
        await expect(propertyNFT.connect(owner).safeMint("0x0000000000000000000000000000000000000000", tokenURI)).to.be.revertedWithCustomError(propertyNFT, "InvalidRecipient");
    });

    it("should revert if minting with empty URI", async function () {
        await expect(propertyNFT.connect(owner).safeMint(await addr1.getAddress(), "")).to.be.revertedWithCustomError(propertyNFT, "InvalidTokenURI");
    });

    it("should return correct tokenURI after minting", async function () {
        const tokenURI = "https://example.com/metadata/1.json";
        await propertyNFT.connect(owner).safeMint(await addr1.getAddress(), tokenURI);
        expect(await propertyNFT.tokenURI(1)).to.equal(tokenURI);
    });

    it("should revert tokenURI for nonexistent token", async function () {
        await expect(propertyNFT.tokenURI(999)).to.be.revertedWithCustomError(propertyNFT, "NonexistentToken");
    });
}); 