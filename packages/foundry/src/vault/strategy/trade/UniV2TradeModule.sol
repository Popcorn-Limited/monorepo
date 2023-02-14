// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { ERC4626Upgradeable as ERC4626, ERC20Upgradeable as ERC20 } from "openzeppelin-contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import { IUniswapRouterV2 } from "../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IAdapter } from "../../interfaces/vault/IAdapter.sol";
import { IWithRewards } from "../../interfaces/vault/IWithRewards.sol";
import { StrategyBase } from "./StrategyBase.sol";

contract UniV2TradeModule  {
  constructor(){}

  
}