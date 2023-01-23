// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

import "../interfaces/IKeeperIncentiveV2.sol";

/**
 * @dev Either set incentiveVigBps or keeperPayout. Both would be overkill
 * @dev KeeperPayout is not used in here but in KeeperIncentiveV2 and is here as reference
 */
struct KeeperConfig {
  uint256 minWithdrawalAmount; // minimum amount required of accrued fees for calling withdrawAccruedFees
  uint256 incentiveVigBps; // percentage of accrued fees (in bps) allocated to fund the keeper incentive reserves
  uint256 keeperPayout; // amount paid out to keeper per invocation of incentivized function - withdrawAccruedFees()
}

/**
 *  @notice Provides modifiers and internal functions for processing keeper incentives
 *  @dev Derived contracts using `KeeperIncentivized` must also inherit `ContractRegistryAccess`
 *   and override `_getContract`.
 */
abstract contract KeeperIncentivized {
  /**
   *  @notice Role ID for KeeperIncentive
   *  @dev Equal to keccak256("KeeperIncentive")
   */
  bytes32 public constant KEEPER_INCENTIVE = 0x35ed2e1befd3b2dcf1ec7a6834437fa3212881ed81fd3a13dc97c3438896e1ba;

  event KeeperConfigUpdated(KeeperConfig oldConfig, KeeperConfig newConfig);

  /**
   *  @notice Process the specified incentive with `msg.sender` as the keeper address
   *  @param _index uint8 incentive ID
   */
  modifier keeperIncentive(uint8 _index) {
    _handleKeeperIncentive(_index, msg.sender);
    _;
  }

  /**
   *  @notice Process a keeper incentive
   *  @param _index uint8 incentive ID
   *  @param _keeper address of keeper to reward
   */
  function _handleKeeperIncentive(uint8 _index, address _keeper) internal {
    _keeperIncentive().handleKeeperIncentive(_index, _keeper);
  }

  /**
   *  @notice Return an IKeeperIncentive interface to the registered KeeperIncentive contract
   *  @return IKeeperIncentive keeper incentive interface
   */
  function _keeperIncentive() internal view returns (IKeeperIncentiveV2) {
    return IKeeperIncentiveV2(_getContract(KEEPER_INCENTIVE));
  }

  /**
   * @notice Tip a keeper
   * @param _rewardToken address of token to tip keeper with
   * @param _keeper address of keeper receiving the tip
   * @param _i incentive index
   * @param _amount amount of reward token to tip
   */
  function _tip(
    address _rewardToken,
    address _keeper,
    uint256 _i,
    uint256 _amount
  ) internal {
    return _keeperIncentive().tip(_rewardToken, _keeper, _i, _amount);
  }

  /**
   *  @notice Get a contract address by name from the contract registry
   *  @param _name bytes32 contract name
   *  @return contract address
   *  @dev Users of this abstract contract should also inherit from `ContractRegistryAccess`
   *   and override `_getContract` in their implementation.
   */
  function _getContract(bytes32 _name) internal view virtual returns (address);
}
