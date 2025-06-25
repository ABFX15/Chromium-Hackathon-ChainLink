// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CollateralVault} from "./CollateralVault.sol";
import {LenderNFT} from "./LenderNFT.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PropertyOracle} from "./PropertyOracle.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LoanManager
 * @author ABFX15
 * @notice Manages NFT-backed loans, using a PropertyOracle for valuations.
 * @dev Implements: Borrower collateral → Lender funding → Chainlink automation for liquidation
 */
contract LoanManager is
    AutomationCompatibleInterface,
    Ownable,
    ReentrancyGuard,
    Pausable
{
    using SafeERC20 for IERC20;

    // Custom Errors
    error LoanManager__LoanNotActive();
    error LoanManager__InvalidAmount();
    error LoanManager__NotAuthorized();
    error LoanManager__NFTAlreadyCollateral();
    error LoanManager__NoYieldToWithdraw();
    error LoanManager__InsufficientCollateral();
    error LoanManager__LiquidationNotNeeded();
    error LoanManager__InvalidVaultAddress();
    error LoanManager__InvalidOracleAddress();
    error LoanManager__OracleNotSet();
    error LoanManager__LoanAlreadyFunded();
    error LoanManager__FailedToWithdrawEther();

    // Immutable contracts
    IRouterClient public immutable i_ccipRouter;
    IERC721 public immutable i_nft;
    IERC20 public immutable i_usdc;
    CollateralVault public immutable i_collateralVault;
    LenderNFT public immutable i_lenderNFT;

    // Oracle
    PropertyOracle public propertyOracle;

    // State variables
    uint64 public immutable i_destinationChainSelector;
    address public yieldVaultAddress;
    uint256 public nextLoanId = 1;

    // Constants
    uint256 public constant PRECISION = 1e4;
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80% LTV
    uint256 public constant LIQUIDATION_PENALTY_BPS = 1000; // 10%
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant LENDER_SHARE_BPS = 8000; // 80%
    uint256 public constant PROTOCOL_SHARE_BPS = 2000; // 20%
    uint256 public constant GAS_LIMIT_CROSS_CHAIN = 200_000;

    struct Loan {
        uint256 loanId;
        uint256 tokenId;
        uint256 principalAmount;
        uint256 interestRate; // Fixed rate set at creation (basis points)
        uint256 startTimestamp;
        address borrower;
        address lender;
        bool isActive;
        bool isFunded;
        uint256 assetType;
    }

    // Mappings
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => bool) public nftIsCollateral;
    mapping(address => uint256) public protocolYield;
    mapping(address => uint256) public lenderYield;

    // Events
    event LoanCreated(
        uint256 indexed loanId,
        uint256 indexed tokenId,
        address indexed borrower,
        uint256 amount
    );
    event LoanFunded(
        uint256 indexed loanId,
        address indexed lender,
        uint256 amount,
        uint256 lenderNFTId
    );
    event LoanRepaid(uint256 indexed loanId, uint256 totalAmount);
    event CollateralLiquidated(
        uint256 indexed loanId,
        address indexed liquidator,
        uint256 recoveredAmount
    );
    event CCIPMessageSent(
        bytes32 indexed messageId,
        uint256 indexed loanId,
        uint64 destinationChain
    );
    event PropertyOracleUpdated(address indexed newOracle);
    event LoanCancelled(uint256 indexed loanId);
    event YieldSet();
    event YieldWithdrawn(address indexed recipient, uint256 amount);
    event YieldLenderWithdrawn(address indexed lender, uint256 amount);
    event AvalancheVaultSet(address indexed vaultAddress);

    constructor(
        address nft,
        address collateralVault,
        address lenderNFT,
        address ccipRouter,
        address usdc,
        uint64 _destinationChainSelector
    ) Ownable(msg.sender) {
        i_nft = IERC721(nft);
        i_collateralVault = CollateralVault(collateralVault);
        i_lenderNFT = LenderNFT(lenderNFT);
        i_ccipRouter = IRouterClient(ccipRouter);
        i_usdc = IERC20(usdc);
        i_destinationChainSelector = _destinationChainSelector;
    }

    // --- Admin Functions ---

    // Allow contract to receive Ether
    receive() external payable {}

    /**
     * @notice Pauses the contract, disabling core loan actions.
     * @dev Only callable by the owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the contract, enabling core loan actions.
     * @dev Only callable by the owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraws all Ether from the contract to the owner.
     * @dev Only callable by the owner.
     */
    function withdrawEther() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        if (!success) revert LoanManager__FailedToWithdrawEther();
    }

    /**
     * @notice Sets the property oracle contract address.
     * @dev Only callable by the owner. Reverts if address is zero.
     * @param _propertyOracle The address of the new property oracle contract.
     */
    function setPropertyOracle(
        address _propertyOracle
    ) external onlyOwner nonReentrant {
        if (_propertyOracle == address(0))
            revert LoanManager__InvalidOracleAddress();
        propertyOracle = PropertyOracle(_propertyOracle);
        emit PropertyOracleUpdated(_propertyOracle);
    }

    /**
     * @notice Sets the yield vault contract address.
     * @dev Only callable by the owner. Reverts if address is zero.
     * @param _yieldVaultAddress The address of the new yield vault contract.
     */
    function setYieldVault(
        address _yieldVaultAddress
    ) external onlyOwner nonReentrant {
        if (_yieldVaultAddress == address(0))
            revert LoanManager__InvalidVaultAddress();
        yieldVaultAddress = _yieldVaultAddress;
        emit YieldSet();
    }

    // --- Core Loan Workflow ---

    /**
     * @notice Deposits an NFT as collateral and creates a new loan request.
     * @dev Transfers NFT to CollateralVault and records loan details.
     * @param tokenId The NFT token ID to deposit as collateral.
     * @param requestedAmount The requested loan principal amount.
     * @param assetType The asset type (reserved for future use).
     * @param interestRate The fixed interest rate (basis points).
     */
    function depositNFTCollateral(
        uint256 tokenId,
        uint256 requestedAmount,
        uint256 assetType, // Retained for future use
        uint256 interestRate
    ) external nonReentrant whenNotPaused {
        if (address(propertyOracle) == address(0))
            revert LoanManager__OracleNotSet();
        if (nftIsCollateral[tokenId])
            revert LoanManager__NFTAlreadyCollateral();
        if (requestedAmount == 0) revert LoanManager__InvalidAmount();

        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            loanId: loanId,
            tokenId: tokenId,
            principalAmount: requestedAmount,
            interestRate: interestRate,
            startTimestamp: block.timestamp,
            borrower: msg.sender,
            lender: address(0),
            isActive: true,
            isFunded: false,
            assetType: assetType
        });

        nftIsCollateral[tokenId] = true;
        if (i_nft.ownerOf(tokenId) != msg.sender)
            revert LoanManager__NotAuthorized();

        uint256 propertyValue = propertyOracle.getPropertyValue(tokenId);
        uint256 maxLoanAmount = (propertyValue * LIQUIDATION_THRESHOLD) /
            PRECISION;
        if (requestedAmount > maxLoanAmount)
            revert LoanManager__InsufficientCollateral();

        i_nft.transferFrom(msg.sender, address(i_collateralVault), tokenId);
        i_collateralVault.depositNFT(loanId, tokenId, msg.sender);

        emit LoanCreated(loanId, tokenId, msg.sender, requestedAmount);
    }

    /**
     * @notice Funds a loan cross-chain as a lender, transferring USDC and minting a LenderNFT.
     * @dev Sends a CCIP message to the yield vault and records the lender.
     * @param loanId The loan ID to fund.
     */
    function fundLoanCrossChain(
        uint256 loanId
    ) external payable nonReentrant whenNotPaused {
        Loan storage loan = loans[loanId];
        if (!loan.isActive || loan.isFunded)
            revert LoanManager__LoanNotActive();
        if (msg.sender == address(0)) revert LoanManager__NotAuthorized();

        loan.lender = msg.sender;
        loan.isFunded = true;
        i_usdc.safeTransferFrom(
            msg.sender,
            address(this),
            loan.principalAmount
        );

        uint256 lenderNFTId = i_lenderNFT.mintLenderPosition(
            msg.sender,
            loanId,
            loan.principalAmount
        );

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(yieldVaultAddress),
            data: abi.encode(
                loanId,
                loan.principalAmount,
                loan.borrower,
                loan.lender
            ),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: GAS_LIMIT_CROSS_CHAIN})
            )
        });
        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_usdc),
            amount: loan.principalAmount
        });

        uint256 fees = i_ccipRouter.getFee(i_destinationChainSelector, message);
        if (msg.value < fees) revert LoanManager__InvalidAmount();

        bytes32 messageId = i_ccipRouter.ccipSend{value: msg.value}(
            i_destinationChainSelector,
            message
        );

        emit LoanFunded(loanId, msg.sender, loan.principalAmount, lenderNFTId);
        emit CCIPMessageSent(messageId, loanId, i_destinationChainSelector);
    }

    /**
     * @notice Repays an active loan, transferring principal and interest from the borrower.
     * @dev Transfers funds, releases collateral, and burns LenderNFT.
     * @param loanId The loan ID to repay.
     */
    function repayLoan(uint256 loanId) external nonReentrant whenNotPaused {
        Loan storage loan = loans[loanId];
        if (loan.borrower == address(0) || !loan.isActive)
            revert LoanManager__LoanNotActive();
        if (msg.sender != loan.borrower) revert LoanManager__NotAuthorized();

        uint256 accruedInterest = _calculateAccruedInterest(loan);
        uint256 totalRepayment = loan.principalAmount + accruedInterest;

        i_usdc.safeTransferFrom(msg.sender, address(this), totalRepayment);

        uint256 protocolFee = (accruedInterest * PROTOCOL_SHARE_BPS) /
            PRECISION;
        uint256 lenderEarning = accruedInterest - protocolFee;

        protocolYield[address(this)] += protocolFee;
        lenderYield[loan.lender] += lenderEarning;

        i_usdc.safeTransfer(loan.lender, loan.principalAmount + lenderEarning);

        loan.isActive = false;
        nftIsCollateral[loan.tokenId] = false;

        uint256 lenderNFTId = i_lenderNFT.loanIdToToken(loanId);
        i_collateralVault.releaseNFT(loan.tokenId);
        i_lenderNFT.burnLenderPosition(lenderNFTId);

        emit LoanRepaid(loanId, totalRepayment);
    }

    /**
     * @notice Cancels an unfunded loan and releases the NFT collateral.
     * @dev Only the borrower can call. Reverts if loan is already funded.
     * @param loanId The loan ID to cancel.
     */
    function cancelUnfundedLoan(
        uint256 loanId
    ) external nonReentrant whenNotPaused {
        Loan storage loan = loans[loanId];
        if (!loan.isActive) revert LoanManager__LoanNotActive();
        if (msg.sender != loan.borrower) revert LoanManager__NotAuthorized();
        if (loan.isFunded) revert LoanManager__LoanAlreadyFunded();

        loan.isActive = false;
        nftIsCollateral[loan.tokenId] = false;

        i_collateralVault.releaseNFT(loan.tokenId);

        emit LoanCancelled(loanId);
    }

    // --- Automation & Liquidation ---

    /**
     * @notice Chainlink Automation check for undercollateralized loans.
     * @dev Iterates through all loans to find any needing liquidation.
     * @param checkData Not used in current implementation.
     * @return upkeepNeeded True if any loan needs liquidation.
     * @return performData Encoded loanId to liquidate.
     */
    function checkUpkeep(
        bytes calldata checkData
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        if (address(propertyOracle) == address(0)) return (false, "");
        // V2: Optimize by iterating over an active loan list, not all loans.
        for (uint256 i = 1; i < nextLoanId; i++) {
            Loan memory loan = loans[i];
            if (loan.isActive && loan.isFunded) {
                uint256 healthFactor = getHealthFactor(i);
                if (healthFactor < PRECISION) {
                    // Check if HF < 1.0
                    return (true, abi.encode(i));
                }
            }
        }
        return (false, "");
    }

    /**
     * @notice Performs liquidation on an undercollateralized loan.
     * @dev Transfers NFT to lender and emits liquidation event.
     * @param performData Encoded loanId to liquidate.
     */
    function performUpkeep(
        bytes calldata performData
    ) external override nonReentrant whenNotPaused {
        uint256 loanId = abi.decode(performData, (uint256));
        uint256 healthFactor = getHealthFactor(loanId);

        if (healthFactor >= PRECISION)
            revert LoanManager__LiquidationNotNeeded();

        Loan storage loan = loans[loanId];
        loan.isActive = false;
        nftIsCollateral[loan.tokenId] = false;

        i_collateralVault.liquidateAndTransfer(loan.tokenId, loan.lender);

        uint256 accruedInterest = _calculateAccruedInterest(loan);
        uint256 totalDebt = loan.principalAmount + accruedInterest;
        uint256 penalty = (totalDebt * LIQUIDATION_PENALTY_BPS) / PRECISION;
        uint256 finalDebt = totalDebt + penalty;

        emit CollateralLiquidated(loanId, loan.lender, finalDebt);
    }

    // --- Yield Withdrawal ---

    /**
     * @notice Withdraws protocol yield (interest fees) to the owner.
     * @dev Only callable if yield is available.
     */
    function withdrawProtocolYield() external nonReentrant {
        uint256 yieldAmount = protocolYield[address(this)];
        if (yieldAmount == 0) revert LoanManager__NoYieldToWithdraw();
        protocolYield[address(this)] = 0;
        i_usdc.safeTransfer(owner(), yieldAmount);
        emit YieldWithdrawn(owner(), yieldAmount);
    }

    /**
     * @notice Withdraws lender yield (interest earnings) to the caller.
     * @dev Only callable if yield is available.
     */
    function withdrawLenderYield() external nonReentrant {
        uint256 yieldAmount = lenderYield[msg.sender];
        if (yieldAmount == 0) revert LoanManager__NoYieldToWithdraw();
        lenderYield[msg.sender] = 0;
        i_usdc.safeTransfer(msg.sender, yieldAmount);
        emit YieldLenderWithdrawn(msg.sender, yieldAmount);
    }

    /**
     * @notice Sets the Avalanche vault address for cross-chain yield.
     * @dev Only callable by the owner. Reverts if address is zero.
     * @param vaultAddress The Avalanche vault address.
     */
    function setAvalancheVault(
        address vaultAddress
    ) external onlyOwner nonReentrant {
        if (vaultAddress == address(0))
            revert LoanManager__InvalidVaultAddress();
        yieldVaultAddress = vaultAddress;
        emit AvalancheVaultSet(vaultAddress);
    }

    // --- View Functions ---

    /**
     * @notice Gets details for a specific loan.
     * @param loanId The loan ID to query.
     * @return tokenId The NFT token ID.
     * @return principalAmount The principal amount.
     * @return interestRate The interest rate (basis points).
     * @return startTimestamp The loan start timestamp.
     * @return borrower The borrower address.
     * @return lender The lender address.
     * @return isActive Whether the loan is active.
     * @return isFunded Whether the loan is funded.
     */
    function getLoanDetails(
        uint256 loanId
    )
        external
        view
        returns (
            uint256 tokenId,
            uint256 principalAmount,
            uint256 interestRate,
            uint256 startTimestamp,
            address borrower,
            address lender,
            bool isActive,
            bool isFunded
        )
    {
        Loan memory loan = loans[loanId];
        return (
            loan.tokenId,
            loan.principalAmount,
            loan.interestRate,
            loan.startTimestamp,
            loan.borrower,
            loan.lender,
            loan.isActive,
            loan.isFunded
        );
    }

    /**
     * @notice Calculates accrued interest for a loan.
     * @dev Internal view function.
     * @param loan The loan struct to calculate interest for.
     * @return The accrued interest amount.
     */
    function _calculateAccruedInterest(
        Loan memory loan
    ) internal view returns (uint256) {
        if (!loan.isActive) return 0;
        uint256 timeElapsed = block.timestamp - loan.startTimestamp;
        return
            (loan.principalAmount * loan.interestRate * timeElapsed) /
            (SECONDS_PER_YEAR * PRECISION);
    }

    /**
     * @notice Gets the health factor for a loan (collateral/debt ratio).
     * @param loanId The loan ID to check.
     * @return The health factor (scaled by PRECISION, e.g., 1e4 = 1.0).
     */
    function getHealthFactor(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        if (!loan.isActive) return type(uint256).max;

        uint256 propertyValue = propertyOracle.getPropertyValue(loan.tokenId);

        uint256 accruedInterest = _calculateAccruedInterest(loan);
        uint256 totalDebt = loan.principalAmount + accruedInterest;

        if (totalDebt == 0) return type(uint256).max;

        // Health Factor = (Collateral Value * Liquidation Threshold) / Total Debt
        return (propertyValue * LIQUIDATION_THRESHOLD) / totalDebt;
    }

    // --- TEST-ONLY: Set protocol or lender yield for testing purposes ---
    /**
     * @notice TEST-ONLY: Sets protocol or lender yield for testing.
     * @param who The address to set yield for.
     * @param amount The yield amount to set.
     * @param isProtocol True for protocol yield, false for lender yield.
     */
    function setTestYield(
        address who,
        uint256 amount,
        bool isProtocol
    ) external {
        if (isProtocol) {
            protocolYield[who] = amount;
        } else {
            lenderYield[who] = amount;
        }
    }
}
