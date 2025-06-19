// SPDX-License-Identifier: MIT

pragma solidity 0.8.30;

import {IRouterClient} from "@chainlink/contracts-ccip/contracts/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/contracts/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

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
            ((chain.totalLiquidity - chain.availableLiquidity) * 10000) /
            chain.totalLiquidity;

        // Send liquidity to destination chain
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(chainVaults[chainSelector]),
            data: abi.encode(amount),
            tokenAmounts: new Client.EVMTokenAmount[](1),
            feeToken: address(0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200000})
            )
        });

        message.tokenAmounts[0] = Client.EVMTokenAmount({
            token: address(i_usdc),
            amount: amount
        });

        i_usdc.approve(address(i_ccipRouter), amount);
        bytes32 messageId = i_ccipRouter.ccipSend{value: msg.value}(
            chainSelector,
            message
        );

        emit LiquidityAdded(msg.sender, chainSelector, amount, messageId);
    }

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
                ((chain.totalLiquidity - chain.availableLiquidity) * 10000) /
                chain.totalLiquidity;
        } else {
            chain.utilizationRate = 0;
        }

        if (!i_usdc.transfer(msg.sender, amount))
            revert CrossChainLiquidityPool__TransferFailed();

        emit LiquidityWithdrawn(msg.sender, chainSelector, amount);
    }

    function getLenderPosition(
        address lender,
        uint64 chainSelector
    ) external view returns (uint256) {
        return chainLiquidity[chainSelector].lenderPositions[lender];
    }

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
}
