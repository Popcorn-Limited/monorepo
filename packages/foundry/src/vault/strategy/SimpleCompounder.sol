// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { StrategyBase, ERC20 } from "./StrategyBase2.sol";
import { IUniswapRouterV2 } from "../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IUniswapV2Pair } from "../../interfaces/external/uni/IUniswapV2Pair.sol";

contract SimpleCompounder is StrategyBase {
  constructor(
    address _native,
    address _lpPair,
    address _vault,
    address _strategist,
    address[] memory _rewardTokens,
    address[][] memory _rewardRoutes,
    address[] memory _nativeToLp0Route,
    address[] memory _nativeToLp1Route
  ) public {
    native = _native;
    lpPair = _lpPair;
    vault = _vault;
    strategist = _strategist;

    rewardTokens = _rewardTokens;
    rewardRoutes = _rewardRoutes;

    _setUp(_nativeToLp0Route, nativeToLp1Route);
  }

  // Setup for routes and allowances in constructor.
  function _setUp(address[] memory _nativeToLp0Route, address[] memory _nativeToLp1Route) internal override {
    // Lp routing checks
    lpToken0 = IUniswapV2Pair(lpPair).token0();
    if (_nativeToLp0Route[0] != native) revert InvalidRoute();
    if (_nativeToLp0Route[_nativeToLp0Route.length - 1] != lpToken0) revert InvalidRoute();
    nativeToLp0Route = _nativeToLp0Route;

    lpToken1 = IUniswapV2Pair(lpPair).token0();
    if (_nativeToLp1Route[0] != native) revert InvalidRoute();
    if (_nativeToLp1Route[_nativeToLp1Route.length - 1] != lpToken1) revert InvalidRoute();
    nativeToLp1Route = _nativeToLp1Route;

    _giveInitialAllowances();
  }

  // Give allowances for rewardToken swaps.
  function _giveAllowances() internal override {
    ERC20(native).approve(router, type(uint256).max);
    ERC20(lpToken0).approve(router, type(uint256).max);
    ERC20(lpToken1).approve(router, type(uint256).max);
  }

  // Logic to claim rewards, swap rewards to native, charge fees, swap native to lpTokens, add liquidity, and re-deposit.
  function _compound() internal override {}

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public view override returns (uint256[] memory) {}
}
