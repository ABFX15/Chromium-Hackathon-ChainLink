// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CrossChainLiquidityPool
 * @author ABFX15
 * @notice Manages liquidity across multiple chains for lending protocol.
 * @dev Allows adding/removing liquidity, supports cross-chain messaging via Chainlink CCIP.
 */
contract CrossChainLiquidityPool is Ownable {
    using SafeERC20 for IERC20;

    // Custom Errors
    error CrossChainLiquidityPool__InvalidAmount();
    error CrossChainLiquidityPool__InsufficientLiquidity();
    error CrossChainLiquidityPool__InvalidChain();
    error CrossChainLiquidityPool__TransferFailed();
    error CrossChainLiquidityPool__InvalidVault();
    error CrossChainLiquidityPool__ChainNotSupported();
    error CrossChainLiquidityPool__InsufficientBalance();

    // State variables
    IRouterClient public immutable i_ccipRouter;
    IERC20 public immutable i_usdc;

    uint256 private constant BASIS_POINTS_DENOMINATOR = 1e4;
    uint256 private constant DEFAULT_GAS_LIMIT = 2e5;

    struct ChainLiquidity {
        uint256 totalLiquidity;
        uint256 availableLiquidity;
        uint256 utilizationRate;
        mapping(address => uint256) lenderPositions;
        bool isSupported;
    }

    mapping(uint64 => ChainLiquidity) public chainLiquidity;
    mapping(uint64 => address) public chainVaults;

    // Events
    event LiquidityAdded(
        address indexed lender,
        uint64 indexed chainSelector,
        uint256 amount,
        bytes32 messageId
    );
    event LiquidityWithdrawn(
        address indexed lender,
        uint64 indexed chainSelector,
        uint256 amount
    );
    event ChainAdded(uint64 chainSelector, address vault);
    event LoanFunded(uint64 chainSelector, uint256 loanId, uint256 amount);

    constructor(address ccipRouter, address usdc) Ownable(msg.sender) {
        if (ccipRouter == address(0))
            revert CrossChainLiquidityPool__InvalidChain();
        if (usdc == address(0)) revert CrossChainLiquidityPool__InvalidVault();

        i_ccipRouter = IRouterClient(ccipRouter);
        i_usdc = IERC20(usdc);
    }

    /**
     * @notice Adds a supported chain and its vault address.
     * @dev Only callable by the owner. Reverts if chainSelector or vault is zero.
     * @param chainSelector The chain selector for the supported chain.
     * @param vault The vault address for the chain.
     */
    function addSupportedChain(
        uint64 chainSelector,
        address vault
    ) external onlyOwner {
        if (chainSelector == 0) revert CrossChainLiquidityPool__InvalidChain();
        if (vault == address(0)) revert CrossChainLiquidityPool__InvalidVault();

        chainLiquidity[chainSelector].isSupported = true;
        chainVaults[chainSelector] = vault;
        emit ChainAdded(chainSelector, vault);
    }

    /**
     * @notice Adds liquidity for a specific chain.
     * @dev Transfers USDC from sender, updates liquidity, and sends cross-chain message.
     * @param chainSelector The chain selector to add liquidity to.
     */
    function addLiquidity(uint64 chainSelector) external payable {
        if (!chainLiquidity[chainSelector].isSupported)
            revert CrossChainLiquidityPool__ChainNotSupported();
        if (msg.value == 0) revert CrossChainLiquidityPool__InvalidAmount();

        uint256 amount = msg.value;
        i_usdc.safeTransferFrom(msg.sender, address(this), amount);

        ChainLiquidity storage chain = chainLiquidity[chainSelector];
        chain.totalLiquidity += amount;
        chain.availableLiquidity += amount;
        chain.lenderPositions[msg.sender] += amount;

        // Calculate utilization rate
        chain.utilizationRate =
            ((chain.totalLiquidity - chain.availableLiquidity) *
                BASIS_POINTS_DENOMINATOR) /
            chain.totalLiquidity;

        // Send liquidity to destination chain
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(chainVaults[chainSelector]),
            data: abi.encode(amount),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: DEFAULT_GAS_LIMIT})
            )
        });

        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_usdc),
            amount: amount
        });

        IERC20(address(i_usdc)).forceApprove(address(i_ccipRouter), amount);
        bytes32 messageId = i_ccipRouter.ccipSend{value: msg.value}(
            chainSelector,
            message
        );

        emit LiquidityAdded(msg.sender, chainSelector, amount, messageId);
    }

    /**
     * @notice Withdraws liquidity for a specific chain.
     * @dev Transfers USDC back to the lender and updates liquidity.
     * @param chainSelector The chain selector to withdraw from.
     * @param amount The amount of liquidity to withdraw.
     */
    function withdrawLiquidity(uint64 chainSelector, uint256 amount) external {
        ChainLiquidity storage chain = chainLiquidity[chainSelector];
        if (chain.lenderPositions[msg.sender] < amount)
            revert CrossChainLiquidityPool__InsufficientBalance();
        if (chain.availableLiquidity < amount)
            revert CrossChainLiquidityPool__InsufficientLiquidity();

        chain.totalLiquidity -= amount;
        chain.availableLiquidity -= amount;
        chain.lenderPositions[msg.sender] -= amount;

        // Recalculate utilization rate
        if (chain.totalLiquidity > 0) {
            chain.utilizationRate =
                ((chain.totalLiquidity - chain.availableLiquidity) *
                    BASIS_POINTS_DENOMINATOR) /
                chain.totalLiquidity;
        } else {
            chain.utilizationRate = 0;
        }

        IERC20(address(i_usdc)).safeTransfer(msg.sender, amount);

        emit LiquidityWithdrawn(msg.sender, chainSelector, amount);
    }

    /**
     * @notice Gets the lender's position for a specific chain.
     * @param lender The address of the lender.
     * @param chainSelector The chain selector to query.
     * @return The amount of liquidity provided by the lender.
     */
    function getLenderPosition(
        address lender,
        uint64 chainSelector
    ) external view returns (uint256) {
        return chainLiquidity[chainSelector].lenderPositions[lender];
    }

    /**
     * @notice Gets liquidity stats for a specific chain.
     * @param chainSelector The chain selector to query.
     * @return totalLiquidity The total liquidity for the chain.
     * @return availableLiquidity The available liquidity for the chain.
     * @return utilizationRate The utilization rate for the chain.
     */
    function getChainLiquidity(
        uint64 chainSelector
    )
        external
        view
        returns (
            uint256 totalLiquidity,
            uint256 availableLiquidity,
            uint256 utilizationRate
        )
    {
        ChainLiquidity storage chain = chainLiquidity[chainSelector];
        return (
            chain.totalLiquidity,
            chain.availableLiquidity,
            chain.utilizationRate
        );
    }

    /**
     * @notice Withdraws all Ether from the contract to the owner.
     * @dev Only callable by the owner. Reverts if balance is zero or transfer fails.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert CrossChainLiquidityPool__InsufficientBalance();

        (bool success, ) = msg.sender.call{value: balance}("");
        if (!success) revert CrossChainLiquidityPool__TransferFailed();
    }

    /**
     * @notice Fallback function to receive Ether.
     */
    receive() external payable {}
}
