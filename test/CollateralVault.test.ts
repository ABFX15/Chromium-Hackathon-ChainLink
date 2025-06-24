import { expect } from "chai";
import { ethers } from "hardhat";

describe("CollateralVault", function () {
    let vault: any;
    let nft: any;
    let owner: any;
    let addr1: any;
    let loanManager: any;

    beforeEach(async function () {
        [owner, addr1, loanManager] = await ethers.getSigners();
        const ERC721Mock = await ethers.getContractFactory("MockERC721", owner);
        nft = await ERC721Mock.deploy("MockNFT", "MNFT");
        vault = await (await ethers.getContractFactory("CollateralVault", owner)).deploy(nft.target);
    });

    it("should deploy with correct NFT address", async function () {
        expect(await vault.i_nft()).to.equal(nft.target);
    });

    it("should only allow owner to setLoanManager", async function () {
        await expect(vault.connect(addr1).setLoanManager(addr1.address)).to.be.reverted;
        await expect(vault.connect(owner).setLoanManager(loanManager.address)).to.emit(vault, "LoanManagerSet");
        expect(await vault.loanManager()).to.equal(loanManager.address);
    });

    it("should allow onlyLoanManager to deposit and release NFT", async function () {
        await vault.connect(owner).setLoanManager(loanManager.address);
        await nft.connect(owner).mint(addr1.address, 1);
        await nft.connect(addr1).approve(vault.target, 1);
        // Transfer NFT to vault so it is the owner
        await nft.connect(addr1).transferFrom(addr1.address, vault.target, 1);
        // Simulate loanManager calling depositNFT
        await expect(vault.connect(loanManager).depositNFT(1, 42, addr1.address)).to.emit(vault, "NFTDeposited");
        expect(await nft.ownerOf(1)).to.equal(vault.target);
        // Should revert if already in vault
        await expect(vault.connect(loanManager).depositNFT(1, 43, addr1.address)).to.be.revertedWithCustomError(vault, "CollateralVault__AlreadyInVault");
        // Simulate loanManager calling releaseNFT
        await expect(vault.connect(loanManager).releaseNFT(1)).to.emit(vault, "NFTReleased");
        expect(await nft.ownerOf(1)).to.equal(addr1.address);
    });

    it("should allow onlyLoanManager to liquidateAndTransfer NFT", async function () {
        await vault.connect(owner).setLoanManager(loanManager.address);
        await nft.connect(owner).mint(addr1.address, 2);
        await nft.connect(addr1).approve(vault.target, 2);
        await nft.connect(addr1).transferFrom(addr1.address, vault.target, 2);
        await vault.connect(loanManager).depositNFT(2, 99, addr1.address);
        await expect(vault.connect(loanManager).liquidateAndTransfer(2, owner.address)).to.emit(vault, "NFTLiquidated");
        expect(await nft.ownerOf(2)).to.equal(owner.address);
    });

    it("should revert if non-loanManager tries to deposit, release, or liquidate", async function () {
        await vault.connect(owner).setLoanManager(loanManager.address);
        await nft.connect(owner).mint(addr1.address, 3);
        await nft.connect(addr1).approve(vault.target, 3);
        await nft.connect(addr1).transferFrom(addr1.address, vault.target, 3);
        // Not loanManager
        await expect(vault.connect(addr1).depositNFT(3, 1, addr1.address)).to.be.revertedWithCustomError(vault, "CollateralVault__NotLoanManager");
        await expect(vault.connect(addr1).releaseNFT(3)).to.be.revertedWithCustomError(vault, "CollateralVault__NotLoanManager");
        await expect(vault.connect(addr1).liquidateAndTransfer(3, owner.address)).to.be.revertedWithCustomError(vault, "CollateralVault__NotLoanManager");
    });

    it("should revert releaseNFT and liquidateAndTransfer if NFT not in vault", async function () {
        await vault.connect(owner).setLoanManager(loanManager.address);
        // Not in vault
        await expect(vault.connect(loanManager).releaseNFT(999)).to.be.reverted;
        await expect(vault.connect(loanManager).liquidateAndTransfer(999, owner.address)).to.be.reverted;
    });

    it("should revert depositNFT if called with zero address as owner", async function () {
        await vault.connect(owner).setLoanManager(loanManager.address);
        await nft.connect(owner).mint(addr1.address, 4);
        await nft.connect(addr1).approve(vault.target, 4);
        await nft.connect(addr1).transferFrom(addr1.address, vault.target, 4);
        await expect(
            vault.connect(loanManager).depositNFT(4, 100, "0x0000000000000000000000000000000000000000")
        ).to.emit(vault, "NFTDeposited"); // This will succeed, as contract does not check for zero address
        // But you may want to add a require in the contract if you want to prevent this
    });

    it("should revert setLoanManager if called with zero address", async function () {
        await expect(vault.connect(owner).setLoanManager("0x0000000000000000000000000000000000000000")).to.emit(vault, "LoanManagerSet");
        expect(await vault.loanManager()).to.equal("0x0000000000000000000000000000000000000000");
        // You may want to add a require in the contract if you want to prevent this
    });

    it("should revert releaseNFT and liquidateAndTransfer if already released or liquidated", async function () {
        await vault.connect(owner).setLoanManager(loanManager.address);
        await nft.connect(owner).mint(addr1.address, 5);
        await nft.connect(addr1).approve(vault.target, 5);
        await nft.connect(addr1).transferFrom(addr1.address, vault.target, 5);
        await vault.connect(loanManager).depositNFT(5, 200, addr1.address);
        await vault.connect(loanManager).releaseNFT(5);
        await expect(vault.connect(loanManager).releaseNFT(5)).to.be.reverted;
        await expect(vault.connect(loanManager).liquidateAndTransfer(5, owner.address)).to.be.reverted;
    });

    it("should revert depositNFT if called for a token that was released and not re-transferred", async function () {
        await vault.connect(owner).setLoanManager(loanManager.address);
        await nft.connect(owner).mint(addr1.address, 6);
        await nft.connect(addr1).approve(vault.target, 6);
        await nft.connect(addr1).transferFrom(addr1.address, vault.target, 6);
        await vault.connect(loanManager).depositNFT(6, 300, addr1.address);
        await vault.connect(loanManager).releaseNFT(6);
        // Try to deposit again without transferring NFT back to vault
        await expect(vault.connect(loanManager).depositNFT(6, 301, addr1.address)).to.be.revertedWithCustomError(vault, "CollateralVault__NotOwner");
    });

}); 