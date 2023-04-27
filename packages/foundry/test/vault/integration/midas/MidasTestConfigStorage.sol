// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../../abstract/ITestConfigStorage.sol";

struct MidasTestConfig {
  address asset;
}

contract MidasTestConfigStorage is ITestConfigStorage {
  MidasTestConfig[] internal testConfigs;

  constructor() {
    // Mainnet - cDAI
    testConfigs.push(MidasTestConfig(0x835482FE0532f169024d5E9410199369aAD5C77E));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].asset);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
