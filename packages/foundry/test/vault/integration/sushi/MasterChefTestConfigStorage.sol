pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct MasterChefTestConfig {
  uint256 pid;
  address rewardsToken;
}

contract MasterChefTestConfigStorage is ITestConfigStorage {
  MasterChefTestConfig[] internal testConfigs;

  constructor() {
    testConfigs.push(MasterChefTestConfig(2, 0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].pid, testConfigs[i].rewardsToken);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
