// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { LiquidityPairBase, ERC20 } from "../../LiquidityPairBase.sol";
import { IUniswapRouterV2 } from "../../../../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../../../../../interfaces/external/uni/IUniswapV2Pair.sol";
import { IMiniChefV2 } from "../../../../../../interfaces/external/sushi/IMiniChefV2.sol";
import { IRewarder } from "../../../../../../interfaces/external/IRewarder.sol";
import { IUniswapV2Module } from "../../../../../../interfaces/modules/IUniswapV2Module.sol";

contract LiquidityPairCompounder is LiquidityPairBase {
  constructor(
    address _native,
    address _lpPair,
    address[] memory _tradeModules,
    address[] memory _routers,
    address _vault,
    address _strategist,
    address[] memory _protocolAddresses,
    uint256[] memory _protocolUints,
    address[][] memory _rewardsToNativeRoutes,
    address[] memory _nativeToLp0Route,
    address[] memory _nativeToLp1Route
  ) public {
    native = _native;
    lpPair = _lpPair;

    tradeModules = _tradeModules;
    routers = _routers;

    vault = _vault;
    strategist = _strategist;

    protocolAddresses = _protocolAddresses;
    protocolUints = _protocolUints;

    rewardsToNativeRoutes = _rewardsToNativeRoutes;

    _setUp(rewardsToNativeRoutes, nativeToLp0Route, nativeToLp1Route);
  }

  /*//////////////////////////////////////////////////////////////
                          SETUP
    //////////////////////////////////////////////////////////////*/

  // Give allowances for protocol deposit and rewardToken swaps.
  function _giveAllowances() internal override {
    address uniV2Router = routers[0];
    address chef = protocolAddresses[0];

    ERC20(lpPair).approve(chef, type(uint256).max);
    ERC20(native).approve(uniV2Router, type(uint256).max);
    ERC20(lpToken0).approve(uniV2Router, type(uint256).max);
    ERC20(lpToken1).approve(uniV2Router, type(uint256).max);
  }

  /*//////////////////////////////////////////////////////////////
                          HARVEST LOGIC
    //////////////////////////////////////////////////////////////*/

  // Swap all rewards to native token.
  function _swapRewardsToNative(address[] memory _rewardRoute, uint256 _rewardAmount) internal override {
    IUniswapV2Module uniV2Module = IUniswapV2Module(tradeModules[0]);
    address uniV2Router = routers[0];

    uniV2Module.swap(uniV2Router, _rewardRoute, _rewardAmount);
  }

  // Swap native tokens for lpTokens.
  function _swapNativeToLpTokens() internal override {
    IUniswapV2Module uniV2Module = IUniswapV2Module(tradeModules[0]);
    address uniV2Router = routers[0];

    uniV2Module.swap(uniV2Router, nativeToLp0Route, ERC20(native).balanceOf(address(this)) / 2);
    uniV2Module.swap(uniV2Router, nativeToLp1Route, ERC20(native).balanceOf(address(this)));
  }

  // Use lpTokens to create lpPair.
  function _addLiquidity() internal override {
    IUniswapV2Module uniV2Module = IUniswapV2Module(tradeModules[0]);
    address uniV2Router = routers[0];

    uniV2Module.addLiquidity(uniV2Router, lpToken0, lpToken1);
  }

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public override returns (uint256[] memory) {
    address chef = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    pendingRewards.push(IMiniChefV2(chef).pendingSushi(pid, address(this)));

    address rewarder = IMiniChefV2(chef).rewarder(pid);

    (, uint256[] memory rewardAmounts) = IRewarder(rewarder).pendingTokens(pid, address(this), 0);

    uint256 len = rewardAmounts.length;
    for (uint256 i; i < len; ++i) {
      pendingRewards.push(rewardAmounts[i]);
    }

    return pendingRewards;
  }

  /*//////////////////////////////////////////////////////////////
                          ACCOUNTING LOGIC
    //////////////////////////////////////////////////////////////*/

  // Calculate the total underlaying 'want' held by the strat.
  function balanceOf() public view override returns (uint256) {}

  // Calculates how much 'want' this contract holds.
  function balanceOfWant() public view override returns (uint256) {}

  // Calculates how much 'want' the strategy has working in the farm.
  function balanceOfPool() public view override returns (uint256) {}
}
