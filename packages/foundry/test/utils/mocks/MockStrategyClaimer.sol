pragma solidity ^0.8.15;

import { IWithRewards } from "../../../src/interfaces/vault/IWithRewards.sol";


contract MockStrategyClaimer {
  event SelectorsVerified();
  event AdapterVerified();
  event StrategySetup();
  event StrategyExecuted();

  function verifyAdapterSelectorCompatibility(bytes4[8] memory) public {
    emit SelectorsVerified();
  }

  function verifyAdapterCompatibility(bytes memory) public {
    emit AdapterVerified();
  }

  function setUp(bytes memory) public {
    emit StrategySetup();
  }

  function harvest() public {
    IWithRewards(address(this)).claim();
    emit StrategyExecuted();
  }
}
