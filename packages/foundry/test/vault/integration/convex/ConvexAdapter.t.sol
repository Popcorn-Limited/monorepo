// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { ConvexAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IConvexBooster, IBaseRewarder } from "../../../../src/vault/adapter/convex/ConvexAdapter.sol";
import { ConvexTestConfigStorage, ConvexTestConfig } from "./ConvexTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";

contract ConvexAdapterTest is AbstractAdapterTest {
  using Math for uint256;

  IConvexBooster booster;
  IBaseRewarder baseRewarder;
  uint256 pid;

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

    (address _asset, , , address _baseRewarder, , ) = booster.poolInfo(pid);
    baseRewarder = IBaseRewarder(_baseRewarder);

    setUpBaseTest(IERC20(_asset), adapter, address(0), 10, "Convex", true);

    vm.label(address(booster), "booster");
    vm.label(address(baseRewarder), "baseRewarder");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), externalRegistry, testConfig);
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

  // Verify that totalAssets returns the expected amount
  function verify_totalAssets() public override {
    // Make sure totalAssets isnt 0
    deal(address(asset), bob, defaultAmount);
    vm.startPrank(bob);
    asset.approve(address(adapter), defaultAmount);
    adapter.deposit(defaultAmount, bob);
    vm.stopPrank();

    assertEq(
      adapter.totalAssets(),
      adapter.convertToAssets(adapter.totalSupply()),
      string.concat("totalSupply converted != totalAssets", baseTestId)
    );
  }

  /*//////////////////////////////////////////////////////////////
                          INITIALIZATION
    //////////////////////////////////////////////////////////////*/

  function verify_adapterInit() public override {
    assertEq(adapter.asset(), address(asset), "asset");
    assertEq(
      IERC20Metadata(address(adapter)).symbol(),
      string.concat("popB-", IERC20Metadata(address(asset)).symbol()),
      "symbol"
    );
    assertEq(
      IERC20Metadata(address(adapter)).symbol(),
      string.concat("popB-", IERC20Metadata(address(asset)).symbol()),
      "symbol"
    );

    assertEq(asset.allowance(address(adapter), address(booster)), type(uint256).max, "allowance");
  }
}
