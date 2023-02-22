// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../abstracts/WithRewards.sol";
import { IMasterChef, IRewarder } from "./IMasterChef.sol";

/**
 * @title   MasterChef Adapter
 * @notice  ERC4626 wrapper for MasterChef Vaults.
 *
 * An ERC4626 compliant Wrapper for https://github.com/sushiswap/sushiswap/blob/archieve/canary/contracts/MasterChefV2.sol.
 * Allows wrapping MasterChef Vaults.
 */
contract MasterChefAdapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  IMasterChef public masterChef;
  IRewarder public rewards;

  uint256 public pid;

  /**
   * @notice Initialize a new MasterChef Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @dev `_pid` - The poolId for lpToken.
   * @dev This function is called by the factory contract when deploying a new vault.
   */
  function initialize(
    bytes memory adapterInitData,
    address registry,
    bytes memory masterchefInitData
  ) external initializer {
    //need to check that the poolID and the asset is correct
    uint256 _pid = abi.decode(masterchefInitData, (uint256));

    masterChef = IMasterChef(registry);

    __AdapterBase_init(adapterInitData);

    pid = _pid;

    IMasterChef.PoolInfo memory info = masterChef.poolInfo(_pid);

    _name = string.concat("Popcorn MasterChef", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(asset()).symbol());

    IERC20(info.lpToken).approve(address(masterChef), type(uint256).max);
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

  function totalAssets() public view virtual override returns (uint256) {
    return paused() ? IERC20(asset()).balanceOf(address(this)) : rewards.balanceOf(address(this));
  }

  function previewWithdraw(uint256 assets) public view virtual override returns (uint256) {
    return _convertToShares(assets, Math.Rounding.Up);
  }

  function previewRedeem(uint256 shares) public view override returns (uint256) {
    return _convertToAssets(shares, Math.Rounding.Up);
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  function _protocolDeposit(uint256 amount, uint256) internal virtual override {
    masterChef.deposit(pid, amount);
  }

  function _protocolWithdraw(
    uint256 assets,
    uint256 shares,
    uint256 pool
  ) internal virtual {
    masterChef.withdraw(pool, convertToUnderlyingShares(assets, shares));
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
