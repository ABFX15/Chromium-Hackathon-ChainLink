// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CollateralVault} from "./CollateralVault.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {DepositNftTypes} from "./DepositNftTypes.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title LoanManager
 * @author ABFX15
 * @notice Manages NFT-backed loans, yield, and liquidations for the protocol.
 * @dev Integrates with CollateralVault for NFT collateral, Chainlink CCIP for cross-chain, and Chainlink Automation for liquidations.
 */
contract LoanManager is AutomationCompatibleInterface, Ownable {
    using SafeERC20 for IERC20;

    /// @notice Thrown when a loan is not active
    error LoanManager__LoanNotActive();
    /// @notice Thrown when an invalid amount is provided
    error LoanManager__InvalidAmount();
    /// @notice Thrown when a caller is not authorized
    error LoanManager__NotAuthorized();
    /// @notice Thrown when a CCIP send fails
    error LoanManager__CCIPSendFailed();
    /// @notice Thrown when the router address is invalid
    error LoanManager__InvalidRouterAddress();
    /// @notice Thrown when the sender is the zero address
    error LoanManager__InvalidSender();
    /// @notice Thrown when the NFT is already collateral for an active loan
    error LoanManager__NFTAlreadyCollateral();
    /// @notice Thrown when there is no yield to withdraw
    error LoanManager__NoYieldToWithdraw();

    /// @notice Chainlink CCIP router for cross-chain messaging
    IRouterClient public immutable i_ccipRouter;
    /// @notice ERC721 NFT contract used as collateral
    IERC721 public immutable i_nft;
    /// @notice USDC token contract for loan funding and repayments
    IERC20 public immutable i_usdc;
    /// @notice CollateralVault contract for managing NFT collateral
    CollateralVault public immutable i_collateralVault;
    using DepositNftTypes for DepositNftTypes.DepositNft;

    /// @notice Struct representing a loan
    struct Loan {
        uint256 loanId; ///< Unique loan ID
        uint256 tokenId; ///< NFT token ID used as collateral
        uint256 debt; ///< Principal debt (after origination fee)
        uint256 startTimestamp; ///< Timestamp when loan was created
        address borrower; ///< Borrower address
        bool isActive; ///< Loan active status
        uint256 apr; ///< Annual percentage rate (dynamic, set by AI)
    }
    /// @notice Mapping from loanId to Loan struct
    mapping(uint256 => Loan) public loans;
    /// @notice Next loan ID to be assigned
    uint256 public nextLoanId;
    /// @notice Number of days in a year (for APR calculation)
    uint256 public constant DAYS = 365;
    /// @notice Precision for basis points calculations
    uint256 public constant PRECISION = 1e4;
    /// @notice Address of the Avalanche vault for cross-chain operations
    address public avalanceVaultAddress;
    /// @notice Mapping from address to protocol yield accrued (protocol owner only)
    mapping(address => uint256) public protocolYield;
    /// @notice Mapping to prevent duplicate loans on the same NFT
    mapping(uint256 => bool) public nftIsCollateral;
    /// @notice Origination fee basis points
    uint256 public constant ORIGINATION_FEE_BPS = 100;
    /// @notice Liquidation penalty basis points
    uint256 public constant LIQUIDATION_PENALTY_BPS = 1000;
    /// @notice Mapping from loanId to lender address
    mapping(uint256 => address) public loanToLender;
    /// @notice Mapping from address to lender yield accrued
    mapping(address => uint256) public lenderYield;
    /// @notice Seconds in a year for precise interest calculation
    uint256 public constant SECONDS_PER_YEAR = 365 days;

    /**
     * @notice Emitted when a new loan is created
     * @param loanId The loan ID
     * @param tokenId The NFT token ID used as collateral
     * @param borrower The address of the borrower
     * @param netDebt The loan amount after origination fee
     */
    event LoanCreated(
        uint256 loanId,
        uint256 tokenId,
        address borrower,
        uint256 netDebt
    );

    /**
     * @notice Emitted when a loan is repaid
     * @param loanId The loan ID
     * @param totalRepaid The total amount repaid (principal + interest)
     */
    event LoanRepaid(uint256 indexed loanId, uint256 totalRepaid);

    /**
     * @notice Emitted when a loan is liquidated
     * @param loanId The loan ID
     * @param liquidator The address of the liquidator
     * @param penalty The penalty amount paid to the liquidator
     */
    event Liquidated(
        uint256 indexed loanId,
        address liquidator,
        uint256 penalty
    );

    /**
     * @notice Emitted when a loan is funded
     * @param loanId The loan ID
     * @param amount The amount funded
     */
    event LoanFunded(uint256 indexed loanId, uint256 amount);

    /**
     * @notice Emitted when the origination fee is paid
     * @param loanId The loan ID
     * @param feeAmount The fee amount paid to the protocol
     */
    event OriginationFeePaid(uint256 indexed loanId, uint256 feeAmount);

    /**
     * @notice Emitted when protocol yield is withdrawn
     * @param lender The address of the protocol owner
     * @param amount The amount withdrawn
     */
    event YieldWithdrawn(address indexed lender, uint256 amount);

    /**
     * @notice Emitted for debugging purposes
     * @param message The debug message
     */
    event DebugLog(string message);

    /**
     * @notice Restricts function to only the borrower of a given loan
     * @param loanId The loan ID
     */
    modifier onlyBorrower(uint256 loanId) {
        if (msg.sender != loans[loanId].borrower)
            revert LoanManager__NotAuthorized();
        _;
    }

    /**
     * @notice Initializes the LoanManager contract
     * @param nft The address of the NFT contract
     * @param collateralVault The address of the CollateralVault contract
     * @param ccipRouter The address of the Chainlink CCIP router
     * @param usdc The address of the USDC token contract
     */
    constructor(
        address nft,
        address collateralVault,
        address ccipRouter,
        address usdc
    ) Ownable(msg.sender) {
        i_nft = IERC721(nft);
        i_ccipRouter = IRouterClient(ccipRouter);
        i_collateralVault = CollateralVault(collateralVault);
        i_usdc = IERC20(usdc);
    }

    /**
     * @notice Creates a new loan and deposits the NFT as collateral.
     * @param tokenId The NFT token ID to be used as collateral.
     * @param debt The loan amount requested (before fee).
     * @param apr The annual percentage rate for this loan (from AI risk model).
     */
    function createLoan(uint256 tokenId, uint256 debt, uint256 apr) external {
        emit DebugLog("createLoan: start");
        if (msg.sender == address(0)) revert LoanManager__InvalidSender();
        if (nftIsCollateral[tokenId])
            revert LoanManager__NFTAlreadyCollateral();
        nextLoanId++;
        uint256 fee = (debt * ORIGINATION_FEE_BPS) / PRECISION;
        uint256 netDebt = debt - fee;
        loans[nextLoanId] = Loan({
            loanId: nextLoanId,
            tokenId: tokenId,
            debt: netDebt,
            startTimestamp: block.timestamp,
            borrower: msg.sender,
            isActive: true,
            apr: apr
        });
        nftIsCollateral[tokenId] = true;
        emit DebugLog("createLoan: before USDC transfer");
        i_usdc.safeTransferFrom(msg.sender, address(this), fee);
        emit DebugLog("createLoan: after USDC transfer");
        protocolYield[owner()] += fee;
        emit OriginationFeePaid(nextLoanId, fee);
        emit DebugLog("createLoan: before NFT transfer");
        i_nft.transferFrom(msg.sender, address(this), tokenId);
        emit DebugLog("createLoan: after NFT transfer");
        emit DebugLog("createLoan: before depositNFT");
        i_collateralVault.depositNFT(tokenId, nextLoanId);
        emit DebugLog("createLoan: after depositNFT");
        emit LoanCreated(nextLoanId, tokenId, msg.sender, netDebt);
    }

    /**
     * @notice Funds a loan and sends a cross-chain message via Chainlink CCIP.
     * @param loanId The loan ID to fund.
     * @param amount The amount to fund (in ETH for CCIP).
     */
    function fundLoan(
        uint256 loanId,
        uint256 amount
    ) external payable onlyBorrower(loanId) {
        if (address(i_ccipRouter) == address(0))
            revert LoanManager__InvalidRouterAddress();
        if (msg.value != amount) revert LoanManager__InvalidAmount();
        // Track lender for this loan
        loanToLender[loanId] = msg.sender;
        // Transfer USDC to Avalanche vault
        i_usdc.safeTransferFrom(msg.sender, avalanceVaultAddress, amount);
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(avalanceVaultAddress),
            data: abi.encode(loanId, amount),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            feeToken: address(0), // Pay fees in native gas token (ETH)
            extraArgs: abi.encode(Client.EVMExtraArgsV1({gasLimit: 1e6}))
        });
        (bool success, ) = address(i_ccipRouter).call{value: msg.value}(
            abi.encodeWithSignature(
                "send((bytes,bytes,(address,uint256)[],address,bytes))",
                message
            )
        );
        if (!success) revert LoanManager__CCIPSendFailed();
        emit LoanFunded(loanId, amount);
    }

    /**
     * @notice Calculates interest owed for a loan (simple APR).
     * @param loanId The loan ID.
     * @return The interest owed (in USDC).
     */
    function calculateInterest(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        uint256 elapsed = block.timestamp - loan.startTimestamp;
        // Use SECONDS_PER_YEAR for precision, and 100 for percent
        return (loan.debt * loan.apr * elapsed) / (SECONDS_PER_YEAR * 100);
    }

    /**
     * @notice Repays a loan (principal + interest) and returns NFT to borrower.
     * @param loanId The loan ID to repay.
     */
    function repayLoan(uint256 loanId) external onlyBorrower(loanId) {
        Loan storage loan = loans[loanId];
        if (!loan.isActive) revert LoanManager__LoanNotActive();
        uint256 interest = calculateInterest(loanId);
        uint256 totalOwed = loan.debt + interest;
        loan.isActive = false;
        nftIsCollateral[loan.tokenId] = false;
        i_usdc.safeTransferFrom(msg.sender, address(this), totalOwed);
        // Split interest: 20% protocol, 80% lender
        uint256 protocolCut = interest / 5; // 20%
        uint256 lenderCut = interest - protocolCut;
        protocolYield[owner()] += protocolCut;
        lenderYield[loanToLender[loanId]] += lenderCut;
        i_nft.transferFrom(address(this), loan.borrower, loan.tokenId);
        emit LoanRepaid(loanId, totalOwed);
    }

    /**
     * @notice Checks if upkeep (liquidation) is needed for a given NFT collateral (Chainlink Automation).
     * @param checkData Encoded tokenId to check.
     * @return upkeepNeeded True if collateral value is below debt and loan is active.
     * @return performData The same checkData for use in performUpkeep.
     */
    function checkUpkeep(
        bytes calldata checkData
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        uint256 tokenId = abi.decode(checkData, (uint256));
        DepositNftTypes.DepositNft memory deposit = i_collateralVault
            .getDeposit(tokenId);
        uint256 loanId = deposit.loanId;
        Loan memory loan = loans[loanId];
        upkeepNeeded = deposit.collateralValue < loan.debt && loan.isActive;
        performData = checkData;
        return (upkeepNeeded, performData);
    }

    /**
     * @notice Performs upkeep (liquidation) if needed (Chainlink Automation).
     * @param performData Encoded tokenId to liquidate.
     */
    function performUpkeep(bytes calldata performData) external {
        if (msg.sender != address(i_ccipRouter))
            revert LoanManager__NotAuthorized();
        uint256 tokenId = abi.decode(performData, (uint256));
        DepositNftTypes.DepositNft memory deposit = i_collateralVault
            .getDeposit(tokenId);
        _liquidate(deposit.loanId);
    }

    /**
     * @notice Internal function to liquidate a loan and transfer NFT collateral
     * @param loanId The loan ID to liquidate
     */
    function _liquidate(uint256 loanId) internal {
        Loan storage loan = loans[loanId];
        if (!loan.isActive) revert LoanManager__LoanNotActive();
        uint256 penalty = (loan.debt * LIQUIDATION_PENALTY_BPS) / PRECISION;
        uint256 protocolShare = loan.debt - penalty;
        i_usdc.safeTransfer(msg.sender, penalty);
        protocolYield[owner()] += protocolShare;
        i_nft.transferFrom(address(this), msg.sender, loan.tokenId);
        loan.isActive = false;
        nftIsCollateral[loan.tokenId] = false;
        emit Liquidated(loanId, msg.sender, penalty);
    }

    /**
     * @notice Withdraws protocol yield (owner only).
     */
    function withdrawYield() external onlyOwner {
        uint256 amount = protocolYield[msg.sender];
        if (amount == 0) revert LoanManager__NoYieldToWithdraw();
        protocolYield[msg.sender] = 0;
        i_usdc.safeTransfer(msg.sender, amount);
        emit YieldWithdrawn(msg.sender, amount);
    }
}
