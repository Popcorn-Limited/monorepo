// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AbstractVaultIntegrationTest } from "../abstract/AbstractVaultIntegrationTest.sol";
import { ConvexAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IStrategy, IAdapter, IConvexBooster, IBaseRewarder } from "../../../../src/vault/adapter/convex/ConvexAdapter.sol";
import { ConvexTestConfigStorage, ConvexTestConfig, ITestConfigStorage } from "./ConvexTestConfigStorage.sol";
import { MockStrategy } from "../../../utils/mocks/MockStrategy.sol";

contract ConvexVaultTest is AbstractVaultIntegrationTest {
  using Math for uint256;

  IConvexBooster booster;
  IBaseRewarder baseRewarder;
  uint256 pid;

  IStrategy strategy;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new ConvexTestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    createAdapter();

    (address _booster, uint256 _pid) = abi.decode(testConfig, (address, uint256));

    booster = IConvexBooster(_booster);
    pid = _pid;

    (, , , address _baseRewarder, , ) = booster.poolInfo(pid);
    baseRewarder = IBaseRewarder(_baseRewarder);

    strategy = IStrategy(address(new MockStrategy()));

    adapter.initialize(
      abi.encode(IERC20(baseRewarder.stakingToken()), address(this), strategy, 0, sigs, ""),
      address(booster),
      testConfig
    );

    setUpBaseTest(IERC20(baseRewarder.stakingToken()), adapter, "Convex", 1);

    vm.label(address(booster), "booster");
    vm.label(address(baseRewarder), "baseRewarder");
    vm.label(address(strategy), "strategy");
    vm.label(address(this), "test");
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function createAdapter() public override {
    adapter = IAdapter(address(new ConvexAdapter()));
  }

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(baseRewarder), asset.balanceOf(address(baseRewarder)) + amount);
  }
}
