// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0

pragma solidity ^0.8.0;

interface IRandomNumberConsumer {
  function getRandomNumber(uint256 electionId, uint256 seed) external;

  function getRandomResult(uint256 electionId) external view returns (uint256);
}
