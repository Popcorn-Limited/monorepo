// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct StargateTestConfig {
  uint256 pid;
  address stargateStaking;
}

contract StargateTestConfigStorage is ITestConfigStorage {
  StargateTestConfig[] internal testConfigs;

  constructor() {
    // Polygon - sUSDT
    testConfigs.push(StargateTestConfig(2, 0x8731d54E9D02c286767d56ac03e8037C07e01e98));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].pid, testConfigs[i].stargateStaking);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
