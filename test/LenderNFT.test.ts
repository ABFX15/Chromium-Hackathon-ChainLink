import { expect } from "chai";
import { ethers } from "hardhat";

describe("LenderNFT", function () {
    let lenderNFT: any;
    let owner: any;
    let addr1: any;
    let loanManager: any;

    beforeEach(async function () {
        [owner, addr1, loanManager] = await ethers.getSigners();
        const LenderNFT = await ethers.getContractFactory("LenderNFT");
        lenderNFT = await LenderNFT.deploy();
    });

    it("should deploy with correct name and symbol", async function () {
        expect(await lenderNFT.name()).to.equal("RWA Lender Position");
        expect(await lenderNFT.symbol()).to.equal("RWALEND");
    });

    describe("setLoanManager", function () {
        it("should allow owner to set loan manager", async function () {
            await lenderNFT.connect(owner).setLoanManager(loanManager.address);
            expect(await lenderNFT.loanManager()).to.equal(loanManager.address);
        });
        it("should not allow non-owner to set loan manager", async function () {
            await expect(lenderNFT.connect(addr1).setLoanManager(loanManager.address)).to.be.revertedWithCustomError(lenderNFT, "OwnableUnauthorizedAccount");
        });
        it("should revert if setting loan manager to zero address", async function () {
            await expect(lenderNFT.connect(owner).setLoanManager(ethers.ZeroAddress)).to.be.revertedWithCustomError(lenderNFT, "LenderNFT__InvalidLoanManager");
        });
    });

    describe("mintLenderPosition", function () {
        beforeEach(async function () {
            await lenderNFT.connect(owner).setLoanManager(loanManager.address);
        });
        it("should only allow loan manager to mint", async function () {
            await expect(lenderNFT.connect(addr1).mintLenderPosition(addr1.address, 1, 1000)).to.be.revertedWithCustomError(lenderNFT, "LenderNFT__NotAuthorized");
        });
        it("should mint NFT, set mappings, and emit event", async function () {
            await expect(lenderNFT.connect(loanManager).mintLenderPosition(addr1.address, 42, 1000))
                .to.emit(lenderNFT, "LenderPositionMinted")
                .withArgs(1, 42, addr1.address, 1000);
            const tokenId = await lenderNFT.loanIdToToken(42);
            expect(await lenderNFT.ownerOf(tokenId)).to.equal(addr1.address);
            expect(await lenderNFT.tokenIdToLoan(tokenId)).to.equal(42);
            expect(await lenderNFT.lenderPositions(tokenId)).to.equal(1000);
        });
        it("should increment tokenId for each mint", async function () {
            await lenderNFT.connect(loanManager).mintLenderPosition(addr1.address, 1, 1000);
            await lenderNFT.connect(loanManager).mintLenderPosition(addr1.address, 2, 2000);
            expect(await lenderNFT.loanIdToToken(2)).to.equal(2);
        });
    });

    describe("burnLenderPosition", function () {
        beforeEach(async function () {
            await lenderNFT.connect(owner).setLoanManager(loanManager.address);
            await lenderNFT.connect(loanManager).mintLenderPosition(addr1.address, 1, 1000);
        });
        it("should only allow loan manager to burn", async function () {
            await expect(lenderNFT.connect(addr1).burnLenderPosition(1)).to.be.revertedWithCustomError(lenderNFT, "LenderNFT__NotAuthorized");
        });
        it("should burn NFT, clean up mappings, and emit event", async function () {
            await expect(lenderNFT.connect(loanManager).burnLenderPosition(1))
                .to.emit(lenderNFT, "LenderPositionBurned")
                .withArgs(1, 1);
            await expect(lenderNFT.ownerOf(1)).to.be.revertedWithCustomError(lenderNFT, "ERC721NonexistentToken");
            expect(await lenderNFT.tokenIdToLoan(1)).to.equal(0);
            expect(await lenderNFT.lenderPositions(1)).to.equal(0);
        });
        it("should revert if token does not exist", async function () {
            await lenderNFT.connect(loanManager).burnLenderPosition(1);
            await expect(lenderNFT.connect(loanManager).burnLenderPosition(1)).to.be.revertedWithCustomError(lenderNFT, "LenderNFT__TokenNotExists");
        });
    });

    describe("getLenderPosition", function () {
        beforeEach(async function () {
            await lenderNFT.connect(owner).setLoanManager(loanManager.address);
            await lenderNFT.connect(loanManager).mintLenderPosition(addr1.address, 1, 1000);
        });
        it("should return correct loanId and amount for valid tokenId", async function () {
            const [loanId, amount] = await lenderNFT.getLenderPosition(1);
            expect(loanId).to.equal(1);
            expect(amount).to.equal(1000);
        });
        it("should revert if token does not exist", async function () {
            await lenderNFT.connect(loanManager).burnLenderPosition(1);
            await expect(lenderNFT.getLenderPosition(1)).to.be.revertedWithCustomError(lenderNFT, "LenderNFT__TokenNotExists");
        });
    });

    describe("tokenURI", function () {
        beforeEach(async function () {
            await lenderNFT.connect(owner).setLoanManager(loanManager.address);
            await lenderNFT.connect(loanManager).mintLenderPosition(addr1.address, 1, 1000);
        });
        it("should return a string for valid tokenId", async function () {
            const uri = await lenderNFT.tokenURI(1);
            expect(uri).to.be.a("string");
            expect(uri.length).to.be.greaterThan(0);
        });
        it("should revert if token does not exist", async function () {
            await lenderNFT.connect(loanManager).burnLenderPosition(1);
            await expect(lenderNFT.tokenURI(1)).to.be.revertedWithCustomError(lenderNFT, "LenderNFT__TokenNotExists");
        });
    });

    // Additional describe/it blocks for edge cases, etc.
}); 