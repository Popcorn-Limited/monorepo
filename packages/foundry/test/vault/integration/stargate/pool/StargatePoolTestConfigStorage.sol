// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../../abstract/ITestConfigStorage.sol";

struct StargatePoolTestConfig {
  uint256 stakingPid;
}

contract StargatePoolTestConfigStorage is ITestConfigStorage {
  StargatePoolTestConfig[] internal testConfigs;

  constructor() {
    // Ethereum - sUSDC
    // testConfigs.push(StargatePoolTestConfig(0));
    // Ethereum - sUSDT
    testConfigs.push(StargatePoolTestConfig(1));
    // Ethereum - sDAI
    // testConfigs.push(StargatePoolTestConfig(3));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].stakingPid);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
