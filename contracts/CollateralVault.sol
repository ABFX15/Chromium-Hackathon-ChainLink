// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {DepositNftTypes} from "./DepositNftTypes.sol";

/**
 * @title CollateralVault
 * @author ABFX15
 * @notice Holds NFT collateral for loans, tracks deposit details, and manages property values.
 * @dev Only the LoanManager can deposit/release NFTs. Only the Oracle can update property values.
 */
contract CollateralVault is Ownable {
    using DepositNftTypes for DepositNftTypes.DepositNft;

    // Custom Errors
    error CollateralVault__NotAuthorized();
    error CollateralVault__NFTNotDeposited();
    error CollateralVault__LoanStillActive();
    error CollateralVault__NotNFTOwner();
    error CollateralVault__PropertyValueNotSet();
    error CollateralVault__InvalidNFT();
    error CollateralVault__InvalidOracleAddress();
    error CollateralVault__InvalidLoanManagerAddress();

    // Immutables
    IERC721 public immutable i_nft;

    // State Variables
    address public oracle;
    address public loanManager;

    // Mappings
    mapping(uint256 => DepositNftTypes.DepositNft) public s_deposits;
    mapping(uint256 => uint256) public propertyValues;
    mapping(uint256 => uint256) public loanIdToTokenId;
    mapping(uint256 => bool) public activeLoans;

    // Events
    event DepositNFT(
        uint256 indexed tokenId,
        uint256 indexed loanId,
        uint256 value,
        uint256 timestamp,
        address borrower
    );
    event PropertyValueUpdated(uint256 indexed tokenId, uint256 newValue);
    event OracleSet(address indexed oracle);
    event LoanManagerSet(address indexed manager);
    event NFTReturned(uint256 indexed tokenId, address indexed recipient);

    // Constants
    uint256 public constant MIN_PROPERTY_VALUE = 1;

    // Modifiers
    modifier onlyOracle() {
        if (msg.sender != oracle) revert CollateralVault__NotAuthorized();
        _;
    }

    modifier onlyLoanManager() {
        if (msg.sender != loanManager) revert CollateralVault__NotAuthorized();
        _;
    }

    constructor(address nft) Ownable(msg.sender) {
        if (nft == address(0)) revert CollateralVault__InvalidNFT();
        i_nft = IERC721(nft);
    }

    /**
     * @notice Sets the oracle address (owner only).
     * @param _oracle The new oracle address.
     */
    function setOracle(address _oracle) external onlyOwner {
        if (_oracle == address(0))
            revert CollateralVault__InvalidOracleAddress();
        oracle = _oracle;
        emit OracleSet(_oracle);
    }

    /**
     * @notice Sets the loan manager address (owner only).
     * @param _loanManager The new loan manager address.
     */
    function setLoanManager(address _loanManager) external onlyOwner {
        if (_loanManager == address(0))
            revert CollateralVault__InvalidLoanManagerAddress();
        loanManager = _loanManager;
        emit LoanManagerSet(_loanManager);
    }

    /**
     * @notice Updates the property value for a token (oracle only).
     * @param tokenId The NFT token ID.
     * @param newValue The new property value.
     */
    function updatePropertyValue(
        uint256 tokenId,
        uint256 newValue
    ) external onlyOracle {
        if (!activeLoans[tokenId]) revert CollateralVault__NFTNotDeposited();
        if (newValue < MIN_PROPERTY_VALUE)
            revert CollateralVault__PropertyValueNotSet();
        propertyValues[tokenId] = newValue;
        emit PropertyValueUpdated(tokenId, newValue);
    }

    /**
     * @notice Deposits an NFT as collateral (loan manager only).
     * @param tokenId The NFT token ID.
     * @param loanId The associated loan ID.
     */
    function depositNFT(
        uint256 tokenId,
        uint256 loanId
    ) external onlyLoanManager {
        if (activeLoans[tokenId]) revert CollateralVault__LoanStillActive();

        uint256 value = propertyValues[tokenId]; // Gets preset value

        s_deposits[tokenId] = DepositNftTypes.DepositNft({
            tokenId: tokenId,
            loanId: loanId,
            collateralValue: value,
            timestamp: block.timestamp,
            borrower: msg.sender,
            isActive: true
        });

        loanIdToTokenId[loanId] = tokenId;
        activeLoans[tokenId] = true;

        if (i_nft.ownerOf(tokenId) != msg.sender)
            revert CollateralVault__NotNFTOwner();

        i_nft.transferFrom(msg.sender, address(this), tokenId);

        emit DepositNFT(tokenId, loanId, value, block.timestamp, msg.sender);
    }

    /**
     * @notice Releases an NFT after loan repayment or liquidation (loan manager only).
     * @param tokenId The NFT token ID.
     */
    function releaseNFT(uint256 tokenId) external onlyLoanManager {
        DepositNftTypes.DepositNft memory deposit = s_deposits[tokenId];
        if (!deposit.isActive) revert CollateralVault__NFTNotDeposited();

        delete s_deposits[tokenId];
        activeLoans[tokenId] = false;
        i_nft.transferFrom(address(this), deposit.borrower, tokenId);

        emit NFTReturned(tokenId, deposit.borrower);
    }

    /**
     * @notice Returns deposit details for a given tokenId.
     * @param tokenId The NFT token ID.
     * @return The deposit struct.
     */
    function getDeposit(
        uint256 tokenId
    ) external view returns (DepositNftTypes.DepositNft memory) {
        return s_deposits[tokenId];
    }

    function getTokenIdByLoan(uint256 loanId) external view returns (uint256) {
        return loanIdToTokenId[loanId];
    }

    /**
     * @dev TESTING ONLY: Allows the owner to set property values directly. Remove before production!
     */
    function setPropertyValueTest(
        uint256 tokenId,
        uint256 value
    ) external onlyOwner {
        propertyValues[tokenId] = value;
        emit PropertyValueUpdated(tokenId, value);
    }
}
