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
 * @notice Receives funds via CCIP, deposits them into Aave to earn yield,
 * and allows borrowers to claim their principal while lenders claim the yield.
 * @dev Integrates with Aave and Chainlink CCIP for cross-chain yield management.
 */
contract YieldVault is ICrossChainReceiver, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Aave Pool and USDC are now set via constructor
    IPool private immutable AAVE_POOL;
    IERC20 private immutable USDC;

    // Custom Errors
    error YieldVault__NotAuthorized();
    error YieldVault__InvalidLoanId();
    error YieldVault__AlreadyClaimed();

    struct YieldLoan {
        uint256 loanId;
        uint256 principal;
        address borrower;
        address lender;
        bool principalClaimed;
    }

    // Mapping from our protocol's loanId to the yield-generating position
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

    constructor(
        address router,
        address aavePool,
        address usdc
    ) ICrossChainReceiver(router) Ownable(msg.sender) {
        AAVE_POOL = IPool(aavePool);
        USDC = IERC20(usdc);
    }

    /**
     * @notice Main entry point for CCIP messages. Decodes the message and deposits funds.
     * @dev Only callable by the router. Decodes message and calls _depositFunds.
     * @param message The CCIP message containing loanId, amount, borrower, and lender.
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override onlyRouter {
        (uint256 loanId, uint256 amount, address borrower, address lender) = abi
            .decode(message.data, (uint256, uint256, address, address));

        _depositFunds(loanId, amount, borrower, lender);
    }

    /**
     * @notice Internal function to handle fund deposit and Aave supply.
     * @dev Approves and supplies USDC to Aave, records the yield loan.
     * @param loanId The protocol loan ID.
     * @param amount The principal amount to deposit.
     * @param borrower The address of the borrower.
     * @param lender The address of the lender.
     */
    function _depositFunds(
        uint256 loanId,
        uint256 amount,
        address borrower,
        address lender
    ) private nonReentrant {
        if (yieldLoans[loanId].loanId != 0) revert YieldVault__InvalidLoanId();

        // Approve Aave pool to spend our USDC
        IERC20(address(USDC)).forceApprove(address(AAVE_POOL), amount);

        // Supply USDC to Aave to start earning aUSDC
        AAVE_POOL.supply(address(USDC), amount, address(this), 0);

        yieldLoans[loanId] = YieldLoan({
            loanId: loanId,
            principal: amount,
            borrower: borrower,
            lender: lender,
            principalClaimed: false
        });

        emit FundsDeposited(loanId, amount, borrower);
    }

    /**
     * @notice Allows the designated borrower to claim their loan principal.
     * @dev Only the borrower can call this. Withdraws principal from Aave and sends to borrower.
     * @param loanId The protocol loan ID to claim principal for.
     */
    function claimPrincipal(uint256 loanId) external nonReentrant {
        YieldLoan storage loan = yieldLoans[loanId];
        if (loan.loanId == 0) revert YieldVault__InvalidLoanId();
        if (msg.sender != loan.borrower) revert YieldVault__NotAuthorized();
        if (loan.principalClaimed) revert YieldVault__AlreadyClaimed();

        loan.principalClaimed = true;

        // Withdraw only the principal from Aave and send to borrower
        uint256 withdrawnAmount = AAVE_POOL.withdraw(
            address(USDC),
            loan.principal,
            loan.borrower
        );

        emit PrincipalClaimed(loanId, withdrawnAmount);
    }

    /**
     * @notice Allows the lender to claim the yield generated from the loan.
     * @dev Only callable by the owner (LoanManager contract). Withdraws yield from Aave and sends to lender.
     * @param loanId The protocol loan ID to claim yield for.
     */
    function claimYield(uint256 loanId) external nonReentrant onlyOwner {
        YieldLoan memory loan = yieldLoans[loanId];
        if (loan.loanId == 0) revert YieldVault__InvalidLoanId();

        // Calculate yield: current balance - initial principal
        delete yieldLoans[loanId];
        uint256 currentBalance = USDC.balanceOf(address(this));
        uint256 yield = currentBalance - loan.principal;

        if (yield > 0) {
            uint256 withdrawnAmount = AAVE_POOL.withdraw(
                address(USDC),
                yield,
                loan.lender
            );
            emit YieldClaimed(loanId, loan.lender, withdrawnAmount);
        }
    }
}

// --- TEST-ONLY CONTRACT ---
// This contract is only for testing purposes and should not be deployed in production.
/**
 * @title TestYieldVault
 * @notice Test-only extension of YieldVault for testing CCIP receive logic.
 * @dev Not for production use.
 */
contract TestYieldVault is YieldVault {
    constructor(
        address router,
        address aavePool,
        address usdc
    ) YieldVault(router, aavePool, usdc) {}

    /**
     * @notice Test function to call _ccipReceive externally.
     * @param message The CCIP message to process.
     */
    function testCcipReceive(Client.Any2EVMMessage memory message) external {
        _ccipReceive(message);
    }
}
