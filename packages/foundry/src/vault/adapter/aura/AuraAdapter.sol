// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AdapterBase, IERC20, IERC20Metadata, SafeERC20, ERC20, Math, IStrategy, IAdapter } from "../abstracts/AdapterBase.sol";
import { WithRewards, IWithRewards } from "../abstracts/WithRewards.sol";
import { IAuraBooster, IAuraRewards, IAuraStaking } from "./IAura.sol";

/**
 * @title   Aura Adapter
 * @author amatureApe
 * @notice  ERC4626 wrapper for Aura Vaults.
 *
 * An ERC4626 compliant Wrapper for https://github.com/sushiswap/sushiswap/blob/archieve/canary/contracts/Aura.sol.
 * Allows wrapping Aura Vaults.
 */
contract AuraAdapter is AdapterBase, WithRewards {
  using SafeERC20 for IERC20;
  using Math for uint256;

  string internal _name;
  string internal _symbol;

  /// @notice The Aura booster contract
  IAuraBooster public auraBooster;

  /// @notice The reward contract for Aura gauge
  IAuraRewards public auraRewards;

  /// @notice The staking contract for Aura
  IAuraStaking public auraStaking;

  /// @notice Aura lpToken
  address public auraLpToken;

  /// @notice The pool ID
  uint256 public pid;

  /*//////////////////////////////////////////////////////////////
                            INITIALIZATION
    //////////////////////////////////////////////////////////////*/

  error InvalidAsset();

  /**
   * @notice Initialize a new Aura Adapter.
   * @param adapterInitData Encoded data for the base adapter initialization.
   * @dev `_pid` - The poolId for lpToken.
   * @dev `_auraBooster` - The main Aura contract
   * @dev This function is called by the factory contract when deploying a new vault.
   */

  function initialize(bytes memory adapterInitData, address registry, bytes memory auraInitData) external initializer {
    __AdapterBase_init(adapterInitData);

    (uint256 _pid, address _auraBooster) = abi.decode(auraInitData, (uint256, address));

    auraBooster = IAuraBooster(_auraBooster);
    pid = _pid;

    auraStaking = IAuraStaking(auraBooster.stakerRewards());

    (address balancerLpToken, address _auraLpToken, address _auraGauge, address _auraRewards, , ) = auraBooster
      .poolInfo(pid);

    auraRewards = IAuraRewards(_auraRewards);
    auraLpToken = _auraLpToken;

    if (balancerLpToken != asset()) revert InvalidAsset();

    _name = string.concat("Popcorn Aura", IERC20Metadata(asset()).name(), " Adapter");
    _symbol = string.concat("popB-", IERC20Metadata(asset()).symbol());

    IERC20(balancerLpToken).approve(address(auraBooster), type(uint256).max);
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
    return auraRewards.balanceOf(address(this));
  }

  /*//////////////////////////////////////////////////////////////
                          INTERNAL HOOKS LOGIC
    //////////////////////////////////////////////////////////////*/

  function _protocolDeposit(uint256 amount, uint256) internal override {
    auraBooster.deposit(pid, amount, true);
  }

  function _protocolWithdraw(uint256 amount, uint256) internal override {
    auraRewards.withdrawAndUnwrap(amount, true);
  }

  /*//////////////////////////////////////////////////////////////
                            STRATEGY LOGIC
    //////////////////////////////////////////////////////////////*/
  /// @notice Claim rewards from the aura
  function claim() public override onlyStrategy {
    auraRewards.getReward();
  }

  /// @notice The token rewarded
  function rewardTokens() external view override returns (address[] memory) {
    address[] memory _rewardTokens = new address[](2);
    _rewardTokens[0] = auraStaking.crv();
    _rewardTokens[1] = auraStaking.cvx();

    return _rewardTokens;
  }

  /*//////////////////////////////////////////////////////////////
                      EIP-165 LOGIC
  //////////////////////////////////////////////////////////////*/

  function supportsInterface(bytes4 interfaceId) public pure override(WithRewards, AdapterBase) returns (bool) {
    return interfaceId == type(IWithRewards).interfaceId || interfaceId == type(IAdapter).interfaceId;
  }
}
