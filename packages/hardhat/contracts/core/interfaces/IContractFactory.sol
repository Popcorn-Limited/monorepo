// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

/**
 * @dev External interface of for any kind of factories in the vault ecosystem
 */
interface IContractFactory {
  function setImplementation(address implementation) external;

  function nominateNewOwner(address newOwner) external;

  function acceptOwnership() external;
}
