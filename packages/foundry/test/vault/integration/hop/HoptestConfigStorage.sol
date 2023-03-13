pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct HopTestConfig {
  address want;
}

contract HopTestConfigStorage is ITestConfigStorage {
  HopTestConfig[] internal testConfigs;

  constructor() {
    testConfigs.push(HopTestConfig(0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].want);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
