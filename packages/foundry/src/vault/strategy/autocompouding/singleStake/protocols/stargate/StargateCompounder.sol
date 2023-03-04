// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { SingleStakeBase, ERC20 } from "../../SingleStakeBase.sol";
import { IUniswapRouterV2 } from "../../../../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../../../../../interfaces/external/uni/IUniswapV2Pair.sol";
import { IStargateRewarder } from "../../../../../../interfaces/external/stargate/IStargateRewarder.sol";
import { IStargateRouter } from "../../../../../../interfaces/external/stargate/IStargateRouter.sol";
import { IRewarder } from "../../../../../../interfaces/external/IRewarder.sol";
import { IUniswapV2Module } from "../../../../../../interfaces/modules/IUniswapV2Module.sol";

contract StargateCompounder is SingleStakeBase {
  constructor(
    address _native,
    address _assetToken,
    address[] memory _tradeModules,
    address[] memory _routers,
    address _vault,
    address _strategist,
    address[] memory _protocolAddresses,
    uint256[] memory _protocolUints,
    address[][] memory _rewardsToNativeRoutes,
    address[] memory _nativeToAssetTokenRoute
  ) public {
    native = _native;

    tradeModules = _tradeModules;
    routers = _routers;

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
    address stargateRewarder = protocolAddresses[0];
    address stargateRouter = protocolAddresses[1];
    address stargateWrappedAsset = protocolAddresses[2];

    ERC20(assetToken).approve(stargateRouter, type(uint256).max);
    ERC20(stargateWrappedAsset).approve(stargateRewarder, type(uint256).max);
  }

  /*//////////////////////////////////////////////////////////////
                          COMPOUND LOGIC
    //////////////////////////////////////////////////////////////*/

  // Swap all rewards to native token
  function _swapRewardsToNative(address[] memory _rewardRoute, uint256 _rewardAmount) internal override {
    IUniswapV2Module uniV2Module = IUniswapV2Module(tradeModules[0]);
    address uniV2Router = routers[0];

    uniV2Module.swap(uniV2Router, _rewardRoute, _rewardAmount);
  }

  // Swap native tokens for lpTokens
  function _swapNativeToAssetToken() internal override {
    IUniswapV2Module uniV2Module = IUniswapV2Module(tradeModules[0]);
    address uniV2Router = routers[0];

    uniV2Module.swap(uniV2Router, nativeToAssetTokenRoute, ERC20(native).balanceOf(address(this)));
  }

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public override returns (uint256[] memory) {
    IStargateRewarder stargateRewarder = IStargateRewarder(protocolAddresses[0]);
    uint256 pid = protocolUints[0];

    pendingRewards.push(stargateRewarder.pendingStargate(pid, address(this)));

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
