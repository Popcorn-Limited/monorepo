// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { IWithRewards } from "../../interfaces/vault/IWithRewards.sol";
import { IEIP165 } from "../../interfaces/IEIP165.sol";
import { MathUpgradeable as Math } from "openzeppelin-contracts-upgradeable/utils/math/MathUpgradeable.sol";
import { ERC4626Upgradeable as ERC4626, ERC20Upgradeable as ERC20 } from "openzeppelin-contracts-upgradeable/token/ERC20/extensions/ERC4626Upgradeable.sol";
import { IUniswapRouterV2 } from "../../interfaces/external/uni/IUniswapRouterV2.sol";
import { IAdapter } from "../../interfaces/vault/IAdapter.sol";
import { IWithRewards } from "../../interfaces/vault/IWithRewards.sol";

contract StrategyBase {
  using Math for uint256;

  // Tokens used
  address public native;
  address public lpPair;
  address public lpToken0;
  address public lpToken1;

  // Protocol contracts info (masterchefs, poolIds, etc.)
  address[] public protocolAddresses;
  uint256[] public protocolUints;

  // Vault and Strategist
  address public vault;
  address public strategist;

  // Rewards and Routes
  address public router;
  /**
   * @dev rewardToken index must match respective path index.
   * @dev Paths follow this pattern: [rewardToken, ...hops, native]
   */
  address[] public rewardTokens;
  address[][] public rewardRoutes;
  address[] public nativeToLp0Route;
  address[] public nativeToLp1Route;

  // Data management
  uint256 public lastHarvest;

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

  // Setup for routes and allowances in constructor.
  function _setUp(address[] memory _nativeToLp0Route, address[] memory _nativeToLp1Route) internal virtual {}

  // Give allowances necessary for deposit, withdraw, lpToken swaps, and addLiquidity.
  function _giveAllowances() internal virtual {}

  // Give allowances for rewardToken swaps.
  function giveRewardAllowances() public {
    uint256 len = rewardTokens.length;
    for (uint256 i; i < len; ++i) {
      ERC20(rewardTokens[i]).approve(router, type(uint256).max);
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

  // harvest rewards.
  function harvest() public virtual {
    if (_rewardsCheck() == true && _rewardRoutesCheck() == true) {
      _compound();
    }

    lastHarvest = block.timestamp;

    emit Harvest();
  }

  // Logic to claim rewards, swap rewards to native, charge fees, swap native to lpTokens, add liquidity, and re-deposit.
  function _compound() internal virtual {}

  /*//////////////////////////////////////////////////////////////
                          REWARDS AND ROUTES
    //////////////////////////////////////////////////////////////*/

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public view virtual returns (uint256[] memory) {}

  // Check to see that at least 1 reward is available.
  function _rewardsCheck() internal view virtual returns (bool) {
    uint256[] memory rewards;
    rewards = rewardsAvailable();

    uint256 len = rewards.length;
    for (uint256 i; i < len; ++i) {
      if (rewards[i] > 0) {
        return true;
      }
    }

    return false;
  }

  // Check to make sure all rewardTokens have correct respective routes.
  function _rewardRoutesCheck() internal view virtual returns (bool) {
    uint256 len = rewardTokens.length;

    for (uint256 i; i < len; ++i) {
      if (rewardTokens[i] != rewardRoutes[i][0] || native != rewardRoutes[i][rewardRoutes.length - 1]) return false;
    }

    return true;
  }

  // Set rewardRoute at index.
  function setRewardRoute(uint256 rewardIndex, address[] memory route) public virtual {
    rewardRoutes[rewardIndex] = route;
  }

  // Get rewardRoute at index.
  function getRewardRoute(uint256 rewardIndex) public view virtual returns (address[] memory) {
    return rewardRoutes[rewardIndex];
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
}
