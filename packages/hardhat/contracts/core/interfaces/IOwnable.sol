// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

interface IOwnable {
  function transferOwnership(address _newOwner) external;
}
