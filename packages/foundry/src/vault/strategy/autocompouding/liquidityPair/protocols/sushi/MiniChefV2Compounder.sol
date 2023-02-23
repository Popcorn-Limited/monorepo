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

  // Claim rewards from underlying protocol.
  function _claimRewards() internal override {
    address chef = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    IMiniChefV2(chef).harvest(pid, address(this));
  }

  // Swap all rewards to native token.
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

  // Swap native tokens for lpTokens.
  function _swapNativeToLpTokens() internal override {
    _uniV2Swap(swapRouter, nativeToLp0Route, ERC20(native).balanceOf(address(this)) / 2);
    _uniV2Swap(swapRouter, nativeToLp1Route, ERC20(native).balanceOf(address(this)));
  }

  // Use lpTokens to create lpPair.
  function _addLiquidity() internal override {
    _uniV2AddLiquidity(swapRouter, lpToken0, lpToken1);
  }

  // Deposit lpPair into underlying protocol.
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
