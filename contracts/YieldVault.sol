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
 */
contract YieldVault is ICrossChainReceiver, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Aave Pool on Avalanche Fuji
    IPool private constant AAVE_POOL =
        IPool(0x566D5e15a8456109f213454559556350388279d8);
    // USDC on Avalanche Fuji
    IERC20 private constant USDC =
        IERC20(0x5425890298AeD601595A70Ab815c96711a31B686);

    // Custom Errors
    error YieldVault__NotAuthorized();
    error YieldVault__InvalidLoanId();
    error YieldVault__LoanNotActive();
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
        address router
    ) ICrossChainReceiver(router) Ownable(msg.sender) {}

    /**
     * @dev Main entry point for CCIP messages. Decodes the message and deposits funds.
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override onlyRouter {
        (uint256 loanId, uint256 amount, address borrower, address lender) = abi
            .decode(message.data, (uint256, uint256, address, address));

        _depositFunds(loanId, amount, borrower, lender);
    }

    /**
     * @dev Internal function to handle fund deposit and Aave supply.
     */
    function _depositFunds(
        uint256 loanId,
        uint256 amount,
        address borrower,
        address lender
    ) private nonReentrant {
        if (yieldLoans[loanId].loanId != 0) revert YieldVault__InvalidLoanId();

        // Approve Aave pool to spend our USDC
        USDC.approve(address(AAVE_POOL), amount);

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
     * @dev Allows the designated borrower to claim their loan principal.
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
     * @dev Allows the lender to claim the yield generated from the loan.
     * Can only be called by the owner (our LoanManager contract).
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
