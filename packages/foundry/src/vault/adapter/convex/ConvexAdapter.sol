// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../abstracts/WithRewards.sol";
import { IConvexBooster, IBaseRewarder } from "./IConvex.sol";

/**
 * @title   Convex Adapter
 * @author  amatureApe
 * @notice  ERC4626 wrapper for Convex Vaults.
 *
 * An ERC4626 compliant Wrapper for https://github.com/beefyfinance/beefy-contracts/blob/master/contracts/BIFI/vaults/BeefyVaultV6.sol.
 * Allows wrapping Convex Vaults with or without an active Booster.
 * Allows for additional strategies to use rewardsToken in case of an active Booster.
 */
contract ConvexAdapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  /// @notice The poolId inside Convex booster for relevant Curve lpToken.
  uint256 public pid;

  /// @notice The booster address for Convex
  IConvexBooster public booster;

  /// @notice The Convex BaseRewarder.
  IBaseRewarder public baseRewarder;

  /*//////////////////////////////////////////////////////////////
                            INITIALIZATION
    //////////////////////////////////////////////////////////////*/

  /**
   * @notice Initialize a new Convex Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @param convexInitData Encoded data for the convex adapter initialization.
   * @dev `_booster` - The booster address for Convex.
   * @dev `_pid` - The poolId for lpToken.
   * @dev This function is called by the factory contract when deploying a new vault.
   */
  function initialize(
    bytes memory adapterInitData,
    address,
    bytes memory convexInitData
  ) public {
    __AdapterBase_init(adapterInitData);

    (address _booster, uint256 _pid) = abi.decode(convexInitData, (address, uint256));

    booster = IConvexBooster(_booster);
    pid = _pid;

    (, , , address _baseRewarder, , ) = booster.poolInfo(pid);
    baseRewarder = IBaseRewarder(_baseRewarder);

    _name = string.concat("Popcorn Convex", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(asset()).symbol());

    IERC20(asset()).approve(address(booster), type(uint256).max);
  }

  function name() public view override(IERC20Metadata, ERC20) returns (string memory) {
    return _name;
  }

  function symbol() public view override(IERC20Metadata, ERC20) returns (string memory) {
    return _symbol;
  }

  /*//////////////////////////////////////////////////////////////
                            ACCOUNTING LOGIC
    //////////////////////////////////////////////////////////////*/

  /// @notice Calculates the total amount of underlying tokens the Vault holds.
  /// @return The total amount of underlying tokens the Vault holds.
  function totalAssets() public view override returns (uint256) {
    return paused() ? IERC20(asset()).balanceOf(address(this)) : baseRewarder.balanceOf(address(this));
  }

  /// @notice Calculates the total amount of underlying tokens the user holds.
  /// @return The total amount of underlying tokens the user holds.
  function balanceOfUnderlying(address account) public view returns (uint256) {
    return convertToAssets(balanceOf(account));
  }

  function previewWithdraw(uint256 assets) public view override returns (uint256) {
    return _convertToShares(assets, Math.Rounding.Up);
  }

  function previewRedeem(uint256 shares) public view override returns (uint256) {
    return _convertToAssets(shares, Math.Rounding.Down);
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  /// @notice Deposit into Convex booster contract
  function _protocolDeposit(uint256 amount, uint256) internal virtual override {
    booster.deposit(pid, amount, true);
  }

  /// @notice Withdraw from Convex booster contract
  function _protocolWithdraw(uint256, uint256 shares) internal virtual override {
    uint256 convexShares = convertToUnderlyingShares(0, shares);
    booster.withdraw(pid, convexShares);
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
