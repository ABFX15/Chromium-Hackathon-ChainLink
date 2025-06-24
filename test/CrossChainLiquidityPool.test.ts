import { expect } from "chai";
import { ethers } from "hardhat";

describe("CrossChainLiquidityPool", function () {
    let pool: any;
    let owner: any;
    let addr1: any;
    let usdc: any;
    let router: any;
    const chainSelector = 1234;
    const vault = "0x000000000000000000000000000000000000dEaD";

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();
        const USDCMock = await ethers.getContractFactory("MockERC20");
        usdc = await USDCMock.deploy("MockUSDC", "MUSDC");
        const RouterMock = await ethers.getContractFactory("MockRouter");
        router = await RouterMock.deploy();
        const Pool = await ethers.getContractFactory("CrossChainLiquidityPool");
        pool = await Pool.deploy(router.target, usdc.target);
    });

    it("should deploy with correct addresses", async function () {
        expect(await pool.i_ccipRouter()).to.equal(router.target);
        expect(await pool.i_usdc()).to.equal(usdc.target);
    });

    describe("addSupportedChain", function () {
        it("should allow owner to add a supported chain", async function () {
            await expect(pool.connect(owner).addSupportedChain(chainSelector, vault))
                .to.emit(pool, "ChainAdded")
                .withArgs(chainSelector, vault);
            const info = await pool.chainVaults(chainSelector);
            expect(info).to.equal(vault);
        });
        it("should not allow non-owner to add a chain", async function () {
            await expect(pool.connect(addr1).addSupportedChain(chainSelector, vault)).to.be.revertedWithCustomError(pool, "OwnableUnauthorizedAccount");
        });
        it("should revert if chainSelector is 0", async function () {
            await expect(pool.connect(owner).addSupportedChain(0, vault)).to.be.revertedWithCustomError(pool, "CrossChainLiquidityPool__InvalidChain");
        });
        it("should revert if vault is zero address", async function () {
            await expect(pool.connect(owner).addSupportedChain(chainSelector, ethers.ZeroAddress)).to.be.revertedWithCustomError(pool, "CrossChainLiquidityPool__InvalidVault");
        });
    });

    describe("addLiquidity", function () {
        beforeEach(async function () {
            await pool.connect(owner).addSupportedChain(chainSelector, vault);
            await usdc.connect(owner).mint(addr1.address, 1000);
        });
        it("should revert if chain is not supported", async function () {
            await expect(pool.connect(addr1).addLiquidity(9999, { value: 100 })).to.be.revertedWithCustomError(pool, "CrossChainLiquidityPool__ChainNotSupported");
        });
        it("should revert if msg.value is zero", async function () {
            await expect(pool.connect(addr1).addLiquidity(chainSelector, { value: 0 })).to.be.revertedWithCustomError(pool, "CrossChainLiquidityPool__InvalidAmount");
        });
        it("should transfer USDC from user and emit LiquidityAdded", async function () {
            await usdc.connect(addr1).approve(pool.target, 500);
            await expect(pool.connect(addr1).addLiquidity(chainSelector, { value: 500 }))
                .to.emit(pool, "LiquidityAdded");
            expect(await usdc.balanceOf(pool.target)).to.equal(500);
        });
    });

    describe("withdrawLiquidity", function () {
        beforeEach(async function () {
            await pool.connect(owner).addSupportedChain(chainSelector, vault);
            await usdc.connect(owner).mint(addr1.address, 1000);
            await usdc.connect(addr1).approve(pool.target, 500);
            await pool.connect(addr1).addLiquidity(chainSelector, { value: 500 });
        });
        it("should revert if lender position is insufficient", async function () {
            await expect(pool.connect(addr1).withdrawLiquidity(chainSelector, 1001)).to.be.revertedWithCustomError(pool, "CrossChainLiquidityPool__InsufficientBalance");
        });
        it("should revert if pool liquidity is insufficient", async function () {
            // Withdraw all first
            await pool.connect(addr1).withdrawLiquidity(chainSelector, 500);
            // Try to withdraw again
            await expect(pool.connect(addr1).withdrawLiquidity(chainSelector, 1)).to.be.revertedWithCustomError(pool, "CrossChainLiquidityPool__InsufficientBalance");
        });
        it("should transfer USDC back to lender and emit LiquidityWithdrawn", async function () {
            await expect(pool.connect(addr1).withdrawLiquidity(chainSelector, 200))
                .to.emit(pool, "LiquidityWithdrawn");
            expect(await usdc.balanceOf(addr1.address)).to.be.above(0);
        });
    });

    // Additional describe/it blocks for edge cases, utilization, multi-lender, etc.
}); 