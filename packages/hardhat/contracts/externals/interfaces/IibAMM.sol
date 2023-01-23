// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

interface IibAMM {
  function buy(
    address to,
    uint256 amount,
    uint256 minOut
  ) external returns (bool);

  function buy_quote(address to, uint256 amount) external view returns (uint256);
}
