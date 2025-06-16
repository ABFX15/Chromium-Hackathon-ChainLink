// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {CollateralVault} from "./CollateralVault.sol";
import {ChainlinkClient} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {Chainlink} from "@chainlink/contracts/src/v0.8/Chainlink.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

/// @title PropertyOracle
/// @author ABFX15
/// @notice Fetches and updates real-world property values for NFTs using Chainlink oracles
/// @dev Integrates with CollateralVault to update on-chain collateral values
contract PropertyOracle is ChainlinkClient, ConfirmedOwner, FunctionsClient {
    using Chainlink for Chainlink.Request;
    using FunctionsRequest for FunctionsRequest.Request;

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
    constructor(
        address router,
        address _collateralVault
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
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
    /// @param args The arguments for the Chainlink Functions request
    /// @param secrets The secrets for the Chainlink Functions request
    /// @param subscriptionId The subscription ID for the Chainlink Functions request
    /// @param gasLimit The gas limit for the Chainlink Functions request
    /// @param donId The DON ID for the Chainlink Functions request
    /// @param source The source for the Chainlink Functions request
    /// @return requestId The Chainlink request ID
    function requestPropertyValue(
        uint256 tokenId,
        string[] calldata args,
        bytes calldata secrets,
        uint64 subscriptionId,
        uint32 gasLimit,
        bytes32 donId,
        string calldata source
    ) external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequest(
            FunctionsRequest.Location.Inline,
            FunctionsRequest.CodeLanguage.JavaScript,
            source
        );
        req.setArgs(args);
        bytes memory requestData = req.encodeCBOR();
        requestId = _sendRequest(requestData, subscriptionId, gasLimit, donId);
        requestIdToTokenId[requestId] = tokenId;
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

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory /* err */
    ) internal override {
        uint256 value = abi.decode(response, (uint256));
        uint256 tokenId = requestIdToTokenId[requestId];
        collateralVault.updatePropertyValue(tokenId, value);
    }
}
