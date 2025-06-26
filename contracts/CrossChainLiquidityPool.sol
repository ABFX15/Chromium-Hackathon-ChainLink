// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CrossChainLiquidityPool
 * @author ABFX15
 * @notice Manages liquidity across multiple chains for lending protocol.
 * @dev Allows adding/removing liquidity, supports cross-chain messaging via Chainlink CCIP.
 */
contract CrossChainLiquidityPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Custom Errors
    error CrossChainLiquidityPool__InvalidAmount();
    error CrossChainLiquidityPool__InsufficientLiquidity();
    error CrossChainLiquidityPool__InvalidChain();
    error CrossChainLiquidityPool__TransferFailed();
    error CrossChainLiquidityPool__InvalidVault();
    error CrossChainLiquidityPool__ChainNotSupported();
    error CrossChainLiquidityPool__InsufficientBalance();
    error CrossChainLiquidityPool__UnauthorizedCaller();
    error CrossChainLiquidityPool__MessageSendFailed();
    error CrossChainLiquidityPool__InvalidGasLimit();

    // State variables
    IRouterClient public immutable i_ccipRouter;
    IERC20 public immutable i_usdc;

    uint256 private constant BASIS_POINTS_DENOMINATOR = 1e4;
    uint256 private constant MIN_GAS_LIMIT = 1e5;
    uint256 private constant MAX_GAS_LIMIT = 1e6;
    uint256 private s_defaultGasLimit = 2e5;

    struct ChainLiquidity {
        uint256 totalLiquidity;
        uint256 availableLiquidity;
        uint256 utilizationRate;
        mapping(address => uint256) lenderPositions;
        bool isSupported;
    }

    mapping(uint64 => ChainLiquidity) public chainLiquidity;
    mapping(uint64 => address) public chainVaults;
    mapping(address => bool) public authorizedVaults;

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
    event VaultAuthorized(address vault, bool authorized);
    event GasLimitUpdated(uint256 newGasLimit);

    modifier onlyAuthorizedVault() {
        if (!authorizedVaults[msg.sender]) {
            revert CrossChainLiquidityPool__UnauthorizedCaller();
        }
        _;
    }

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
     * @notice Authorizes or deauthorizes a vault to fund loans.
     * @dev Only callable by the owner.
     * @param vault The vault address to authorize/deauthorize.
     * @param authorized Whether the vault is authorized.
     */
    function setAuthorizedVault(address vault, bool authorized) external onlyOwner {
        if (vault == address(0)) revert CrossChainLiquidityPool__InvalidVault();
        authorizedVaults[vault] = authorized;
        emit VaultAuthorized(vault, authorized);
    }

    /**
     * @notice Updates the default gas limit for cross-chain messages.
     * @dev Only callable by the owner.
     * @param newGasLimit The new gas limit.
     */
    function setDefaultGasLimit(uint256 newGasLimit) external onlyOwner {
        if (newGasLimit < MIN_GAS_LIMIT || newGasLimit > MAX_GAS_LIMIT) {
            revert CrossChainLiquidityPool__InvalidGasLimit();
        }
        s_defaultGasLimit = newGasLimit;
        emit GasLimitUpdated(newGasLimit);
    }

    /**
     * @notice Adds liquidity for a specific chain using USDC tokens.
     * @dev Transfers USDC from sender, updates liquidity, and sends cross-chain message.
     * @param chainSelector The chain selector to add liquidity to.
     * @param amount The amount of USDC to add as liquidity.
     */
    function addLiquidity(uint64 chainSelector, uint256 amount) external payable nonReentrant {
        if (!chainLiquidity[chainSelector].isSupported)
            revert CrossChainLiquidityPool__ChainNotSupported();
        if (amount == 0) revert CrossChainLiquidityPool__InvalidAmount();
        if (msg.value == 0) revert CrossChainLiquidityPool__InvalidAmount(); // For CCIP fees

        // Transfer USDC from user
        i_usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Update liquidity state
        ChainLiquidity storage chain = chainLiquidity[chainSelector];
        chain.totalLiquidity += amount;
        chain.availableLiquidity += amount;
        chain.lenderPositions[msg.sender] += amount;

        // Calculate utilization rate (safe math)
        if (chain.totalLiquidity > 0) {
            uint256 utilizedAmount = chain.totalLiquidity - chain.availableLiquidity;
            chain.utilizationRate = (utilizedAmount * BASIS_POINTS_DENOMINATOR) / chain.totalLiquidity;
        }

        // Send liquidity to destination chain
        bytes32 messageId = _sendCrossChainMessage(chainSelector, amount);

        emit LiquidityAdded(msg.sender, chainSelector, amount, messageId);
    }

    /**
     * @notice Withdraws liquidity for a specific chain.
     * @dev Transfers USDC back to the lender and updates liquidity.
     * @param chainSelector The chain selector to withdraw from.
     * @param amount The amount of liquidity to withdraw.
     */
    function withdrawLiquidity(uint64 chainSelector, uint256 amount) external nonReentrant {
        if (amount == 0) revert CrossChainLiquidityPool__InvalidAmount();
        
        ChainLiquidity storage chain = chainLiquidity[chainSelector];
        if (chain.lenderPositions[msg.sender] < amount)
            revert CrossChainLiquidityPool__InsufficientBalance();
        if (chain.availableLiquidity < amount)
            revert CrossChainLiquidityPool__InsufficientLiquidity();

        // Update state before external call
        chain.totalLiquidity -= amount;
        chain.availableLiquidity -= amount;
        chain.lenderPositions[msg.sender] -= amount;

        // Recalculate utilization rate
        if (chain.totalLiquidity > 0) {
            uint256 utilizedAmount = chain.totalLiquidity - chain.availableLiquidity;
            chain.utilizationRate = (utilizedAmount * BASIS_POINTS_DENOMINATOR) / chain.totalLiquidity;
        } else {
            chain.utilizationRate = 0;
        }

        // Transfer USDC to user
        i_usdc.safeTransfer(msg.sender, amount);

        emit LiquidityWithdrawn(msg.sender, chainSelector, amount);
    }

    /**
     * @notice Funds a loan by reducing available liquidity.
     * @dev Only callable by authorized vaults.
     * @param chainSelector The chain selector where the loan is being funded.
     * @param loanId The ID of the loan being funded.
     * @param amount The amount to fund.
     */
    function fundLoan(
        uint64 chainSelector, 
        uint256 loanId, 
        uint256 amount
    ) external nonReentrant onlyAuthorizedVault {
        if (amount == 0) revert CrossChainLiquidityPool__InvalidAmount();
        
        ChainLiquidity storage chain = chainLiquidity[chainSelector];
        if (chain.availableLiquidity < amount)
            revert CrossChainLiquidityPool__InsufficientLiquidity();

        // Update available liquidity
        chain.availableLiquidity -= amount;

        // Recalculate utilization rate
        if (chain.totalLiquidity > 0) {
            uint256 utilizedAmount = chain.totalLiquidity - chain.availableLiquidity;
            chain.utilizationRate = (utilizedAmount * BASIS_POINTS_DENOMINATOR) / chain.totalLiquidity;
        }

        // Transfer USDC to the authorized vault
        i_usdc.safeTransfer(msg.sender, amount);

        emit LoanFunded(chainSelector, loanId, amount);
    }

    /**
     * @notice Repays a loan by increasing available liquidity.
     * @dev Only callable by authorized vaults.
     * @param chainSelector The chain selector where the loan is being repaid.
     * @param amount The amount being repaid.
     */
    function repayLoan(uint64 chainSelector, uint256 amount) external onlyAuthorizedVault {
        if (amount == 0) revert CrossChainLiquidityPool__InvalidAmount();

        // Transfer USDC from vault
        i_usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Update available liquidity
        ChainLiquidity storage chain = chainLiquidity[chainSelector];
        chain.availableLiquidity += amount;

        // Recalculate utilization rate
        if (chain.totalLiquidity > 0) {
            uint256 utilizedAmount = chain.totalLiquidity - chain.availableLiquidity;
            chain.utilizationRate = (utilizedAmount * BASIS_POINTS_DENOMINATOR) / chain.totalLiquidity;
        }
    }

    /**
     * @notice Internal function to send cross-chain messages.
     * @param chainSelector The destination chain selector.
     * @param amount The amount being sent.
     * @return messageId The ID of the sent message.
     */
    function _sendCrossChainMessage(
        uint64 chainSelector, 
        uint256 amount
    ) internal returns (bytes32 messageId) {
        // Prepare the message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(chainVaults[chainSelector]),
            data: abi.encode(amount),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            feeToken: address(0), // Pay fees in native token
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: s_defaultGasLimit})
            )
        });

        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_usdc),
            amount: amount
        });

        // Approve USDC for CCIP router
        i_usdc.safeIncreaseAllowance(address(i_ccipRouter), amount);

        // Send the message
        try i_ccipRouter.ccipSend{value: msg.value}(chainSelector, message) returns (bytes32 msgId) {
            messageId = msgId;
        } catch {
            revert CrossChainLiquidityPool__MessageSendFailed();
        }
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
     * @return utilizationRate The utilization rate for the chain (in basis points).
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
     * @notice Gets the current default gas limit.
     * @return The default gas limit for cross-chain messages.
     */
    function getDefaultGasLimit() external view returns (uint256) {
        return s_defaultGasLimit;
    }

    /**
     * @notice Checks if a chain is supported.
     * @param chainSelector The chain selector to check.
     * @return Whether the chain is supported.
     */
    function isChainSupported(uint64 chainSelector) external view returns (bool) {
        return chainLiquidity[chainSelector].isSupported;
    }

    /**
     * @notice Withdraws all native tokens (ETH) from the contract to the owner.
     * @dev Only callable by the owner. Used for withdrawing CCIP fees.
     */
    function withdrawNative() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert CrossChainLiquidityPool__InsufficientBalance();

        (bool success, ) = msg.sender.call{value: balance}("");
        if (!success) revert CrossChainLiquidityPool__TransferFailed();
    }

    /**
     * @notice Emergency function to withdraw USDC tokens.
     * @dev Only callable by the owner in case of emergency.
     * @param amount The amount of USDC to withdraw.
     */
    function emergencyWithdrawUSDC(uint256 amount) external onlyOwner {
        i_usdc.safeTransfer(msg.sender, amount);
    }

    /**
     * @notice Fallback function to receive native tokens for CCIP fees.
     */
    receive() external payable {}
}