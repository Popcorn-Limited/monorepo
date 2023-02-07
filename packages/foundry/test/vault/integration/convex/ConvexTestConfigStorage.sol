// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct ConvexTestConfig {
  address booster;
  uint256 pid;
}

contract ConvexTestConfigStorage is ITestConfigStorage {
  ConvexTestConfig[] internal testConfigs;

  constructor() {
    // Mainnet - wETH
    testConfigs.push(ConvexTestConfig(0xF403C135812408BFbE8713b5A23a04b3D48AAE31, 61));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].booster, testConfigs[i].pid);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
