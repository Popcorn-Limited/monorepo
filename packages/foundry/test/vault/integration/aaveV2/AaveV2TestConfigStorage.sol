// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct AaveV2TestConfig {
  address asset;
  address aaveDataProvider;
}

contract AaveV2TestConfigStorage is ITestConfigStorage {
  AaveV2TestConfig[] internal testConfigs;

  constructor() {
    // Polygon - wETH
    testConfigs.push(
      AaveV2TestConfig(0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619, 0x7551b5D2763519d4e37e8B81929D336De671d46d)
    );
    // Polygon - usdc
    testConfigs.push(
      AaveV2TestConfig(0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174, 0x7551b5D2763519d4e37e8B81929D336De671d46d)
    );
    // Polygon - usdt
    testConfigs.push(
      AaveV2TestConfig(0xc2132D05D31c914a87C6611C10748AEb04B58e8F, 0x7551b5D2763519d4e37e8B81929D336De671d46d)
    );
        // Polygon - dai
    testConfigs.push(
      AaveV2TestConfig(0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063, 0x7551b5D2763519d4e37e8B81929D336De671d46d)
    );
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].asset, testConfigs[i].aaveDataProvider);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
