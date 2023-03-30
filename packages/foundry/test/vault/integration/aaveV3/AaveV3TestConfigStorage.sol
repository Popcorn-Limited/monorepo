// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct AaveV3TestConfig {
  address asset;
  address aaveDataProvider;
}

contract AaveV3TestConfigStorage is ITestConfigStorage {
  AaveV3TestConfig[] internal testConfigs;

  constructor() {
    // Polygon - usdc
    testConfigs.push(
      AaveV3TestConfig(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, 0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654)
    );
    // Polygon - usdt
    // testConfigs.push(
    //   AaveV3TestConfig(0xc2132D05D31c914a87C6611C10748AEb04B58e8F, 0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654)
    // );
    // Polygon - dai
    // testConfigs.push(
    //   AaveV3TestConfig(0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063, 0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654)
    // );
    // // Polygon - wETH
    // testConfigs.push(
    //   AaveV3TestConfig(0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619, 0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654)
    // );
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].asset, testConfigs[i].aaveDataProvider);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
