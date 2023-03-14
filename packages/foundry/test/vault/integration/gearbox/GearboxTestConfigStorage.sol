// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct GearboxTestConfig {
  address _gearboxAddressProvider;
  uint256 _pid;
}

contract GearboxTestConfigStorage {
  GearboxTestConfig[] internal testConfigs;

  // pid 0 = DAI
  // pid 1 = USDC
  constructor(uint256 pid) {
    // USDC
    if (pid == 1) {
      testConfigs.push(GearboxTestConfig(0xcF64698AFF7E5f27A11dff868AF228653ba53be0, 1));
    }

    // WETH
    // testConfigs.push(GearboxTestConfig(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2));
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i]._pid);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
