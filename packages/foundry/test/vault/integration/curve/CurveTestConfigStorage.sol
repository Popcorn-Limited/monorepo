// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { ITestConfigStorage } from "../abstract/ITestConfigStorage.sol";

struct CurveTestConfig {
  address crv;
  address gaugeFactory;
  uint256 gaugeId;
}

contract CurveTestConfigStorage is ITestConfigStorage {
  CurveTestConfig[] internal testConfigs;

  constructor() {
    // Mainnet - wETH
    testConfigs.push(
      CurveTestConfig(0x172370d5Cd63279eFa6d502DAB29171933a610AF, 0xabC000d88f23Bb45525E447528DBF656A9D55bf5, 6)
    );
  }

  function getTestConfig(uint256 i) public view returns (bytes memory) {
    return abi.encode(testConfigs[i].crv, testConfigs[i].gaugeFactory, testConfigs[i].gaugeId);
  }

  function getTestConfigLength() public view returns (uint256) {
    return testConfigs.length;
  }
}
