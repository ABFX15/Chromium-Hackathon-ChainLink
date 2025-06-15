// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {DepositNftTypes} from "./DepositNftTypes.sol";

contract CollateralVault {
    using DepositNftTypes for DepositNftTypes.DepositNft;
    
    error CollateralVault__NotAuthorized();

    IERC721 public immutable i_nft;
    AggregatorV3Interface public immutable i_priceFeed;
    address public oracle;

    mapping(uint256 => DepositNftTypes.DepositNft) public s_deposits;
    mapping(uint256 => uint256) public propertyValues; // tokenId => appraised value

    event DepositNFT(uint256 tokenId, uint256 loanId, uint256 value, uint256 timestamp, address borrower);

    constructor(address nft, address priceFeed) {
        i_nft = IERC721(nft);
        i_priceFeed = AggregatorV3Interface(priceFeed);
    }

    modifier onlyOracle() {
        if (msg.sender != oracle) revert CollateralVault__NotAuthorized();
        _;
    }

    function setOracle(address _oracle) external /* onlyOwner */ {
        // TODO: Add onlyOwner modifier for production
        oracle = _oracle;
    }

    function updatePropertyValue(
        uint256 tokenId,
        uint256 newValue
    ) external onlyOracle {
        propertyValues[tokenId] = newValue;
    }

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
        emit DepositNFT(tokenId, loanId, value, block.timestamp, msg.sender);
    }

    function getDepositNft(
        uint256 tokenId
    ) external view returns (DepositNftTypes.DepositNft memory) {
        return s_deposits[tokenId];
    }

    function _getCollateralValue(
        uint256 tokenId
    ) internal view returns (uint256) {
        return propertyValues[tokenId];
    }

    function checkUpkeep(
        bytes calldata checkData
    ) external pure returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = true;
        performData = "";
    }

    function performUpkeep(bytes calldata performData) external {
        // TODO: Implement performUpkeep
    }

    function getTokenIdbyLoanId(uint256 loanId) external view returns (uint256) {
        return s_deposits[loanId].tokenId;
    }
}
