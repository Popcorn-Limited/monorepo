// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { IUniswapRouterV2 } from "../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IERC20 } from "openzeppelin-contracts/token/ERC20/IERC20.sol";

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

  function trade(
    uint256 amountIn,
    uint256 amountOut,
    address[] calldata tradePath,
    address router
  ) external returns (uint256) {
    IERC20(tradePath[0]).transferFrom(msg.sender, address(this), amountIn);

    uint256[] memory amountsOut = IUniswapRouterV2(router).swapExactTokensForTokens(
      amountIn,
      amountOut,
      tradePath,
      msg.sender,
      block.timestamp
    );

    uint256 len = tradePath.length;
    IERC20(tradePath[len - 1]).transfer(msg.sender, amountsOut[len - 1]);
    return amountsOut[len - 1];
  }
}
