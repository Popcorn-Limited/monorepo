// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { StrategyBase } from "./StrategyBase2.sol";

contract SimpleCompounder is StrategyBase {
  using SafeERC20 for IERC20;
  using Math for uint256;

  constructor(
    address _native,
    address _lpPair,
    address _vault,
    address _strategist,
    address[] memory _nativeToLp0Route,
    address[] memory _nativeToLpRoute
  ) public {
    native = _native;
    lpPair = _lpPair;
    vault = _vault;
    strategist = _strategist;

    _setUp();
  }

  // Setup for routes and allowances in constructor.
  function _setUp() internal override {
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
    IERC20(want).safeApprove(chef, type(uint256).max);
    IERC20(native).safeApprove(router, type(uint256).max);
    IERC20(lpToken0).safeApprove(router, type(uint256).max);
    IERC20(lpToken1).safeApprove(router, type(uint256).max);
  }

  // Logic to claim rewards, swap rewards to native, charge fees, swap native to lpTokens, add liquidity, and re-deposit.
  function _compound() internal virtual {}

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public view virtual returns (uint256[] memory) {}

  // Calculate the total underlaying 'want' held by the strat.
  function balanceOf() public view virtual returns (uint256) {}

  // Calculates how much 'want' this contract holds.
  function balanceOfWant() public view virtual returns (uint256) {}

  // Calculates how much 'want' the strategy has working in the farm.
  function balanceOfPool() public view virtual returns (uint256) {}
}
