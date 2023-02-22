pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct MasterChefTestConfig {
  uint256 pid;
}

contract MasterChefTestConfigStorage is ITestConfigStorage {
  MasterChefTestConfig[] internal testConfigs;

  constructor() {
    testConfigs.push(MasterChefTestConfig(2));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].pid);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
