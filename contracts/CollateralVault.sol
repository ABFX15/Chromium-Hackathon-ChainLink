// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {DepositNftTypes} from "./DepositNftTypes.sol";

/// @title CollateralVault
/// @author ABFX15
/// @notice Manages NFT collateral and property values for loans
/// @dev Integrates with PropertyOracle for RWA price updates
contract CollateralVault {
    using DepositNftTypes for DepositNftTypes.DepositNft;

    error CollateralVault__NotAuthorized();

    IERC721 public immutable i_nft;
    AggregatorV3Interface public immutable i_priceFeed;
    address public oracle;

    /// @notice Mapping from tokenId to deposit struct
    mapping(uint256 => DepositNftTypes.DepositNft) public s_deposits;
    /// @notice Mapping from tokenId to appraised property value
    mapping(uint256 => uint256) public propertyValues;
    /// @notice Mapping from loanId to tokenId
    mapping(uint256 => uint256) public loanIdToTokenId;

    /// @notice Emitted when an NFT is deposited as collateral
    /// @param tokenId The NFT token ID
    /// @param loanId The associated loan ID
    /// @param value The appraised value at deposit
    /// @param timestamp The time of deposit
    /// @param borrower The address of the borrower
    event DepositNFT(
        uint256 tokenId,
        uint256 loanId,
        uint256 value,
        uint256 timestamp,
        address borrower
    );

    /// @notice Initializes the CollateralVault contract
    /// @param nft The address of the NFT contract
    /// @param priceFeed The address of the Chainlink price feed (legacy, not used for RWA)
    constructor(address nft, address priceFeed) {
        i_nft = IERC721(nft);
        i_priceFeed = AggregatorV3Interface(priceFeed);
    }

    /// @notice Restricts function to only the oracle address
    modifier onlyOracle() {
        if (msg.sender != oracle) revert CollateralVault__NotAuthorized();
        _;
    }

    /// @notice Sets the oracle address allowed to update property values
    /// @param _oracle The address of the oracle contract
    function setOracle(address _oracle) external /* onlyOwner */ {
        // TODO: Add onlyOwner modifier for production
        oracle = _oracle;
    }

    /// @notice Updates the appraised value of a property (NFT)
    /// @dev Only callable by the oracle
    /// @param tokenId The NFT token ID
    /// @param newValue The new appraised value
    function updatePropertyValue(
        uint256 tokenId,
        uint256 newValue
    ) external onlyOracle {
        propertyValues[tokenId] = newValue;
    }

    /// @notice Deposits an NFT as collateral and links it to a loan
    /// @param tokenId The NFT token ID
    /// @param loanId The associated loan ID
    function depositNFT(uint256 tokenId, uint256 loanId) external {
        uint256 value = _getCollateralValue(tokenId);
        s_deposits[tokenId] = DepositNftTypes.DepositNft({
            tokenId: tokenId,
            loanId: loanId,
            collateralValue: value,
            timestamp: block.timestamp,
            borrower: msg.sender,
            isActive: true
        });
        loanIdToTokenId[loanId] = tokenId;
        emit DepositNFT(tokenId, loanId, value, block.timestamp, msg.sender);
    }

    /// @notice Returns the deposit struct for a given tokenId
    /// @param tokenId The NFT token ID
    /// @return The DepositNft struct
    function getDepositNft(
        uint256 tokenId
    ) external view returns (DepositNftTypes.DepositNft memory) {
        return s_deposits[tokenId];
    }

    /// @notice Returns the appraised collateral value for a given tokenId
    /// @param tokenId The NFT token ID
    /// @return The appraised value
    function _getCollateralValue(
        uint256 tokenId
    ) internal view returns (uint256) {
        return propertyValues[tokenId];
    }

    /// @notice Placeholder for Chainlink Automation checkUpkeep
    /// @dev Always returns true for demonstration
    function checkUpkeep(
        bytes calldata checkData
    ) external pure returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = true;
        performData = "";
    }

    /// @notice Placeholder for Chainlink Automation performUpkeep
    /// @dev Not implemented
    function performUpkeep(bytes calldata performData) external {
        // TODO: Implement performUpkeep
    }

    /// @notice Returns the tokenId associated with a given loanId
    /// @param loanId The loan ID
    /// @return The NFT token ID
    function getTokenIdbyLoanId(
        uint256 loanId
    ) external view returns (uint256) {
        return loanIdToTokenId[loanId];
    }
}
