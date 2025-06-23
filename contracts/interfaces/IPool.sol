// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

/**
 * @title IPool
 * @author Aave
 * @dev Minimal interface for the Aave V3 Pool.
 * Contains the essential functions for supplying and withdrawing assets.
 */
interface IPool {
    /**
     * @dev Supplies an asset to the protocol to earn interest.
     * @param asset The address of the asset to supply
     * @param amount The amount to be supplied
     * @param onBehalfOf The address that will receive the aTokens
     * @param referralCode A referral code for Aave referral program
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    /**
     * @dev Withdraws an asset from the protocol.
     * @param asset The address of the asset to withdraw
     * @param amount The amount to be withdrawn
     * @param to The address that will receive the withdrawn asset
     * @return The final amount withdrawn
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256);
}
