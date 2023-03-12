// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15
pragma solidity ^0.8.15;

import { ERC4626Upgradeable as ERC4626, ERC20Upgradeable as ERC20 } from "openzeppelin-contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import { IUniswapRouterV2 } from "../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IAdapter } from "../../../interfaces/vault/IAdapter.sol";
import { IWithRewards } from "../../../interfaces/vault/IWithRewards.sol";
import { StrategyBase } from "../StrategyBase.sol";
import { IERC20 } from "openzeppelin-contracts/token/ERC20/IERC20.sol";
import { ITradeModule, Trade } from "./ITradeModule.sol";

contract Pool2SingleAssetCompounder is StrategyBase {
  error NoValidTradePath();

  /// @notice claim all token rewards and trade them for the underlying asset
  // function harvest() public override {
  //   (address tradeModule, address router, uint256 minTradeAmount, uint256 slippage, address[] tradePath) = abi.decode(
  //     IAdapter(address(this)).strategyConfig(),
  //     ((address, address, uint256, uint256, address[]))
  //   );

  //   for (uint256 i = 0; i < len; i++) {
  //     uint256 bal = ERC20(tradePath[0]).balanceOf(address(this));
  //     if (bal > minTradeAmount) {
  //       // TODO amountOut currently doesnt account for oracle manipulation before the trade. It assumes a fair price
  //       uint256 amountOut = ITradeModule(tradeModule).getAmountOut(bal, tradePath, router);
  //       ITradeModule(tradeModule).trade(bal, (amountOut * (1e18 - slippage)) / 1e18, tradePath, router);
  //     }
  //   }
  //   IAdapter(address(this)).strategyDeposit(ERC20(asset).balanceOf(address(this)), 0);
  // }
}

// asset -> asset
// asset -> curve pool2
// asset -> curve pool3
// asset -> curve custom pool -- how many?
// asset -> uniV2
// asset -> uniV3
// asset -> velo?
// asset -> balancer -- how many?
// split asset to mitigate slippage

// Use 1Inch Router
// 1. Get Spot price
// 2. Calc Min
// 3. Trade using router
// 4. Potentially LP
// Trade to usdc first? and than trade all together to asset? Or just each reward on their own
