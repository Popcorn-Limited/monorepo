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
  address[][] public rewardToNativeRoutes;
  address[] public nativeToLp0Route;
  address[] public nativeToLp1Route;

  // Data management
  uint256 public lastHarvest;
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

  // Setup for routes and allowances in constructor.
  function _setUp(
    address[] memory _nativeToLp0Route,
    address[] memory _nativeToLp1Route,
    address[][] memory _rewardToNativeRoutes
  ) internal virtual {}

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
  function _compound() internal virtual {
    _claimRewards();
    _swapRewardsToNative();
    _chargeFees();
    _swapNativeToLpTokens();
    _addLiquidity();
    _redeposit();
  }

  // Claim rewards from underlying protocol
  function _claimRewards() internal virtual {}

  // Swap all rewards to native token
  function _swapRewardsToNative() internal virtual {}

  // Charge fees for Popcorn
  function _chargeFees() internal virtual {}

  // Swap native tokens for lpTokens
  function _swapNativeToLpTokens() internal virtual {}

  // Use lpTokens to create lpPair
  function _addLiquidity() internal virtual {}

  // redeposit lpPair into underlying protocol
  function _redeposit() internal virtual {}

  /*//////////////////////////////////////////////////////////////
                          REWARDS AND ROUTES
    //////////////////////////////////////////////////////////////*/

  // Return available rewards for all rewardTokens.
  function rewardsAvailable() public virtual returns (uint256[] memory) {}

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
        rewardTokens[i] != rewardToNativeRoutes[i][0] ||
        native != rewardToNativeRoutes[i][rewardToNativeRoutes.length - 1]
      ) return false;
    }

    return true;
  }

  // Set rewardRoute at index.
  function setRewardRoute(uint256 rewardIndex, address[] memory route) public virtual {
    rewardToNativeRoutes[rewardIndex] = route;
  }

  // Get rewardRoute at index.
  function getRewardRoute(uint256 rewardIndex) public view virtual returns (address[] memory) {
    return rewardToNativeRoutes[rewardIndex];
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
    IUniswapRouterV2(router).swapExactTokensForTokens(_amount, 0, _route, address(this), block.timestamp + 60);
  }

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
