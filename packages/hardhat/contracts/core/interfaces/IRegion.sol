// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

interface IRegion {
  function defaultRegion() external view returns (bytes32);

  function regionExists(bytes32 region) external view returns (bool);

  function regionVaults(bytes32 region) external view returns (address);

  function getAllRegions() external view returns (bytes32[] memory);

  function getAllVaults() external view returns (address[] memory);

  function addRegion(bytes32 region, address beneficiaryVault) external;
}
