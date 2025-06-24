// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

contract MockRouter {
    // Minimal struct to satisfy the interface for testing
    struct EVM2AnyMessage {
        bytes receiver;
        bytes data;
        EVMTokenAmount[] tokenAmounts;
        address feeToken;
        bytes extraArgs;
    }
    struct EVMTokenAmount {
        address token;
        uint256 amount;
    }

    function getFee(
        uint64,
        EVM2AnyMessage memory
    ) public pure returns (uint256) {
        return 0;
    }

    function ccipSend(
        uint64,
        EVM2AnyMessage memory
    ) public payable returns (bytes32) {
        return bytes32(0);
    }

    // Allow contract to receive ETH
    receive() external payable {}
}
