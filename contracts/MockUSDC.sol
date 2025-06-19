// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    // Custom Errors
    error MockUSDC__InvalidAmount();
    error MockUSDC__InvalidRecipient();

    constructor(uint256 initialSupply) ERC20("Mock USDC", "mUSDC") {
        if (initialSupply == 0) revert MockUSDC__InvalidAmount();
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) public {
        if (to == address(0)) revert MockUSDC__InvalidRecipient();
        if (amount == 0) revert MockUSDC__InvalidAmount();
        _mint(to, amount);
    }
}
