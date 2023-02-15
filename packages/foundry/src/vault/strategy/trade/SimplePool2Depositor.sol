// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { IUniswapRouterV2 } from "../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../../interfaces/external/uni/IUniswapV2Pair.sol";

contract SimplePool2Depositor {
  function addLiquidity() internal {
    uint256 nativeHalf = IERC20(native).balanceOf(address(this)).div(2);

    if (lpToken0 != native) {
      uint256 amountOut0 = ITradeModule(tradeModule).getAmountOut(nativeHalf, nativeToLp0Route, router);
      ITradeModule(tradeModule).trade(nativeHalf, (amountOut * (1e18 - slippage)) / 1e18, nativeToLp0Route, router);
    }

    if (lpToken1 != native) {
      uint256 amountOut1 = ITradeModule(tradeModule).getAmountOut(nativeHalf, nativeToLp1Route, router);
      ITradeModule(tradeModule).trade(nativeHalf, (amountOut * (1e18 - slippage)) / 1e18, nativeToLp1Route, router);
    }

    uint256 lp0Bal = IERC20(lpToken0).balanceOf(address(this));
    uint256 lp1Bal = IERC20(lpToken1).balanceOf(address(this));
    IUniswapRouterETH(unirouter).addLiquidity(
      lpToken0,
      lpToken1,
      lp0Bal,
      lp1Bal,
      (amountOut * (1e18 - slippage)) / 1e18,
      (amountOut * (1e18 - slippage)) / 1e18,
      address(this),
      now
    );
  }
}
