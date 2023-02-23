// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { IWithRewards } from "../../../interfaces/vault/IWithRewards.sol";
import { IEIP165 } from "../../../interfaces/IEIP165.sol";
import { MathUpgradeable as Math } from "openzeppelin-contracts-upgradeable/utils/math/MathUpgradeable.sol";
import { ERC4626Upgradeable as ERC4626, ERC20Upgradeable as ERC20 } from "openzeppelin-contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import { IUniswapRouterV2 } from "../../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IAdapter } from "../../../interfaces/vault/IAdapter.sol";
import { IWithRewards } from "../../../interfaces/vault/IWithRewards.sol";

contract CompounderStrategyBase {
  // Native token on chain
  address public native;

  // Protocol contracts info (masterchefs, poolIds, etc.)
  address[] public protocolAddresses;
  uint256[] public protocolUints;

  // Vault and Strategist
  address public vault;
  address public strategist;

  // Router and Routes
  address public swapRouter;
  /**
   * @dev rewardToken index must match respective index in rewardRoutes and pendingRewards.
   * @dev Routes follow this pattern: [rewardToken, ...hops, native]
   */
  address[][] public rewardsToNativeRoutes;

  // Data management
  bool public isVaultFunctional;
  uint256 public lastHarvest;
  address[] public rewardTokens;
  uint256[] public pendingRewards;

  // Events
  event Harvest();

  // Errors
  error InvalidRoute();
  error FunctionNotImplemented(bytes4 sig);

  function verifyAdapterSelectorCompatibility(bytes4[8] memory sigs) public {
    uint8 len = uint8(sigs.length);
    for (uint8 i; i < len; i++) {
      if (sigs[i].length == 0) return;
      if (!IEIP165(address(this)).supportsInterface(sigs[i])) revert FunctionNotImplemented(sigs[i]);
    }
  }

  function verifyAdapterCompatibility(bytes memory data) public virtual {}

  /*//////////////////////////////////////////////////////////////
                          SETUP
    //////////////////////////////////////////////////////////////*/

  // Give allowances necessary for deposit, withdraw, lpToken swaps, and addLiquidity.
  function _giveAllowances() internal virtual {}

  // Give allowances for rewardToken swaps.
  function giveRewardAllowances() public {
    uint256 len = rewardTokens.length;
    for (uint256 i; i < len; ++i) {
      ERC20(rewardTokens[i]).approve(swapRouter, type(uint256).max);
    }
  }

  // Give initial allowances for setup.
  function _giveInitialAllowances() internal {
    _giveAllowances();
    giveRewardAllowances();
  }

  /*//////////////////////////////////////////////////////////////
                          HARVEST LOGIC
    //////////////////////////////////////////////////////////////*/

  // Harvest rewards.
  function harvest() public virtual {
    if (_rewardsCheck() == true && _rewardRoutesCheck() == true) {
      _compound();
    }

    lastHarvest = block.timestamp;

    if (isVaultFunctional == false) isVaultFunctional = true;

    emit Harvest();
  }

  // Logic to claim rewards, swap rewards to native, charge fees, swap native to deposit token, add liquidity (if necessary), and re-deposit.
  function _compound() internal virtual {}

  // Swap all rewards to native token.
  function _swapRewardsToNative() internal virtual {}

  // Claim rewards from underlying protocol.
  function _claimRewards() internal virtual {}

  // Deposit assetToken or lpPair into underlying protocol.
  function _deposit() internal virtual {}

  /*//////////////////////////////////////////////////////////////
                          REWARDS AND ROUTES
    //////////////////////////////////////////////////////////////*/

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public virtual returns (uint256[] memory) {}

  // Set rewards tokens according to rewardToNativeRoutes.
  function _setRewardTokens(address[][] memory _rewardsToNativeRoutes) internal virtual {
    uint256 len = _rewardsToNativeRoutes.length;
    for (uint256 i; i < len; ++i) {
      if (_rewardsToNativeRoutes[i][_rewardsToNativeRoutes.length - 1] != native) revert InvalidRoute();
      rewardTokens[i] = _rewardsToNativeRoutes[i][0];
    }
  }

  // Check to see that at least 1 reward is available.
  function _rewardsCheck() internal virtual returns (bool) {
    pendingRewards = rewardsAvailable();

    uint256 len = pendingRewards.length;
    for (uint256 i; i < len; ++i) {
      if (pendingRewards[i] > 0) {
        return true;
      }
    }

    return false;
  }

  // Check to make sure all rewardTokens have correct respective routes.
  function _rewardRoutesCheck() internal view virtual returns (bool) {
    uint256 len = rewardTokens.length;

    for (uint256 i; i < len; ++i) {
      if (
        rewardTokens[i] != rewardsToNativeRoutes[i][0] ||
        native != rewardsToNativeRoutes[i][rewardsToNativeRoutes.length - 1]
      ) return false;
    }

    return true;
  }

  // Set rewardRoute at index.
  function setRewardsToNativeRoute(uint256 rewardIndex, address[] calldata route) public virtual {
    rewardsToNativeRoutes[rewardIndex] = route;

    if (isVaultFunctional == true) isVaultFunctional = false;
  }

  // Get rewardRoute at index.
  function getRewardsToNativeRoute(uint256 rewardIndex) public view virtual returns (address[] memory) {
    return rewardsToNativeRoutes[rewardIndex];
  }

  /*//////////////////////////////////////////////////////////////
                          ACCOUNTING LOGIC
    //////////////////////////////////////////////////////////////*/

  // Calculate the total underlaying 'want' held by the strat.
  function balanceOf() public view virtual returns (uint256) {}

  // Calculates how much 'want' this contract holds.
  function balanceOfWant() public view virtual returns (uint256) {}

  // Calculates how much 'want' the strategy has working in the farm.
  function balanceOfPool() public view virtual returns (uint256) {}

  /*//////////////////////////////////////////////////////////////
                          SWAPPING LOGIC
    //////////////////////////////////////////////////////////////*/
  // Swap compatible with UniswapV2 interface.
  function _uniV2Swap(
    address _router,
    address[] memory _route,
    uint256 _amount
  ) internal {
    IUniswapRouterV2(_router).swapExactTokensForTokens(_amount, 0, _route, address(this), block.timestamp + 60);
  }
}
