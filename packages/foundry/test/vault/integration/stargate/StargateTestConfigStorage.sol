// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct StargateTestConfig {
  uint256 stakingPid;
}

contract StargateTestConfigStorage is ITestConfigStorage {
  StargateTestConfig[] internal testConfigs;

  constructor() {
    // Ethereum - sUSDC
    // testConfigs.push(StargateTestConfig(0));
    // Ethereum - sUSDT
    testConfigs.push(StargateTestConfig(1));
    // Ethereum - sDAI
    // testConfigs.push(StargateTestConfig(3));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].stakingPid);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
