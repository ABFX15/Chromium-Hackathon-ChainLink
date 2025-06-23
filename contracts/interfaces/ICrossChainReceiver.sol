// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";

/**
 * @title ICrossChainReceiver
 * @author Chainlink
 * @notice Interface for contracts that receive messages via CCIP.
 * This ensures the contract has the expected `ccipReceive` function.
 */
abstract contract ICrossChainReceiver {
    address private immutable i_router;

    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        string text
    );

    modifier onlyRouter() {
        if (msg.sender != i_router) revert("Sender is not the router");
        _;
    }

    constructor(address router) {
        i_router = router;
    }

    function getRouter() public view returns (address) {
        return i_router;
    }

    /**
     * @dev The entry point for the CCIP router to deliver messages.
     * Overridden by child contracts to handle the received message.
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal virtual;
}
