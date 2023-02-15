// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { IUniswapRouterV2 } from "../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../../interfaces/external/uni/IUniswapV2Pair.sol";

contract UniV2TradeModule {
  function getAmountOut(
    uint256 amountIn,
    address[] calldata tradePath,
    address router
  ) external view returns (uint256) {
    uint256 len = tradePath.length;
    uint256[] memory amountsOut = IUniswapRouterV2(router).getAmountsOut(amountIn, tradePath);
    return amountsOut[len - 1];
  }

  function deposit(
    address asset,
    uint256 amountIn,
    uint256 amountOut,
    address[] calldata tradePath,
    address router
  ) external returns (uint256) {
    IERC20(tradePath[0]).transferFrom(msg.sender, address(this), amountIn);

    // A - only one token
    // B - both token but unbalanced
    // C - both token but balanced

    // 1. Check pair assets
    // 2. Check pair balance and ratio
    // 3. Compare balances and ratio
    // 4. Trade larger balance for smaller balance to achieve ratio ---- this will change the ratio
    // 5. Deposit to pool

    address token0 = IUniswapV2Pair(asset).token0();
    address token1 = IUniswapV2Pair(asset).token1();

    uint256 bal0 = IERC20(token0).balanceOf(msg.sender);
    uint256 bal1 = IERC20(token1).balanceOf(msg.sender);

    (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast) = IUniswapV2Pair(asset).getReserves();

    // TODO how do i need to set the deadline?
    IUniswapRouterV2(router).addLiquidity(
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      msg.sender,
      block.timestamp + 10
    );

    uint256 len = tradePath.length;
    IERC20(tradePath[len - 1]).transfer(msg.sender, amountsOut[len - 1]);
    return amountsOut[len - 1];
  }
}
