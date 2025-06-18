// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import {CollateralVault} from "./CollateralVault.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title PropertyOracle
 * @author ABFX15
 * @notice Fetches and updates property values using Chainlink Functions, updating CollateralVault.
 * @dev Only the owner can request valuations or update the vault address. Integrates with Chainlink Functions and CollateralVault.
 */
contract PropertyOracle is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;
    using SafeERC20 for IERC20;

    // Custom Errors
    error PropertyOracle__InvalidCollateralVault();
    error PropertyOracle__InvalidRequest();
    error PropertyOracle__InvalidTokenId();

    // Chainlink Configuration
    address public immutable LINK_TOKEN;
    uint64 public subscriptionId;

    // State Variables
    CollateralVault public collateralVault;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    mapping(uint256 => uint256) public tokenValues;
    mapping(uint256 => uint256) public lastUpdated;

    // Events
    event ValueRequested(bytes32 indexed requestId, uint256 tokenId);
    event ValueUpdated(uint256 indexed tokenId, uint256 value);
    event SubscriptionIdSet(uint64 subscriptionId);

    /**
     * @notice Initializes the oracle
     * @param router Chainlink Functions router address
     * @param linkToken LINK token address
     * @param _collateralVault CollateralVault contract address
     */
    constructor(
        address router,
        address linkToken,
        address _collateralVault
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        if (_collateralVault == address(0))
            revert PropertyOracle__InvalidCollateralVault();
        LINK_TOKEN = linkToken;
        collateralVault = CollateralVault(_collateralVault);
    }

    /**
     * @notice Sets the Chainlink Functions subscription ID.
     * @param _subscriptionId The subscription ID.
     */
    function setSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        subscriptionId = _subscriptionId;
        emit SubscriptionIdSet(_subscriptionId);
    }

    /**
     * @notice Requests a property valuation from Chainlink Functions.
     * @param tokenId The NFT token ID.
     * @param source The JavaScript source code for the request.
     * @param secrets Encrypted secrets (if any).
     * @param args Additional arguments for the request.
     * @param gasLimit Gas limit for fulfillment.
     * @param donId DON ID for the request.
     * @return requestId The Chainlink request ID.
     */
    function requestValuation(
        uint256 tokenId,
        string calldata source,
        bytes calldata secrets,
        string[] calldata args,
        uint32 gasLimit,
        bytes32 donId
    ) external onlyOwner returns (bytes32) {
        if (tokenId == 0) revert PropertyOracle__InvalidTokenId();

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        if (secrets.length > 0) {
            req.addSecretsReference(secrets);
        }
        if (args.length > 0) {
            req.setArgs(args);
        }

        bytes32 currentRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );

        requestIdToTokenId[currentRequestId] = tokenId;
        emit ValueRequested(currentRequestId, tokenId);
        return currentRequestId;
    }

    /**
     * @notice Chainlink callback for fulfilled requests
     * @param requestId The request ID
     * @param response Encoded response from Functions
     * @param err Encoded error (if any)
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (err.length > 0) {
            revert PropertyOracle__InvalidRequest();
        }

        uint256 tokenId = requestIdToTokenId[requestId];
        if (tokenId == 0) revert PropertyOracle__InvalidTokenId();

        uint256 value = abi.decode(response, (uint256));
        tokenValues[tokenId] = value;
        lastUpdated[tokenId] = block.timestamp;

        collateralVault.updatePropertyValue(tokenId, value);
        emit ValueUpdated(tokenId, value);
    }

    /**
     * @notice Updates the CollateralVault address (owner only).
     * @param newVault The new CollateralVault address.
     */
    function updateCollateralVault(address newVault) external onlyOwner {
        if (newVault == address(0))
            revert PropertyOracle__InvalidCollateralVault();
        collateralVault = CollateralVault(newVault);
    }

    /**
     * @notice Withdraws LINK tokens from the contract (owner only).
     * @param recipient The recipient address.
     * @param amount The amount to withdraw.
     */
    function withdrawLink(
        address recipient,
        uint256 amount
    ) external onlyOwner {
        IERC20(LINK_TOKEN).safeTransfer(recipient, amount);
    }
}
