// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyOracle
 * @author ABFX15
 * @notice Stores and provides property valuations for NFTs.
 */
contract PropertyOracle is Ownable {
    mapping(uint256 => uint256) public propertyValues;

    event PropertyValueUpdated(uint256 indexed tokenId, uint256 newValue);

    constructor() Ownable(msg.sender) {}

    function setPropertyValue(
        uint256 tokenId,
        uint256 value
    ) external onlyOwner {
        propertyValues[tokenId] = value;
        emit PropertyValueUpdated(tokenId, value);
    }

    function getPropertyValue(uint256 tokenId) external view returns (uint256) {
        return propertyValues[tokenId];
    }
}
