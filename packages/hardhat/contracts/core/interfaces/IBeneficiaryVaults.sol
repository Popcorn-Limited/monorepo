// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

interface IBeneficiaryVaults {
  function vaultExists(uint8 vaultId_) external view returns (bool);

  function openVault(uint8 vaultId_, bytes32 merkleRoot_) external;

  function closeVault(uint8 vaultId_) external;

  function allocateRewards() external;
}
