// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockAavePool {
    IERC20 public usdc;
    mapping(address => uint256) public balances;

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function supply(
        address,
        uint256 amount,
        address onBehalfOf,
        uint16
    ) external {
        balances[onBehalfOf] += amount;
        usdc.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(
        address,
        uint256 amount,
        address to
    ) external returns (uint256) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        usdc.transfer(to, amount);
        return amount;
    }

    // Test helper to set balance for an address
    function setBalance(address user, uint256 amount) external {
        balances[user] = amount;
    }
}
