// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../core/utils/ParticipationReward.sol";

contract ParticipationRewardHelper {
  using SafeERC20 for IERC20;

  ParticipationReward public participationReward;
  bytes32 public immutable contractName = "ParticipationRewardHelper";

  constructor(ParticipationReward _participationReward) {
    participationReward = _participationReward;
  }

  function initializeVault(bytes32 vaultId_, uint256 endTime_) external {
    participationReward.initializeVault(contractName, vaultId_, endTime_);
  }

  function openVault(bytes32 vaultId_) external {
    participationReward.openVault(contractName, vaultId_);
  }

  function addShares(
    bytes32 vaultId_,
    address account_,
    uint256 shares_
  ) external {
    participationReward.addShares(contractName, vaultId_, account_, shares_);
  }
}
