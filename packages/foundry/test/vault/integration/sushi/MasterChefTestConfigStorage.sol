pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct MasterChefTestConfig {
  uint256 pid;
  address rewardsToken;
}

contract MasterChefTestConfigStorage is ITestConfigStorage {
  MasterChefTestConfig[] internal testConfigs;

  constructor() {
    testConfigs.push(MasterChefTestConfig(2, 0x6B3595068778DD592e39A122f4f5a5cF09C90fE2));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].pid, testConfigs[i].rewardsToken);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
