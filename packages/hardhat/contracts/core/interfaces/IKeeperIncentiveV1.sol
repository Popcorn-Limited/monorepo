// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

interface IKeeperIncentiveV1 {
  function handleKeeperIncentive(
    bytes32 _contractName,
    uint8 _i,
    address _keeper
  ) external;
}
