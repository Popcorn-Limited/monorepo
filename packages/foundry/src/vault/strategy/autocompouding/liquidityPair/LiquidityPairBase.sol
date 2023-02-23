// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { IWithRewards } from "../../../../interfaces/vault/IWithRewards.sol";
import { IEIP165 } from "../../../../interfaces/IEIP165.sol";
import { MathUpgradeable as Math } from "openzeppelin-contracts-upgradeable/utils/math/MathUpgradeable.sol";
import { ERC4626Upgradeable as ERC4626, ERC20Upgradeable as ERC20 } from "openzeppelin-contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";

import { CompounderStrategyBase } from "../CompounderStrategyBase.sol";

import { IUniswapV2Pair } from "../../../../interfaces/external/uni/IUniswapV2Pair.sol";
import { IUniswapRouterV2 } from "../../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IAdapter } from "../../../../interfaces/vault/IAdapter.sol";
import { IWithRewards } from "../../../../interfaces/vault/IWithRewards.sol";

contract LiquidityPairBase is CompounderStrategyBase {
  using Math for uint256;

  // Tokens used
  address public lpPair;
  address public lpToken0;
  address public lpToken1;

  // Routes
  address[] public nativeToLp0Route;
  address[] public nativeToLp1Route;

  /*//////////////////////////////////////////////////////////////
                          SETUP
    //////////////////////////////////////////////////////////////*/

  // Setup for routes and allowances in constructor.
  function _setUp(
    address[][] memory _rewardsToNativeRoutes,
    address[] memory _nativeToLp0Route,
    address[] memory _nativeToLp1Route
  ) internal virtual {
    lpToken0 = IUniswapV2Pair(lpPair).token0();
    if (_nativeToLp0Route[0] != native) revert InvalidRoute();
    if (_nativeToLp0Route[_nativeToLp0Route.length - 1] != lpToken0) revert InvalidRoute();
    nativeToLp0Route = _nativeToLp0Route;

    lpToken1 = IUniswapV2Pair(lpPair).token0();
    if (_nativeToLp1Route[0] != native) revert InvalidRoute();
    if (_nativeToLp1Route[_nativeToLp1Route.length - 1] != lpToken1) revert InvalidRoute();
    nativeToLp1Route = _nativeToLp1Route;

    _setRewardTokens(_rewardsToNativeRoutes);

    _giveInitialAllowances();
  }

  /*//////////////////////////////////////////////////////////////
                          ROUTES
    //////////////////////////////////////////////////////////////*/

  // Set nativeToLp0Route.
  function setNativeToLp0TokenRoute(address[] calldata route) public virtual {
    nativeToLp0Route = route;

    if (isVaultFunctional == true) isVaultFunctional = false;
  }

  // Set nativeToLp1Route at index.
  function setNativeToLp1TokenRoute(address[] calldata route) public virtual {
    nativeToLp1Route = route;

    if (isVaultFunctional == true) isVaultFunctional = false;
  }

  /*//////////////////////////////////////////////////////////////
                          COMPOUND LOGIC
    //////////////////////////////////////////////////////////////*/

  // Logic to claim rewards, swap rewards to native, charge fees, swap native to lpTokens, add liquidity, and re-deposit.
  function _compound() internal virtual override {
    _claimRewards();
    _swapRewardsToNative();
    _swapNativeToLpTokens();
    _addLiquidity();
    _deposit();
  }

  // Swap native tokens for lpTokens.
  function _swapNativeToLpTokens() internal virtual {}

  // Use lpTokens to create lpPair.
  function _addLiquidity() internal virtual {}

  /*//////////////////////////////////////////////////////////////
                          LIQUIDITY LOGIC
    //////////////////////////////////////////////////////////////*/
  // Add liquidity to UniswapV2-compatible protocol.
  function _uniV2AddLiquidity(
    address _router,
    address _lpToken0,
    address _lpToken1
  ) internal {
    uint256 lpToken0Amount = ERC20(_lpToken0).balanceOf(address(this));
    uint256 lpToken1Amount = ERC20(_lpToken1).balanceOf(address(this));

    if (lpToken0Amount > 0 && lpToken1Amount > 0) {
      IUniswapRouterV2(_router).addLiquidity(
        _lpToken0,
        _lpToken1,
        lpToken0Amount,
        lpToken1Amount,
        0,
        0,
        address(this),
        block.timestamp + 60
      );
    }
  }
}
