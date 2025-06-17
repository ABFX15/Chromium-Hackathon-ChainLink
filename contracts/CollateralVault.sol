// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {DepositNftTypes} from "./DepositNftTypes.sol";

/// @title CollateralVault
/// @author ABFX15
/// @notice Manages NFT collateral and property values for loans
/// @dev Integrates with PropertyOracle for RWA price updates
contract CollateralVault {
    using DepositNftTypes for DepositNftTypes.DepositNft;

    error CollateralVault__NotAuthorized();
    error CollateralVault__InvalidOracle();

    IERC721 public immutable i_nft;
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

    /// @notice Emitted when the appraised value of a property is updated
    /// @param tokenId The NFT token ID
    /// @param newValue The new appraised value
    event PropertyValueUpdated(uint256 tokenId, uint256 newValue);

    /// @notice Emitted when the oracle address is set
    /// @param oracle The address of the oracle contract
    event OracleSet(address oracle);

    /// @notice Initializes the CollateralVault contract
    /// @param nft The address of the NFT contract
    constructor(address nft) {
        i_nft = IERC721(nft);
    }

    /// @notice Restricts function to only the oracle address
    modifier onlyOracle() {
        if (msg.sender != oracle) revert CollateralVault__NotAuthorized();
        _;
    }

    /// @notice Sets the oracle address allowed to update property values
    /// @param _oracle The address of the oracle contract
    function setOracle(address _oracle) external /* onlyOwner */ {
        if (_oracle == address(0)) revert CollateralVault__InvalidOracle();
        oracle = _oracle;
        emit OracleSet(_oracle);
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
        emit PropertyValueUpdated(tokenId, newValue);
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
        i_nft.transferFrom(msg.sender, address(this), tokenId);
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

    /// @notice Returns the tokenId associated with a given loanId
    /// @param loanId The loan ID
    /// @return The NFT token ID
    function getTokenIdbyLoanId(
        uint256 loanId
    ) external view returns (uint256) {
        return loanIdToTokenId[loanId];
    }
}
