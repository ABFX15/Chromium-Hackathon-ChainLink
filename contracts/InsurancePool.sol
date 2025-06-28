// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InsurancePool
 * @author ABFX15
 * @notice Lenders can buy insurance on loans. Premiums are pooled and paid out on default.
 * @dev MVP: No VRF yet. Integrate with LoanManager for default processing.
 */
contract InsurancePool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error InsurancePool__AlreadyInsured();
    error InsurancePool__NoActivePolicy();
    error InsurancePool__InsufficientFunds();

    IERC20 public immutable usdc;
    uint256 public premiumRateBps = 100; // 1% premium
    uint256 public payoutRateBps = 9000; // 90% payout on default
    uint256 public constant MAX_PAYOUT_RATE_BPS = 10_000; // 100% payout on default

    struct Policy {
        address lender;
        uint256 loanId;
        uint256 premiumPaid;
        bool active;
        bool claimed;
    }

    mapping(uint256 => Policy) public policies; // loanId => Policy
    uint256 public totalPremiums;
    uint256 public totalClaims;

    event PolicyPurchased(
        address indexed lender,
        uint256 indexed loanId,
        uint256 premium
    );
    event ClaimPaid(
        address indexed lender,
        uint256 indexed loanId,
        uint256 amount
    );

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Lender buys insurance for a loan by paying a premium.
     * @param loanId The loan to insure.
     * @param principal The principal amount of the loan.
     */
    function buyInsurance(uint256 loanId, uint256 principal) external {
        if (policies[loanId].active) revert InsurancePool__AlreadyInsured();
        uint256 premium = (principal * premiumRateBps) / MAX_PAYOUT_RATE_BPS;
        totalPremiums += premium;
        policies[loanId] = Policy(msg.sender, loanId, premium, true, false);
        IERC20(address(usdc)).safeTransferFrom(
            msg.sender,
            address(this),
            premium
        );
        emit PolicyPurchased(msg.sender, loanId, premium);
    }

    /**
     * @notice Called by protocol when a loan defaults. Pays out to insured lender.
     * @param loanId The defaulted loan.
     * @param principal The principal amount of the loan.
     */
    function processDefault(
        uint256 loanId,
        uint256 principal
    ) external nonReentrant onlyOwner {
        Policy storage policy = policies[loanId];
    if (!policy.active || policy.claimed)
        revert InsurancePool__NoActivePolicy();
    
    uint256 payout = (principal * payoutRateBps) / MAX_PAYOUT_RATE_BPS;
    uint256 poolBalance = IERC20(address(usdc)).balanceOf(address(this));
    

    if (poolBalance == 0) revert InsurancePool__InsufficientFunds();
    
    uint256 amount = payout > poolBalance ? poolBalance : payout;
    
    policy.claimed = true;
    totalClaims += amount;
    
    IERC20(address(usdc)).safeTransfer(policy.lender, amount);
    emit ClaimPaid(policy.lender, loanId, amount);
    }

    // Admin functions to set rates
    function setPremiumRate(uint256 bps) external onlyOwner {
        premiumRateBps = bps;
    }

    function setPayoutRate(uint256 bps) external onlyOwner {
        payoutRateBps = bps;
    }
}
