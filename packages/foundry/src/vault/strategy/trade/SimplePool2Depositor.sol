// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15
pragma solidity ^0.8.15;

import { IUniswapRouterV2 } from "../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../../interfaces/external/uni/IUniswapV2Pair.sol";
import { IERC20 } from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import { ITradeModule } from "./ITradeModule.sol";

contract SimplePool2Depositor {
  function getAllocation(
    address tradeModule,
    uint256 allocation,
    address[] calldata tradePath,
    address router,
    uint256 slippage
  ) internal returns (uint256 amountOut, uint256 bal) {
    amountOut = ITradeModule(tradeModule).getAmountOut(allocation, tradePath, router);
    bal = ITradeModule(tradeModule).trade(allocation, (amountOut * (1e18 - slippage)) / 1e18, tradePath, router);
  }

  function deposit(
    address asset,
    uint256 amountIn,
    address[][2] calldata tradePaths,
    address router,
    address tradeModule,
    uint256 slippage
  ) external returns (uint256) {
    address token0 = IUniswapV2Pair(asset).token0();
    address token1 = IUniswapV2Pair(asset).token1();
    uint256 allocation = amountIn / 2;

    (uint256 amountOut0, uint256 bal0) = getAllocation(tradeModule, allocation, tradePaths[0], router, slippage);

    (uint256 amountOut1, uint256 bal1) = getAllocation(tradeModule, allocation, tradePaths[1], router, slippage);

    (, , uint256 amountOut) = IUniswapRouterV2(router).addLiquidity(
      token0,
      token1,
      bal0,
      bal1,
      (bal0 * (1e18 - 1e14)) / 1e18,
      (bal1 * (1e18 - 1e14)) / 1e18,
      msg.sender,
      block.timestamp
    );
    IERC20(asset).transfer(msg.sender, amountOut);
    return amountOut;
  }
}
