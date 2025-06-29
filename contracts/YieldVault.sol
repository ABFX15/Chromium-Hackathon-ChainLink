// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPool.sol";
import "./interfaces/ICrossChainReceiver.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

/**
 * @title YieldVault
 * @author ABFX15
 * @notice Manages yield generation for loaned funds by depositing USDC into Aave and distributing yield to lenders.
 * @dev Receives cross-chain loan funding via CCIP, supplies USDC to Aave, allows borrowers to claim principal, and lenders to claim yield.
 *      Each loan is tracked by loanId. Only the contract owner can claim yield. Borrowers claim principal. Integrates with Aave and Chainlink CCIP.
 */
contract YieldVault is ICrossChainReceiver, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IPool private immutable AAVE_POOL;
    IERC20 private immutable USDC;
    IERC20 private immutable aUSDC; // Add aUSDC token directly

    // Custom Errors
    error YieldVault__NotAuthorized();
    error YieldVault__InvalidLoanId();
    error YieldVault__AlreadyClaimed();
    error YieldVault__PrincipalNotClaimed();
    error YieldVault__NoYieldAvailable();

    struct YieldLoan {
        uint256 loanId;
        uint256 principal;
        address borrower;
        address lender;
        bool principalClaimed;
        uint256 initialATokenBalance; // Track aTokens at deposit
    }

    mapping(uint256 => YieldLoan) public yieldLoans;

    // Events
    event FundsDeposited(
        uint256 indexed loanId,
        uint256 amount,
        address indexed borrower
    );
    event PrincipalClaimed(uint256 indexed loanId, uint256 amount);
    event YieldClaimed(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount
    );

    /**
     * @notice Deploys the YieldVault contract.
     * @param router The Chainlink CCIP router address for cross-chain messages.
     * @param aavePool The Aave pool contract address.
     * @param usdc The USDC token address.
     * @param _aUSDC The aUSDC (Aave interest-bearing USDC) token address.
     */
    constructor(
        address router,
        address aavePool,
        address usdc,
        address _aUSDC
    ) ICrossChainReceiver(router) Ownable(msg.sender) {
        require(
            aavePool != address(0) &&
                usdc != address(0) &&
                _aUSDC != address(0),
            "Invalid address"
        );
        AAVE_POOL = IPool(aavePool);
        USDC = IERC20(usdc);
        aUSDC = IERC20(_aUSDC);
    }

    /**
     * @notice Handles incoming cross-chain messages to deposit loan funds.
     * @dev Decodes message data and calls _depositFunds. Only callable by the router.
     * @param message The cross-chain message containing loanId, amount, borrower, and lender.
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override onlyRouter {
        (uint256 loanId, uint256 amount, address borrower, address lender) = abi
            .decode(message.data, (uint256, uint256, address, address));
        _depositFunds(loanId, amount, borrower, lender);
    }

    function _depositFunds(
        uint256 loanId,
        uint256 amount,
        address borrower,
        address lender
    ) private nonReentrant {
        if (yieldLoans[loanId].loanId != 0) revert YieldVault__InvalidLoanId();

        // Get current aToken balance before deposit
        uint256 balanceBefore = aUSDC.balanceOf(address(this));

        // Approve and supply to Aave
        USDC.forceApprove(address(AAVE_POOL), amount);
        AAVE_POOL.supply(address(USDC), amount, address(this), 0);

        // Get aToken balance after deposit
        uint256 balanceAfter = aUSDC.balanceOf(address(this));
        uint256 aTokensReceived = balanceAfter - balanceBefore;

        yieldLoans[loanId] = YieldLoan({
            loanId: loanId,
            principal: amount,
            borrower: borrower,
            lender: lender,
            principalClaimed: false,
            initialATokenBalance: aTokensReceived
        });

        emit FundsDeposited(loanId, amount, borrower);
    }

    /**
     * @notice Claims the principal for a given loan. Only the borrower can call this.
     * @param loanId The ID of the loan to claim principal for.
     * @dev Withdraws the principal from Aave and transfers to the borrower. Emits PrincipalClaimed.
     */
    function claimPrincipal(uint256 loanId) external nonReentrant {
        YieldLoan storage loan = yieldLoans[loanId];
        if (loan.loanId == 0) revert YieldVault__InvalidLoanId();
        if (msg.sender != loan.borrower) revert YieldVault__NotAuthorized();
        if (loan.principalClaimed) revert YieldVault__AlreadyClaimed();

        loan.principalClaimed = true;

        // Withdraw principal from Aave
        uint256 withdrawnAmount = AAVE_POOL.withdraw(
            address(USDC),
            loan.principal,
            loan.borrower
        );

        emit PrincipalClaimed(loanId, withdrawnAmount);
    }

    /**
     * @notice Claims the yield for a given loan. Only the contract owner can call this.
     * @param loanId The ID of the loan to claim yield for.
     * @dev Withdraws the yield (interest earned) from Aave and transfers to the lender. Deletes the loan record. Emits YieldClaimed.
     */
    function claimYield(uint256 loanId) external nonReentrant onlyOwner {
        YieldLoan memory loan = yieldLoans[loanId];
        if (loan.loanId == 0) revert YieldVault__InvalidLoanId();
        if (!loan.principalClaimed) revert YieldVault__PrincipalNotClaimed();

        delete yieldLoans[loanId];
        uint256 currentATokenBalance = aUSDC.balanceOf(address(this));

        uint256 totalYield = currentATokenBalance > loan.initialATokenBalance
            ? currentATokenBalance - loan.initialATokenBalance
            : 0;

        if (totalYield > 0) {
            // Withdraw yield from Aave
            uint256 withdrawnAmount = AAVE_POOL.withdraw(
                address(USDC),
                totalYield,
                loan.lender
            );
            emit YieldClaimed(loanId, loan.lender, withdrawnAmount);
        }
    }
}
