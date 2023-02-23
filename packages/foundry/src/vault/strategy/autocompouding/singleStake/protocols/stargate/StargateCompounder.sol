// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { SingleStakeBase, ERC20 } from "../../SingleStakeBase.sol";
import { IUniswapRouterV2 } from "../../../../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../../../../../interfaces/external/uni/IUniswapV2Pair.sol";
import { IStargateRewarder } from "../../../../../../interfaces/external/stargate/IStargateRewarder.sol";
import { IStargateRouter } from "../../../../../../interfaces/external/stargate/IStargateRouter.sol";
import { IRewarder } from "../../../../../../interfaces/external/IRewarder.sol";

contract StargateCompounder is SingleStakeBase {
  constructor(
    address _native,
    address _assetToken,
    address _swapRouter,
    address _vault,
    address _strategist,
    address[] memory _protocolAddresses,
    uint256[] memory _protocolUints,
    address[][] memory _rewardsToNativeRoutes,
    address[] memory _nativeToAssetTokenRoute
  ) public {
    native = _native;
    swapRouter = _swapRouter;

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

  // Give allowances for protocol deposit and rewardToken swaps.
  function _giveAllowances() internal override {
    address rewarder = protocolAddresses[0];
    address stargateRouter = protocolAddresses[1];
    address stargateWrappedAsset = protocolAddresses[2];

    ERC20(assetToken).approve(stargateRouter, type(uint256).max);
    ERC20(stargateWrappedAsset).approve(rewarder, type(uint256).max);
  }

  /*//////////////////////////////////////////////////////////////
                          COMPOUND LOGIC
    //////////////////////////////////////////////////////////////*/

  // Claim rewards from underlying protocol
  function _claimRewards() internal override {
    address rewarder = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    IStargateRewarder(rewarder).deposit(pid, 0);
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
  function _swapNativeToAssetToken() internal override {
    _uniV2Swap(swapRouter, nativeToAssetTokenRoute, ERC20(native).balanceOf(address(this)));
  }

  // deposit asset into underlying protocol
  function _deposit() internal override {
    address rewarder = protocolAddresses[0];
    address stargateRouter = protocolAddresses[1];
    address stargateWrappedAsset = protocolAddresses[2];
    uint256 pid = protocolUints[0];

    IStargateRouter(stargateRouter).addLiquidity(pid, ERC20(assetToken).balanceOf(address(this)), address(this));
    IStargateRewarder(rewarder).deposit(pid, ERC20(stargateWrappedAsset).balanceOf(address(this)));
  }

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public override returns (uint256[] memory) {
    address rewarder = protocolAddresses[0];
    uint256 pid = protocolUints[0];

    pendingRewards.push(IStargateRewarder(rewarder).pendingStargate(pid, address(this)));

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
