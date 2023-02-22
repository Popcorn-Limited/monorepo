// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { LiquidityPairBase, ERC20 } from "../../LiquidityPairBase.sol";
import { IUniswapRouterV2 } from "../../../../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../../../../../interfaces/external/uni/IUniswapV2Pair.sol";
import { IMiniChefV2 } from "../../../../../../interfaces/external/sushi/IMiniChefV2.sol";
import { IRewarder } from "../../../../../../interfaces/external/IRewarder.sol";

contract LiquidityPairCompounder is LiquidityPairBase {
  constructor(
    address _native,
    address _lpPair,
    address _swapRouter,
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
    swapRouter = _swapRouter;

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

  // Setup for routes and allowances in constructor.
  function _setUp(
    address[][] memory _rewardsToNativeRoutes,
    address[] memory _nativeToLp0Route,
    address[] memory _nativeToLp1Route
  ) internal override {
    lpToken0 = IUniswapV2Pair(lpPair).token0();
    if (_nativeToLp0Route[0] != native) revert InvalidRoute();
    if (_nativeToLp0Route[_nativeToLp0Route.length - 1] != lpToken0) revert InvalidRoute();
    nativeToLp0Route = _nativeToLp0Route;

    lpToken1 = IUniswapV2Pair(lpPair).token0();
    if (_nativeToLp1Route[0] != native) revert InvalidRoute();
    if (_nativeToLp1Route[_nativeToLp1Route.length - 1] != lpToken1) revert InvalidRoute();
    nativeToLp1Route = _nativeToLp1Route;

    uint256 len = _rewardsToNativeRoutes.length;
    for (uint256 i; i < len; ++i) {
      if (_rewardsToNativeRoutes[i][_rewardsToNativeRoutes.length - 1] != native) revert InvalidRoute();
      rewardTokens[i] = rewardsToNativeRoutes[i][0];
    }

    _giveInitialAllowances();
  }

  // Give allowances for protocol deposit and rewardToken swaps.
  function _giveAllowances() internal override {
    address chef = protocolAddresses[0];

    ERC20(lpPair).approve(chef, type(uint256).max);
    ERC20(native).approve(swapRouter, type(uint256).max);
    ERC20(lpToken0).approve(swapRouter, type(uint256).max);
    ERC20(lpToken1).approve(swapRouter, type(uint256).max);
  }

  /*//////////////////////////////////////////////////////////////
                          HARVEST LOGIC
    //////////////////////////////////////////////////////////////*/

  // Claim rewards from underlying protocol
  function _claimRewards() internal override {
    address chef = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    IMiniChefV2(chef).harvest(pid, address(this));
  }

  // Swap all rewards to native token
  function _swapRewardsToNative() internal override {
    uint256 len = rewardsToNativeRoutes.length;
    for (uint256 i; i < len; ++i) {
      address reward = rewardsToNativeRoutes[i][0];
      address[] memory rewardRoute = rewardsToNativeRoutes[i];
      uint256 rewardAmount = ERC20(reward).balanceOf(address(this));
      if (rewardAmount > 0) {
        _uniV2Swap(swapRouter, rewardRoute, rewardAmount);
      }
    }
  }

  // Swap native tokens for lpTokens
  function _swapNativeToLpTokens() internal override {
    _uniV2Swap(swapRouter, nativeToLp0Route, ERC20(native).balanceOf(address(this)) / 2);
    _uniV2Swap(swapRouter, nativeToLp1Route, ERC20(native).balanceOf(address(this)));
  }

  // Use lpTokens to create lpPair
  function _addLiquidity() internal override {
    _uniV2AddLiquidity(swapRouter, lpToken0, lpToken1);
  }

  // redeposit lpPair into underlying protocol
  function _deposit() internal override {
    address chef = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    IMiniChefV2(chef).deposit(pid, ERC20(lpPair).balanceOf(address(this)), address(this));
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
}
