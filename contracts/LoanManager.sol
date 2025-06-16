// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {CollateralVault} from "./CollateralVault.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {DepositNftTypes} from "./DepositNftTypes.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

/// @title LoanManager
/// @author ABFX15
/// @notice Manages loans backed by NFT collateral and integrates with Chainlink CCIP for cross-chain messaging
/// @dev Interacts with CollateralVault for collateral management and PropertyOracle for RWA price updates
contract LoanManager is AutomationCompatibleInterface {
    error LoanManager__LoanNotActive();
    error LoanManager__InvalidAmount();
    error LoanManager__CCIPSendFailed();

    IRouterClient public immutable i_ccipRouter;
    IERC721 public immutable i_nft;
    CollateralVault public immutable i_collateralVault;
    using DepositNftTypes for DepositNftTypes.DepositNft;

    struct Loan {
        uint256 loanId;
        uint256 tokenId; // NFT used as collateral
        uint256 debt;
        uint256 startTimestamp;
        address borrower;
        bool isActive;
    }
    mapping(uint256 => Loan) public loans; // loanId => Loan
    uint256 public nextLoanId;

    /// @notice Emitted when a new loan is created
    /// @param loanId The loan ID
    /// @param tokenId The NFT token ID used as collateral
    /// @param borrower The address of the borrower
    /// @param debt The loan amount
    event LoanCreated(
        uint256 loanId,
        uint256 tokenId,
        address borrower,
        uint256 debt
    );

    /// @notice The address of the Avalanche vault for cross-chain operations
    address public avalanceVaultAddress;
    /// @notice The address of the USDC token contract
    address public USDC_ADDRESS;

    /// @notice Initializes the LoanManager contract
    /// @param nft The address of the NFT contract
    /// @param collateralVault The address of the CollateralVault contract
    constructor(address nft, address collateralVault) {
        i_nft = IERC721(nft);
        i_collateralVault = CollateralVault(collateralVault);
    }

    /// @notice Creates a new loan and deposits the NFT as collateral
    /// @param tokenId The NFT token ID to be used as collateral
    /// @param debt The loan amount
    function createLoan(uint256 tokenId, uint256 debt) external {
        nextLoanId++;
        loans[nextLoanId] = Loan({
            loanId: nextLoanId,
            tokenId: tokenId,
            debt: debt,
            startTimestamp: block.timestamp,
            borrower: msg.sender,
            isActive: true
        });

        i_collateralVault.depositNFT(tokenId, nextLoanId);
        emit LoanCreated(nextLoanId, tokenId, msg.sender, debt);
    }

    /// @notice Checks if upkeep is needed for a given NFT collateral (Chainlink Automation)
    /// @param checkData Encoded tokenId to check
    /// @return upkeepNeeded True if collateral value is below debt and loan is active
    /// @return performData The same checkData for use in performUpkeep
    function checkUpkeep(
        bytes calldata checkData
    ) external view returns (bool upkeepNeeded, bytes memory performData) {
        uint256 tokenId = abi.decode(checkData, (uint256));
        DepositNftTypes.DepositNft memory deposit = i_collateralVault
            .getDepositNft(tokenId);
        uint256 loanId = deposit.loanId;
        Loan memory loan = loans[loanId];
        upkeepNeeded = deposit.collateralValue < loan.debt && loan.isActive;
        performData = checkData;
        return (upkeepNeeded, performData);
    }

    /// @notice Performs upkeep (liquidation) if needed (Chainlink Automation)
    /// @param performData Encoded tokenId to liquidate
    function performUpkeep(bytes calldata performData) external {
        uint256 tokenId = abi.decode(performData, (uint256));
        DepositNftTypes.DepositNft memory deposit = i_collateralVault
            .getDepositNft(tokenId);
        _liquidate(deposit.loanId);
    }

    /// @notice Funds a loan and sends a cross-chain message via Chainlink CCIP
    /// @param loanId The loan ID to fund
    /// @param amount The amount to fund
    function fundLoan(uint256 loanId, uint256 amount) external payable {
        if (msg.value != amount) revert LoanManager__InvalidAmount();
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(avalanceVaultAddress),
            data: abi.encode(loanId, amount),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            feeToken: USDC_ADDRESS,
            extraArgs: abi.encode(Client.EVMExtraArgsV1({gasLimit: 1000000}))
        });

        (bool success, ) = address(i_ccipRouter).call{value: msg.value}(
            abi.encodeWithSignature(
                "send((bytes,bytes,(address,uint256)[],address,bytes))",
                message
            )
        );
        if (!success) revert LoanManager__CCIPSendFailed();
    }

    /// @notice Internal function to liquidate a loan and transfer NFT collateral
    /// @param loanId The loan ID to liquidate
    function _liquidate(uint256 loanId) internal {
        Loan storage loan = loans[loanId];
        if (!loan.isActive) revert LoanManager__LoanNotActive();
        loan.isActive = false;
        i_nft.transferFrom(address(this), msg.sender, loan.tokenId);
    }
}
