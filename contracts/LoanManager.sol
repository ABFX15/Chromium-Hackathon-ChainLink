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
    uint256 public constant GAS_LIMIT_CROSS_CHAIN = 200000;

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

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdrawEther() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        if (!success) revert LoanManager__FailedToWithdrawEther();
    }

    function setPropertyOracle(
        address _propertyOracle
    ) external onlyOwner nonReentrant {
        if (_propertyOracle == address(0))
            revert LoanManager__InvalidOracleAddress();
        propertyOracle = PropertyOracle(_propertyOracle);
        emit PropertyOracleUpdated(_propertyOracle);
    }

    function setYieldVault(
        address _yieldVaultAddress
    ) external onlyOwner nonReentrant {
        if (_yieldVaultAddress == address(0))
            revert LoanManager__InvalidVaultAddress();
        yieldVaultAddress = _yieldVaultAddress;
    }

    // --- Core Loan Workflow ---

    function depositNFTCollateral(
        uint256 tokenId,
        uint256 requestedAmount,
        uint256 assetType, // Retained for future use
        uint256 interestRate
    ) external whenNotPaused nonReentrant {
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

    function fundLoanCrossChain(
        uint256 loanId
    ) external payable whenNotPaused nonReentrant {
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

    function repayLoan(uint256 loanId) external whenNotPaused nonReentrant {
        Loan storage loan = loans[loanId];
        if (!loan.isActive) revert LoanManager__LoanNotActive();
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

    function cancelUnfundedLoan(
        uint256 loanId
    ) external whenNotPaused nonReentrant {
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
     * @dev The checkUpkeep function is gas-intensive in its current form.
     * For production, this should be optimized by tracking active loans in a
     * separate data structure to avoid iterating through all historical loans.
     */
    function checkUpkeep(
        bytes calldata
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
     * @dev The liquidation logic is simplified. The lender receives the collateral
     * regardless of its value relative to the debt. A more advanced implementation
     * would involve an auction mechanism to make the lender and borrower whole.
     */
    function performUpkeep(
        bytes calldata performData
    ) external override whenNotPaused nonReentrant {
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

    function withdrawProtocolYield() external nonReentrant {
        uint256 yieldAmount = protocolYield[address(this)];
        if (yieldAmount == 0) revert LoanManager__NoYieldToWithdraw();
        protocolYield[address(this)] = 0;
        i_usdc.safeTransfer(owner(), yieldAmount);
    }

    function withdrawLenderYield() external nonReentrant {
        uint256 yieldAmount = lenderYield[msg.sender];
        if (yieldAmount == 0) revert LoanManager__NoYieldToWithdraw();
        lenderYield[msg.sender] = 0;
        i_usdc.safeTransfer(msg.sender, yieldAmount);
    }

    function setAvalancheVault(
        address vaultAddress
    ) external onlyOwner nonReentrant {
        if (vaultAddress == address(0))
            revert LoanManager__InvalidVaultAddress();
        yieldVaultAddress = vaultAddress;
    }

    // --- View Functions ---

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

    function _calculateAccruedInterest(
        Loan memory loan
    ) internal view returns (uint256) {
        if (!loan.isActive) return 0;
        uint256 timeElapsed = block.timestamp - loan.startTimestamp;
        return
            (loan.principalAmount * loan.interestRate * timeElapsed) /
            (SECONDS_PER_YEAR * PRECISION);
    }

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
}
