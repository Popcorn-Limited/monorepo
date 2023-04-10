// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../abstracts/WithRewards.sol";
import { IGauge, ILpToken } from "./IVelodrome.sol";

/**
 * @title   Velodrome Adapter
 * @author  amatureApe
 * @notice  ERC4626 wrapper for Velodrome Vaults.
 *
 * Allows wrapping Velodrome Vaults.
 */
contract VelodromeAdapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  /// @notice The Velodrome contract
  IGauge public gauge;

  /// @notice The address of the lpToken token
  ILpToken public lpToken;

  /// @notice The VELO token
  address public velo;

  /*//////////////////////////////////////////////////////////////
                            INITIALIZATION
    //////////////////////////////////////////////////////////////*/

  error InvalidAsset();

  /**
   * @notice Initialize a new Velodrome Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @dev `_pid` - The poolId for lpToken.
   * @dev `_rewardsToken` - The token rewarded by the Solidly contract (Sushi, Cake...)
   * @dev This function is called by the factory contract when deploying a new vault.
   */

  function initialize(
    bytes memory adapterInitData,
    address registry,
    bytes memory velodromeInitData
  ) external initializer {
    __AdapterBase_init(adapterInitData);

    address _gauge = abi.decode(velodromeInitData, (address));

    gauge = IGauge(_gauge);
    lpToken = ILpToken(gauge.stake());
    velo = gauge.rewards(2);

    if (address(lpToken) != asset()) revert InvalidAsset();

    _name = string.concat("Popcorn Velodrome", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(asset()).symbol());

    IERC20(address(lpToken)).approve(address(gauge), type(uint256).max);
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

  function _totalAssets() internal view override returns (uint256) {
    return gauge.balanceOf(address(this));
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  function _protocolDeposit(uint256 amount, uint256) internal override {
    gauge.deposit(amount, 0);
  }

  function _protocolWithdraw(uint256 amount, uint256) internal override {
    gauge.withdraw(amount);
  }

  /*//////////////////////////////////////////////////////////////
                            STRATEGY LOGIC
    //////////////////////////////////////////////////////////////*/
  /// @notice Claim rewards from the Velodrome gauge
  function claim() public override onlyStrategy {
    address[] memory rewardTokens = IWithRewards(address(this)).rewardTokens();
    gauge.getReward(address(this), rewardTokens);
  }

  /// @notice The tokens rewarded
  function rewardTokens() external view override returns (address[] memory) {
    address[] memory _rewardTokens = new address[](3);

    _rewardTokens[0] = lpToken.token0();
    _rewardTokens[1] = lpToken.token1();
    _rewardTokens[2] = velo;

    return _rewardTokens;
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
