// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

interface ISynthetix {
  function exchangeAtomically(
    bytes32 sourceCurrencyKey,
    uint256 sourceAmount,
    bytes32 destinationCurrencyKey,
    bytes32 trackingCode,
    uint256 minAmount
  ) external returns (uint256);
}
