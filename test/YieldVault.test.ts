import { expect } from "chai";
import { ethers } from "hardhat";

describe("YieldVault", function () {
    let vault: any;
    let owner: any;
    let router: any;
    let borrower: any;
    let lender: any;
    let usdc: any;
    let aave: any;
    let ccipRouter: any;
    let routerSigner: any;
    const loanId = 1;
    const principal = 1000;

    beforeEach(async function () {
        [owner, router, borrower, lender] = await ethers.getSigners();
        const USDCMock = await ethers.getContractFactory("MockERC20");
        usdc = await USDCMock.deploy("MockUSDC", "MUSDC");
        const AaveMock = await ethers.getContractFactory("MockAavePool");
        aave = await AaveMock.deploy(usdc.target);
        // Deploy a minimal router mock
        const RouterMock = await ethers.getContractFactory("MockRouter");
        ccipRouter = await RouterMock.deploy();
        // Fund the router contract address with ETH for gas
        await owner.sendTransaction({
            to: ccipRouter.target,
            value: ethers.parseEther("1.0")
        });
        // Use TestYieldVault for testing
        const TestYieldVault = await ethers.getContractFactory("TestYieldVault");
        vault = await TestYieldVault.deploy(ccipRouter.target, aave.target, usdc.target);
        // Impersonate the router contract address for testCcipReceive
        routerSigner = await ethers.getImpersonatedSigner(ccipRouter.target);
        // Set up USDC and Aave balances if needed
    });

    it("should deploy with correct router address", async function () {
        expect(await vault.getRouter()).to.equal(ccipRouter.target);
    });

    describe("_ccipReceive / _depositFunds", function () {
        it("should deposit funds and emit event when called by router", async function () {
            const encodedPayload = ethers.AbiCoder.defaultAbiCoder().encode([
                "uint256",
                "uint256",
                "address",
                "address"
            ], [loanId, principal, borrower.address, lender.address]);
            const msgStruct = {
                messageId: ethers.ZeroHash,
                sourceChainSelector: 0,
                sender: ethers.zeroPadValue(router.address, 32),
                data: encodedPayload,
                destTokenAmounts: []
            };
            await usdc.mint(vault.target, principal);
            await expect(
                vault.connect(routerSigner).testCcipReceive(msgStruct)
            ).to.emit(vault, "FundsDeposited").withArgs(loanId, principal, borrower.address);
            // Check yieldLoans mapping
            const loan = await vault.yieldLoans(loanId);
            expect(loan.loanId).to.equal(loanId);
            expect(loan.principal).to.equal(principal);
            expect(loan.borrower).to.equal(borrower.address);
            expect(loan.lender).to.equal(lender.address);
            expect(loan.principalClaimed).to.equal(false);
        });

        it("should revert if deposit for same loanId is attempted twice", async function () {
            const encodedPayload = ethers.AbiCoder.defaultAbiCoder().encode([
                "uint256",
                "uint256",
                "address",
                "address"
            ], [loanId, principal, borrower.address, lender.address]);
            const msgStruct = {
                messageId: ethers.ZeroHash,
                sourceChainSelector: 0,
                sender: ethers.zeroPadValue(router.address, 32),
                data: encodedPayload,
                destTokenAmounts: []
            };
            await usdc.mint(vault.target, principal);
            await vault.connect(routerSigner).testCcipReceive(msgStruct);
            await expect(
                vault.connect(routerSigner).testCcipReceive(msgStruct)
            ).to.be.revertedWithCustomError(vault, "YieldVault__InvalidLoanId");
        });
    });

    describe("claimPrincipal", function () {
        beforeEach(async function () {
            // Deposit funds for loanId
            const encodedPayload = ethers.AbiCoder.defaultAbiCoder().encode([
                "uint256",
                "uint256",
                "address",
                "address"
            ], [loanId, principal, borrower.address, lender.address]);
            const msgStruct = {
                messageId: ethers.ZeroHash,
                sourceChainSelector: 0,
                sender: ethers.zeroPadValue(router.address, 32),
                data: encodedPayload,
                destTokenAmounts: []
            };
            await usdc.mint(vault.target, principal);
            await vault.connect(routerSigner).testCcipReceive(msgStruct);
        });

        it("should allow only the borrower to claim principal", async function () {
            await expect(
                vault.connect(lender).claimPrincipal(loanId)
            ).to.be.revertedWithCustomError(vault, "YieldVault__NotAuthorized");
            await expect(
                vault.connect(borrower).claimPrincipal(loanId)
            ).to.emit(vault, "PrincipalClaimed").withArgs(loanId, principal);
            // principalClaimed should be true
            const loan = await vault.yieldLoans(loanId);
            expect(loan.principalClaimed).to.equal(true);
        });

        it("should revert if principal already claimed", async function () {
            await vault.connect(borrower).claimPrincipal(loanId);
            await expect(
                vault.connect(borrower).claimPrincipal(loanId)
            ).to.be.revertedWithCustomError(vault, "YieldVault__AlreadyClaimed");
        });

        it("should revert for invalid loanId", async function () {
            await expect(
                vault.connect(borrower).claimPrincipal(999)
            ).to.be.revertedWithCustomError(vault, "YieldVault__InvalidLoanId");
        });
    });

    describe("claimYield", function () {
        beforeEach(async function () {
            // Deposit funds for loanId
            const encodedPayload = ethers.AbiCoder.defaultAbiCoder().encode([
                "uint256",
                "uint256",
                "address",
                "address"
            ], [loanId, principal, borrower.address, lender.address]);
            const msgStruct = {
                messageId: ethers.ZeroHash,
                sourceChainSelector: 0,
                sender: ethers.zeroPadValue(router.address, 32),
                data: encodedPayload,
                destTokenAmounts: []
            };
            await usdc.mint(vault.target, principal);
            await vault.connect(routerSigner).testCcipReceive(msgStruct);
        });

        it("should allow only the owner to claim yield", async function () {
            // Borrower claims principal first
            await vault.connect(borrower).claimPrincipal(loanId);
            // Simulate Aave yield: mint principal + yield to vault, set balance in mock pool, and mint yield to mock pool
            await usdc.mint(vault.target, principal + 100);
            await aave.setBalance(vault.target, 100);
            await usdc.mint(aave.target, 100);
            await expect(
                vault.connect(borrower).claimYield(loanId)
            ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
            await expect(
                vault.connect(owner).claimYield(loanId)
            ).to.emit(vault, "YieldClaimed");
        });

        it("should revert for invalid loanId", async function () {
            await expect(
                vault.connect(owner).claimYield(999)
            ).to.be.revertedWithCustomError(vault, "YieldVault__InvalidLoanId");
        });

        it("should emit YieldClaimed and transfer yield to lender", async function () {
            // Borrower claims principal first
            await vault.connect(borrower).claimPrincipal(loanId);
            // Simulate Aave yield: mint principal + yield to vault, set balance in mock pool, and mint yield to mock pool
            await usdc.mint(vault.target, principal + 100);
            await aave.setBalance(vault.target, 100);
            await usdc.mint(aave.target, 100);
            const lenderBalanceBefore = await usdc.balanceOf(lender.address);
            await expect(
                vault.connect(owner).claimYield(loanId)
            ).to.emit(vault, "YieldClaimed").withArgs(loanId, lender.address, 100);
            const lenderBalanceAfter = await usdc.balanceOf(lender.address);
            expect(lenderBalanceAfter - lenderBalanceBefore).to.equal(100n);
        });
    });

    // Additional describe/it blocks for edge cases, yield zero, etc.
}); 