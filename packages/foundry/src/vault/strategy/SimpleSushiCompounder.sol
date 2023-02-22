// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { StrategyBase, ERC20 } from "./StrategyBase2.sol";
import { IUniswapRouterV2 } from "../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../interfaces/external/uni/IUniswapV2Pair.sol";
import { IMiniChefV2 } from "../../interfaces/external/IMiniChefV2.sol";
import { IRewarder } from "../../interfaces/external/IRewarder.sol";

contract SimpleSushiCompounder is StrategyBase {
  constructor(
    bool _isLiquidityPair,
    address _native,
    address _lpPair,
    address _vault,
    address _strategist,
    address[] memory _protocolAddresses,
    uint256[] memory _protocolUints,
    address[][] memory _rewardToNativeRoutes,
    address[] memory _nativeToLp0Route,
    address[] memory _nativeToLp1Route
  ) public {
    isAssetLiquidityPair = _isAssetLiquidityPair;

    native = _native;
    lpPair = _lpPair;
    vault = _vault;
    strategist = _strategist;

    protocolAddresses = _protocolAddresses;
    protocolUints = _protocolUints;

    rewardToNativeRoutes = _rewardToNativeRoutes;

    _setUp(nativeToLp0Route, nativeToLp1Route, rewardToNativeRoutes);
  }

  /*//////////////////////////////////////////////////////////////
                          SETUP
    //////////////////////////////////////////////////////////////*/

  // Setup for routes and allowances in constructor.
  function _setUp(
    address[] memory _nativeToLp0Route,
    address[] memory _nativeToLp1Route,
    address[][] memory _rewardToNativeRoutes
  ) internal override {
    lpToken0 = IUniswapV2Pair(lpPair).token0();
    if (_nativeToLp0Route[0] != native) revert InvalidRoute();
    if (_nativeToLp0Route[_nativeToLp0Route.length - 1] != lpToken0) revert InvalidRoute();
    nativeToLp0Route = _nativeToLp0Route;

    lpToken1 = IUniswapV2Pair(lpPair).token0();
    if (_nativeToLp1Route[0] != native) revert InvalidRoute();
    if (_nativeToLp1Route[_nativeToLp1Route.length - 1] != lpToken1) revert InvalidRoute();
    nativeToLp1Route = _nativeToLp1Route;

    uint256 len = rewardToNativeRoutes.length;
    for (uint256 i; i < len; ++i) {
      rewardTokens[i] = rewardToNativeRoutes[i][0];
    }

    _giveInitialAllowances();
  }

  // Give allowances for protocol deposit and rewardToken swaps.
  function _giveAllowances() internal override {
    address minichef = protocolAddresses[0];

    ERC20(lpPair).approve(minichef, type(uint256).max);
    ERC20(native).approve(router, type(uint256).max);
    ERC20(lpToken0).approve(router, type(uint256).max);
    ERC20(lpToken1).approve(router, type(uint256).max);
  }

  /*//////////////////////////////////////////////////////////////
                          HARVEST LOGIC
    //////////////////////////////////////////////////////////////*/

  // Claim rewards from underlying protocol
  function _claimRewards() internal override {
    address minichef = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    IMiniChefV2(minichef).harvest(pid, address(this));
  }

  // Swap all rewards to native token
  function _swapRewardsToNative() internal override {
    uint256 len = rewardToNativeRoutes.length;
    for (uint256 i; i < len; ++i) {
      address reward = rewardToNativeRoutes[i][0];
      address[] memory rewardRoute = rewardToNativeRoutes[i];
      uint256 rewardAmount = ERC20(reward).balanceOf(address(this));
      if (rewardAmount > 0) {
        _uniV2Swap(router, rewardRoute, rewardAmount);
      }
    }
  }

  // Swap native tokens for lpTokens
  function _swapNativeToLpTokens() internal override {
    _uniV2Swap(router, nativeToLp0Route, ERC20(native).balanceOf(address(this)) / 2);
    _uniV2Swap(router, nativeToLp1Route, ERC20(native).balanceOf(address(this)));
  }

  // Use lpTokens to create lpPair
  function _addLiquidity() internal override {
    _uniV2AddLiquidity(router, lpToken0, lpToken1);
  }

  // redeposit lpPair into underlying protocol
  function _redeposit() internal override {
    address minichef = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    IMiniChefV2(minichef).deposit(pid, ERC20(lpPair).balanceOf(address(this)), address(this));
  }

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public override returns (uint256[] memory) {
    address minichef = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    pendingRewards.push(IMiniChefV2(minichef).pendingSushi(pid, address(this)));

    address rewarder = IMiniChefV2(minichef).rewarder(pid);

    (, uint256[] memory rewardAmounts) = IRewarder(rewarder).pendingTokens(pid, address(this), 0);

    uint256 len = rewardAmounts.length;
    for (uint256 i; i < len; ++i) {
      pendingRewards.push(rewardAmounts[i]);
    }

    return pendingRewards;
  }
}
