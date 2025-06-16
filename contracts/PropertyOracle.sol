// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./CollateralVault.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/// @title PropertyOracle
/// @author ABFX15
/// @notice Fetches and updates real-world property values for NFTs using Chainlink oracles
/// @dev Integrates with CollateralVault to update on-chain collateral values
contract PropertyOracle is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    error PropertyOracle__WithdrawFailed();

    // Chainlink config (Sepolia testnet)
    address private constant LINK_TOKEN =
        0x779877A7B0D9E8603169DdbD7836e478b4624789;
    address private constant ORACLE =
        0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD;
    bytes32 private constant JOB_ID = "ca98366cc7314957b8c012c72f05aeeb"; // Functions job ID
    uint256 private constant FEE = 0.1 * 10 ** 18; // 0.1 LINK

    /// @notice Mapping from tokenId to last fetched property value
    mapping(uint256 => uint256) public tokenIdToValue;
    /// @notice Mapping from Chainlink requestId to tokenId
    mapping(bytes32 => uint256) private requestIdToTokenId;

    /// @notice Emitted when a property value is requested from the oracle
    /// @param requestId The Chainlink request ID
    /// @param tokenId The NFT token ID
    event PropertyValueRequested(bytes32 indexed requestId, uint256 tokenId);
    /// @notice Emitted when a property value is updated on-chain
    /// @param tokenId The NFT token ID
    /// @param value The new property value
    event PropertyValueUpdated(uint256 tokenId, uint256 value);

    /// @notice The CollateralVault contract to update property values
    CollateralVault public collateralVault;

    /// @notice Initializes the PropertyOracle contract
    /// @param _collateralVault The address of the CollateralVault contract
    constructor(address _collateralVault) ConfirmedOwner(msg.sender) {
        setChainlinkToken(LINK_TOKEN);
        setChainlinkOracle(ORACLE);
        collateralVault = CollateralVault(_collateralVault);
    }

    /// @notice Sets the CollateralVault contract address
    /// @param _collateralVault The address of the CollateralVault contract
    function setCollateralVault(address _collateralVault) external onlyOwner {
        collateralVault = CollateralVault(_collateralVault);
    }

    /// @notice Requests the property value for a given tokenId from the Chainlink oracle
    /// @param tokenId The NFT token ID
    /// @return requestId The Chainlink request ID
    function requestPropertyValue(
        uint256 tokenId
    ) external onlyOwner returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            JOB_ID,
            address(this),
            this.fulfill.selector
        );

        // Set the request parameters
        req.add("method", "GET");
        req.add(
            "url",
            string.concat(
                "https://your-api-endpoint.com/properties/",
                _toString(tokenId)
            )
        );
        req.add("headers", "['content-type', 'application/json']");
        req.add("path", "value"); // JSON path to extract value

        // Send the request
        requestId = sendChainlinkRequest(req, FEE);
        requestIdToTokenId[requestId] = tokenId;

        emit PropertyValueRequested(requestId, tokenId);
    }

    /// @notice Callback function for Chainlink oracle to fulfill property value requests
    /// @param requestId The Chainlink request ID
    /// @param value The property value returned by the oracle
    function fulfill(
        bytes32 requestId,
        uint256 value
    ) external recordChainlinkFulfillment(requestId) {
        uint256 tokenId = requestIdToTokenId[requestId];
        tokenIdToValue[tokenId] = value;
        collateralVault.updatePropertyValue(tokenId, value);
        emit PropertyValueUpdated(tokenId, value);
    }

    /// @notice Converts a uint256 to its decimal string representation
    /// @param value The value to convert
    /// @return The string representation
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /// @notice Withdraws LINK tokens from the contract
    function withdrawLink() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        if (!link.transfer(msg.sender, link.balanceOf(address(this))))
            revert PropertyOracle__WithdrawFailed();
    }
}
