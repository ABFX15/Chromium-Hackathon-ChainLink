import { ethers } from "hardhat";
import { expect } from "chai";

describe("InsurancePool", function () {
    let usdc: any;
    let insurancePool: any;
    let owner: any, lender: any, other: any;

    beforeEach(async function () {
        [owner, lender, other] = await ethers.getSigners();
        // Deploy MockUSDC
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        usdc = await MockUSDC.deploy(ethers.parseUnits("1000000", 6));
        await usdc.waitForDeployment();
        // Deploy InsurancePool
        const InsurancePool = await ethers.getContractFactory("InsurancePool");
        insurancePool = await InsurancePool.deploy(await usdc.getAddress());
        await insurancePool.waitForDeployment();
        // Fund lender with USDC
        await usdc.mint(lender.address, ethers.parseUnits("1000", 6));
    });

    it("allows lender to buy insurance and receive payout on default", async function () {
        // Lender approves and buys insurance
        const principal = ethers.parseUnits("1000", 6);
        await usdc.connect(lender).approve(insurancePool.getAddress(), principal);
        await insurancePool.connect(lender).buyInsurance(1, principal);
        // Pool should have received premium
        const premium = principal * 100n / 10000n;
        expect(await usdc.balanceOf(insurancePool.getAddress())).to.equal(premium);
        // Fund pool for payout
        await usdc.mint(insurancePool.getAddress(), principal);
        // Owner processes default
        await insurancePool.connect(owner).processDefault(1, principal);
        // Lender should receive payout
        const payout = principal * 9000n / 10000n;
        expect(await usdc.balanceOf(lender.address)).to.equal(payout);
        // Policy should be marked as claimed
        const policy = await insurancePool.policies(1);
        expect(policy.claimed).to.be.true;
    });

    it("prevents double insurance and double claims", async function () {
        const principal = ethers.parseUnits("1000", 6);
        await usdc.connect(lender).approve(insurancePool.getAddress(), principal);
        await insurancePool.connect(lender).buyInsurance(2, principal);
        await expect(
            insurancePool.connect(lender).buyInsurance(2, principal)
        ).to.be.revertedWithCustomError(insurancePool, "InsurancePool__AlreadyInsured");
        await usdc.mint(insurancePool.getAddress(), principal);
        await insurancePool.connect(owner).processDefault(2, principal);
        await expect(
            insurancePool.connect(owner).processDefault(2, principal)
        ).to.be.revertedWithCustomError(insurancePool, "InsurancePool__NoActivePolicy");
    });
}); 