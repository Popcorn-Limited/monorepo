// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

interface IWETH {
  function deposit() external payable;

  function withdraw(uint256 amount) external;
}
