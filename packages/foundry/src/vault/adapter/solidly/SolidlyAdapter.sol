// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../abstracts/WithRewards.sol";
import { IGauge, ILpToken } from "./ISolidly.sol";

/**
 * @title   Solidly Adapter
 * @author  amatureApe
 * @notice  ERC4626 wrapper for Solidly Vaults.
 *
 * Allows wrapping Solidly Vaults.
 */
contract SolidlyAdapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  /// @notice The Solidly contract
  IGauge public gauge;

  /// @notice The address of the lpToken token
  ILpToken public lpToken;

  /// @notice The SOLID token
  address public solid;

  /*//////////////////////////////////////////////////////////////
                            INITIALIZATION
    //////////////////////////////////////////////////////////////*/

  error InvalidAsset();

  /**
   * @notice Initialize a new Solidly Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @dev `_pid` - The poolId for lpToken.
   * @dev `_rewardsToken` - The token rewarded by the Solidly contract (Sushi, Cake...)
   * @dev This function is called by the factory contract when deploying a new vault.
   */

  function initialize(
    bytes memory adapterInitData,
    address registry,
    bytes memory solidlyInitData
  ) external initializer {
    __AdapterBase_init(adapterInitData);

    address _gauge = abi.decode(solidlyInitData, (address));

    gauge = IGauge(_gauge);
    lpToken = ILpToken(gauge.stake());
    solid = gauge.solid();

    if (address(lpToken) != asset()) revert InvalidAsset();

    _name = string.concat("Popcorn Solidly", IERC20Metadata(asset()).name(), " Adapter");
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
    address[] memory optTokens = new address[](3);
    optTokens[0] = lpToken.token0();
    optTokens[1] = lpToken.token1();
    optTokens[2] = solid;

    gauge.depositAndOptIn(amount, 0, optTokens);
  }

  function _protocolWithdraw(uint256 amount, uint256) internal override {
    gauge.withdraw(amount);
  }

  /*//////////////////////////////////////////////////////////////
                            STRATEGY LOGIC
    //////////////////////////////////////////////////////////////*/
  /// @notice Claim rewards from the Solidly gauge
  function claim() public override onlyStrategy {
    address[] memory rewardTokens = IWithRewards(address(this)).rewardTokens();
    gauge.getReward(address(this), rewardTokens);
  }

  /// @notice The tokens rewarded
  function rewardTokens() external view override returns (address[] memory) {
    uint256 rewardLen = gauge.rewardsListLength();
    address[] memory _rewardTokens = new address[](rewardLen);

    for (uint256 i; i < rewardLen; ++i) {
      _rewardTokens[i] = gauge.rewards(i);
    }

    return _rewardTokens;
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
