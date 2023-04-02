pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct AuraTestConfig {
  uint256 pid;
  address auraBooster;
}

contract AuraTestConfigStorage is ITestConfigStorage {
  AuraTestConfig[] internal testConfigs;

  constructor() {
    testConfigs.push(AuraTestConfig(0, 0xA57b8d98dAE62B26Ec3bcC4a365338157060B234));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].pid, testConfigs[i].auraBooster);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
