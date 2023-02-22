// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { SingleStakeBase, ERC20 } from "../../SingleStakeBase.sol";
import { IUniswapRouterV2 } from "../../../../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../../../../../interfaces/external/uni/IUniswapV2Pair.sol";
import { IMiniChefV2 } from "../../../../../../interfaces/external/IMiniChefV2.sol";
import { IRewarder } from "../../../../../../interfaces/external/IRewarder.sol";

contract StargateCompounder is SingleStakeBase {
  constructor(
    address _native,
    address _assetToken,
    address _vault,
    address _strategist,
    address[] memory _protocolAddresses,
    uint256[] memory _protocolUints,
    address[][] memory _rewardsToNativeRoutes,
    address[] memory _nativeToAssetTokenRoute
  ) public {
    native = _native;
    vault = _vault;
    strategist = _strategist;

    protocolAddresses = _protocolAddresses;
    protocolUints = _protocolUints;

    rewardsToNativeRoutes = _rewardsToNativeRoutes;
    nativeToAssetTokenRoute = _nativeToAssetTokenRoute;

    _setUp(rewardsToNativeRoutes, nativeToAssetTokenRoute, _assetToken);
  }

  /*//////////////////////////////////////////////////////////////
                          SETUP
    //////////////////////////////////////////////////////////////*/

  // Setup for routes and allowances in constructor.
  function _setUp(
    address[][] memory _rewardToNativeRoutes,
    address[] memory _nativeToAssetTokenRoute,
    address _assetToken
  ) internal override {
    if (_nativeToAssetTokenRoute[0] != native) revert InvalidRoute();

    assetToken = _assetToken;

    if (_nativeToAssetTokenRoute[_nativeToAssetTokenRoute.length - 1] != _assetToken) revert InvalidRoute();

    _setRewardTokens(_rewardToNativeRoutes);

    _giveInitialAllowances();
  }

  // Give allowances for protocol deposit and rewardToken swaps.
  function _giveAllowances() internal override {
    address chef = protocolAddresses[0];

    ERC20(assetToken).approve(chef, type(uint256).max);
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
        _uniV2Swap(router, rewardRoute, rewardAmount);
      }
    }
  }

  // Swap native tokens for lpTokens
  function _swapNativeToAssetToken() internal override {
    _uniV2Swap(router, nativeToAssetTokenRoute, ERC20(native).balanceOf(address(this)));
  }

  // redeposit lpPair into underlying protocol
  function _deposit() internal override {
    address chef = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    IMiniChefV2(chef).deposit(pid, ERC20(assetToken).balanceOf(address(this)), address(this));
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
