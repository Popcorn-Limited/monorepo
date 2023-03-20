// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct BeefyTestConfig {
  address beefyVault;
  address beefyBooster;
  string network;
}

contract BeefyTestConfigStorage is ITestConfigStorage {
  BeefyTestConfig[] internal testConfigs;

  constructor() {
    // Polygon - stMATIC-MATIC vault
    testConfigs.push(
      BeefyTestConfig(0xF79BF908d0e6d8E7054375CD80dD33424B1980bf, 0x69C28193185CFcd42D62690Db3767915872bC5EA, "polygon")
    );

    // Ethereum - stEth-ETH vault
    testConfigs.push(BeefyTestConfig(0xa7739fd3d12ac7F16D8329AF3Ee407e19De10D8D, address(0), "mainnet"));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].beefyVault, testConfigs[i].beefyBooster, testConfigs[i].network);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
