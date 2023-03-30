pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct HopTestConfig {
  address liquidityPool;
  address stakingRewards;
}

contract HopTestConfigStorage is ITestConfigStorage {
  HopTestConfig[] internal testConfigs;

  constructor() {
    testConfigs.push(
      HopTestConfig(0xaa30D6bba6285d0585722e2440Ff89E23EF68864, 0x3f27c540ADaE3a9E8c875C61e3B970b559d7F65d)
    );
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].liquidityPool, testConfigs[i].stakingRewards);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
