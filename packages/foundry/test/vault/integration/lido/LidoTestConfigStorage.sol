// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct LidoTestConfig {
  uint256 slippage;
}

contract LidoTestConfigStorage is ITestConfigStorage {
  LidoTestConfig[] internal testConfigs;

  constructor() {
    // WETH
    testConfigs.push(LidoTestConfig(1e16));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].slippage);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
