// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CollateralVault} from "./CollateralVault.sol";
import {LenderNFT} from "./LenderNFT.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {DepositNftTypes} from "./DepositNftTypes.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title LoanManager - Updated for Complete Workflow
 * @author ABFX15
 * @notice Manages NFT-backed loans with complete workflow implementation
 * @dev Implements: Borrower collateral → Lender funding → AI risk adjustment → Chainlink automation liquidation
 */
contract LoanManager is AutomationCompatibleInterface, Ownable {
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
    error LoanManager__InvalidPriceFeed();
    error LoanManager__InvalidAssetType();

    // Immutable contracts
    IRouterClient public immutable i_ccipRouter;
    IERC721 public immutable i_nft;
    IERC20 public immutable i_usdc;
    CollateralVault public immutable i_collateralVault;
    LenderNFT public immutable i_lenderNFT;
    AggregatorV3Interface public immutable i_priceFeed;

    // State variables
    uint64 public immutable i_destinationChainSelector; // Avalanche chain selector
    address public avalancheVaultAddress;
    address public awsLambdaOracle; // For AI risk scoring
    uint256 public nextLoanId = 1;

    // Constants
    uint256 public constant PRECISION = 1e4;
    uint256 public constant ORIGINATION_FEE_BPS = 100; // 1%
    uint256 public constant LIQUIDATION_THRESHOLD = 8000; // 80% LTV
    uint256 public constant LIQUIDATION_PENALTY_BPS = 1000; // 10%
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant BASE_RATE = 500; // 5% base rate in basis points
    uint256 public constant LENDER_SHARE_BPS = 8000; // 80%
    uint256 public constant PROTOCOL_SHARE_BPS = 2000; // 20%
    uint256 public constant GAS_LIMIT_CROSS_CHAIN = 200000;
    uint256 public constant GAS_LIMIT_LIQUIDATION = 5_000_000;
    uint256 public constant WARNING_THRESHOLD = 8500; // 85%
    uint256 public constant SOFT_LIQUIDATION_THRESHOLD = 8000; // 80%
    uint256 public constant HARD_LIQUIDATION_THRESHOLD = 7500; // 75%

    // Loan structure matching your workflow
    struct Loan {
        uint256 loanId;
        uint256 tokenId; // NFT collateral
        uint256 principalAmount; // Loan amount
        uint256 interestRate; // Dynamic rate from AI (basis points)
        uint256 startTimestamp;
        address borrower;
        address lender;
        bool isActive;
        bool isFunded;
        uint256 assetType; // Type of asset (0=real estate, 1=art, 2=invoice, etc.)
    }

    // Mappings
    mapping(uint256 => Loan) public loans;
    mapping(uint256 => bool) public nftIsCollateral;
    mapping(address => uint256) public protocolYield;
    mapping(address => uint256) public lenderYield;
    mapping(uint256 => uint256) public aiRiskScores; // loanId => risk score (0-100)

    // Cross-chain liquidity pool tracking
    struct ChainLiquidity {
        uint256 totalLiquidity;
        uint256 availableLiquidity;
        uint256 utilizationRate;
        uint64 chainSelector;
    }

    mapping(uint64 => ChainLiquidity) public chainLiquidity;
    mapping(address => mapping(uint64 => uint256)) public lenderPositions;

    // Events matching your sequence diagrams
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
    event AIRiskUpdated(
        uint256 indexed loanId,
        uint256 riskScore,
        uint256 newInterestRate
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
    event LiquidityAdded(
        address indexed lender,
        uint64 indexed chainSelector,
        uint256 amount,
        bytes32 messageId
    );
    event LiquidityWithdrawn(
        address indexed lender,
        uint64 indexed chainSelector,
        uint256 amount
    );

    constructor(
        address nft,
        address collateralVault,
        address lenderNFT,
        address ccipRouter,
        address usdc,
        address priceFeed,
        uint64 _destinationChainSelector
    ) Ownable(msg.sender) {
        i_nft = IERC721(nft);
        i_collateralVault = CollateralVault(collateralVault);
        i_lenderNFT = LenderNFT(lenderNFT);
        i_ccipRouter = IRouterClient(ccipRouter);
        i_usdc = IERC20(usdc);
        i_priceFeed = AggregatorV3Interface(priceFeed);
        i_destinationChainSelector = _destinationChainSelector;
    }

    // Enhanced price feed mapping for multiple asset types
    mapping(uint256 => AggregatorV3Interface) public assetPriceFeeds;

    function addPriceFeed(
        uint256 assetType,
        address priceFeed
    ) external onlyOwner {
        if (priceFeed == address(0)) revert LoanManager__InvalidPriceFeed();
        assetPriceFeeds[assetType] = AggregatorV3Interface(priceFeed);
    }

    /**
     * @notice Step 1: Borrower deposits NFT as collateral
     * @param tokenId NFT token ID to deposit
     * @param requestedAmount Loan amount requested
     * @param assetType Type of asset (0=real estate, 1=art, 2=invoice, etc.)
     */
    function depositNFTCollateral(
        uint256 tokenId,
        uint256 requestedAmount,
        uint256 assetType
    ) external {
        if (nftIsCollateral[tokenId])
            revert LoanManager__NFTAlreadyCollateral();
        if (requestedAmount == 0) revert LoanManager__InvalidAmount();
        if (assetPriceFeeds[assetType] == AggregatorV3Interface(address(0)))
            revert LoanManager__InvalidAssetType();

        // Create loan with initial base interest rate (AI will adjust later)
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            loanId: loanId,
            tokenId: tokenId,
            principalAmount: requestedAmount,
            interestRate: BASE_RATE, // Will be updated by AI
            startTimestamp: block.timestamp,
            borrower: msg.sender,
            lender: address(0), // Set when funded
            isActive: true,
            isFunded: false,
            assetType: assetType
        });
        nftIsCollateral[tokenId] = true;
        // Verify NFT ownership and get property value from Chainlink data feed
        if (i_nft.ownerOf(tokenId) != msg.sender)
            revert LoanManager__NotAuthorized();

        AggregatorV3Interface priceFeed = assetPriceFeeds[assetType];
        (, int256 propertyValue, , , ) = priceFeed.latestRoundData();
        uint256 maxLoanAmount = (uint256(propertyValue) *
            LIQUIDATION_THRESHOLD) / PRECISION;

        if (requestedAmount > maxLoanAmount)
            revert LoanManager__InsufficientCollateral();

        // Transfer NFT to CollateralVault
        i_nft.transferFrom(msg.sender, address(i_collateralVault), tokenId);
        i_collateralVault.depositNFT(tokenId, loanId);

        emit LoanCreated(loanId, tokenId, msg.sender, requestedAmount);
    }

    /**
     * @notice Step 2: Lender funds loan cross-chain via CCIP
     * @param loanId Loan ID to fund
     */
    function fundLoanCrossChain(uint256 loanId) external payable {
        Loan storage loan = loans[loanId];
        if (!loan.isActive || loan.isFunded)
            revert LoanManager__LoanNotActive();
        if (msg.sender == address(0)) revert LoanManager__NotAuthorized();

        // Update loan with lender info
        loan.lender = msg.sender;
        loan.isFunded = true;
        // Transfer USDC from lender
        i_usdc.safeTransferFrom(
            msg.sender,
            address(this),
            loan.principalAmount
        );

        // Mint lenderNFT representing position
        uint256 lenderNFTId = i_lenderNFT.mintLenderPosition(
            msg.sender,
            loanId,
            loan.principalAmount
        );

        // Send USDC to borrower's chain via CCIP
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(avalancheVaultAddress),
            data: abi.encode(loanId, loan.borrower, loan.principalAmount),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            feeToken: address(0), // Pay fees in native token
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: GAS_LIMIT_LIQUIDATION})
            )
        });

        // Add USDC token transfer to message
        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_usdc),
            amount: loan.principalAmount
        });

        // Approve CCIP router to spend USDC
        i_usdc.approve(address(i_ccipRouter), loan.principalAmount);

        // Send cross-chain message with USDC
        bytes32 messageId = i_ccipRouter.ccipSend{value: msg.value}(
            i_destinationChainSelector,
            message
        );

        emit LoanFunded(loanId, msg.sender, loan.principalAmount, lenderNFTId);
        emit CCIPMessageSent(messageId, loanId, i_destinationChainSelector);
    }

    /**
     * @notice Step 3: AWS Lambda calls to update AI risk score
     * @param loanId Loan ID to update
     * @param riskScore AI risk score (0-100)
     */
    function updateAIRiskScore(uint256 loanId, uint256 riskScore) external {
        if (msg.sender != awsLambdaOracle) revert LoanManager__NotAuthorized();

        Loan storage loan = loans[loanId];
        if (!loan.isActive) revert LoanManager__LoanNotActive();

        // Store risk score
        aiRiskScores[loanId] = riskScore;

        // Calculate new interest rate based on risk (5% base + risk adjustment)
        // Higher risk = higher rate: 5% + (riskScore * 0.1%)
        uint256 newInterestRate = BASE_RATE + (riskScore * 10); // In basis points
        loan.interestRate = newInterestRate;

        emit AIRiskUpdated(loanId, riskScore, newInterestRate);
    }

    /**
     * @notice Step 4: Chainlink Automation checks for liquidation
     * @param checkData Encoded loan ID to check
     */
    function checkUpkeep(
        bytes calldata checkData
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 loanId = abi.decode(checkData, (uint256));
        Loan memory loan = loans[loanId];

        if (!loan.isActive || !loan.isFunded) {
            return (false, checkData);
        }

        // Get current collateral value from appropriate price feed
        AggregatorV3Interface priceFeed = assetPriceFeeds[loan.assetType];
        if (address(priceFeed) == address(0))
            revert LoanManager__InvalidAssetType();

        (, int256 currentValue, , , ) = priceFeed.latestRoundData();
        uint256 collateralValue = uint256(currentValue);

        // Calculate current debt
        uint256 currentDebt = calculateCurrentDebt(loanId);

        // Check multiple thresholds
        uint256 ltv = (currentDebt * PRECISION) / collateralValue;

        if (ltv >= HARD_LIQUIDATION_THRESHOLD) {
            // Encode full liquidation
            return (true, abi.encode(loanId, uint8(2))); // Hard liquidation
        } else if (ltv >= SOFT_LIQUIDATION_THRESHOLD) {
            // Encode partial liquidation
            return (true, abi.encode(loanId, uint8(1))); // Soft liquidation
        } else if (ltv >= WARNING_THRESHOLD) {
            // Encode warning
            return (true, abi.encode(loanId, uint8(0))); // Warning
        }

        return (false, checkData);
    }

    /**
     * @notice Step 4: Chainlink Automation performs liquidation
     * @param performData Encoded loan ID to liquidate
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256 loanId = abi.decode(performData, (uint256));
        liquidateLoan(loanId);
    }

    /**
     * @notice Liquidate undercollateralized loan
     * @param loanId Loan ID to liquidate
     */
    function liquidateLoan(uint256 loanId) public {
        Loan storage loan = loans[loanId];
        // Calculate liquidation penalty
        uint256 penalty = (loan.principalAmount * LIQUIDATION_PENALTY_BPS) /
            PRECISION;
        if (!loan.isActive || !loan.isFunded)
            revert LoanManager__LoanNotActive();

        loan.isActive = false;
        nftIsCollateral[loan.tokenId] = false;

        if (protocolYield[owner()] >= penalty) {
            protocolYield[owner()] -= penalty;
            if (msg.sender != address(0)) {
                i_usdc.safeTransfer(msg.sender, penalty);
            }
        }

        // Verify liquidation is needed
        (, int256 currentValue, , , ) = i_priceFeed.latestRoundData();
        uint256 collateralValue = uint256(currentValue);
        uint256 currentDebt = calculateCurrentDebt(loanId);
        uint256 requiredCollateral = (currentDebt * LIQUIDATION_THRESHOLD) /
            PRECISION;

        if (collateralValue >= requiredCollateral)
            revert LoanManager__LiquidationNotNeeded();

        // Release NFT from vault to liquidator for sale on OpenSea
        i_collateralVault.releaseNFT(loan.tokenId);
        i_nft.transferFrom(
            address(i_collateralVault),
            msg.sender,
            loan.tokenId
        );

        // Burn lender NFT
        uint256 lenderNFTId = i_lenderNFT.loanIdToToken(loanId);
        i_lenderNFT.burnLenderPosition(lenderNFTId);

        emit CollateralLiquidated(loanId, msg.sender, penalty);
    }

    /**
     * @notice Calculate current debt including accrued interest
     * @param loanId Loan ID
     * @return Current total debt
     */
    function calculateCurrentDebt(
        uint256 loanId
    ) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        if (!loan.isActive) return 0;

        uint256 timeElapsed = block.timestamp - loan.startTimestamp;
        uint256 interest = (loan.principalAmount *
            loan.interestRate *
            timeElapsed) / (PRECISION * SECONDS_PER_YEAR);

        return loan.principalAmount + interest;
    }

    /**
     * @notice Repay loan and release collateral
     * @param loanId Loan ID to repay
     */
    function repayLoan(uint256 loanId) external {
        Loan storage loan = loans[loanId];
        if (msg.sender != loan.borrower) revert LoanManager__NotAuthorized();
        if (!loan.isActive || !loan.isFunded)
            revert LoanManager__LoanNotActive();

        uint256 totalDebt = calculateCurrentDebt(loanId);
        // Calculate yield distribution (80% lender, 20% protocol)
        uint256 interest = totalDebt - loan.principalAmount;
        uint256 lenderShare = (interest * LENDER_SHARE_BPS) / PRECISION; // 80%
        uint256 protocolShare = interest - lenderShare; // 20%
        // Burn lender NFT
        protocolYield[owner()] += protocolShare;

        // Mark loan as repaid
        loan.isActive = false;
        nftIsCollateral[loan.tokenId] = false;
        uint256 lenderNFTId = i_lenderNFT.loanIdToToken(loanId);
        // Transfer repayment from borrower
        i_usdc.safeTransferFrom(msg.sender, address(this), totalDebt);

        // Release NFT collateral back to borrower
        i_collateralVault.releaseNFT(loan.tokenId);

        // Transfer principal + lender share to lender
        i_usdc.safeTransfer(loan.lender, loan.principalAmount + lenderShare);

        i_lenderNFT.burnLenderPosition(lenderNFTId);

        emit LoanRepaid(loanId, totalDebt);
    }

    // Admin functions
    function setAvalancheVaultAddress(address _vault) external onlyOwner {
        if (_vault == address(0)) revert LoanManager__InvalidVaultAddress();
        avalancheVaultAddress = _vault;
    }

    function setAWSLambdaOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0)) revert LoanManager__InvalidOracleAddress();
        awsLambdaOracle = _oracle;
    }

    function withdrawProtocolYield() external onlyOwner {
        uint256 amount = protocolYield[msg.sender];
        if (amount == 0) revert LoanManager__NoYieldToWithdraw();

        protocolYield[msg.sender] = 0;
        i_usdc.safeTransfer(msg.sender, amount);
    }

    // View functions
    function getLoanDetails(
        uint256 loanId
    ) external view returns (Loan memory) {
        return loans[loanId];
    }

    function getAIRiskScore(uint256 loanId) external view returns (uint256) {
        return aiRiskScores[loanId];
    }

    function addChainLiquidity(uint64 chainSelector) external payable {
        require(msg.value > 0, "Must provide CCIP fees");

        // Transfer USDC from lender
        uint256 amount = msg.value;
        i_usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Update chain liquidity
        chainLiquidity[chainSelector].totalLiquidity += amount;
        chainLiquidity[chainSelector].availableLiquidity += amount;

        // Update lender position
        lenderPositions[msg.sender][chainSelector] += amount;

        // Send liquidity to destination chain via CCIP
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(avalancheVaultAddress),
            data: abi.encode(amount),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: GAS_LIMIT_CROSS_CHAIN})
            )
        });

        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_usdc),
            amount: amount
        });

        i_usdc.approve(address(i_ccipRouter), amount);
        bytes32 messageId = i_ccipRouter.ccipSend{value: msg.value}(
            chainSelector,
            message
        );

        emit LiquidityAdded(msg.sender, chainSelector, amount, messageId);
    }

    function withdrawChainLiquidity(
        uint64 chainSelector,
        uint256 amount
    ) external {
        require(
            lenderPositions[msg.sender][chainSelector] >= amount,
            "Insufficient balance"
        );
        require(
            chainLiquidity[chainSelector].availableLiquidity >= amount,
            "Insufficient liquidity"
        );

        // Update chain liquidity
        chainLiquidity[chainSelector].totalLiquidity -= amount;
        chainLiquidity[chainSelector].availableLiquidity -= amount;

        // Update lender position
        lenderPositions[msg.sender][chainSelector] -= amount;

        // Transfer USDC back to lender
        i_usdc.safeTransfer(msg.sender, amount);

        emit LiquidityWithdrawn(msg.sender, chainSelector, amount);
    }
}
