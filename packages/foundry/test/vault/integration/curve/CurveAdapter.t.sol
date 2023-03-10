// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { CurveAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IGauge, IGaugeFactory } from "../../../../src/vault/adapter/curve/CurveAdapter.sol";
import { CurveTestConfigStorage, CurveTestConfig } from "./CurveTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";

contract CurveAdapterTest is AbstractAdapterTest {
  using Math for uint256;

  address crv;
  IGaugeFactory gaugeFactory;
  IGauge gauge;
  uint256 gaugeId;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("polygon"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new CurveTestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    (address _crv, address _gaugeFactory, uint256 _gaugeId) = abi.decode(testConfig, (address, address, uint256));

    crv = _crv;
    gaugeFactory = IGaugeFactory(_gaugeFactory);
    gauge = IGauge(gaugeFactory.get_gauge(_gaugeId));
    asset = IERC20(gauge.lp_token());

    setUpBaseTest(IERC20(asset), address(new CurveAdapter()), address(gaugeFactory), 10, "Curve", true);

    vm.label(address(crv), "CRV");
    vm.label(address(gaugeFactory), "gaugeFactory");
    vm.label(address(gauge), "gauge");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), externalRegistry, testConfig);
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(gauge), asset.balanceOf(address(gauge)) + amount);
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

    assertEq(asset.allowance(address(adapter), address(gauge)), type(uint256).max, "allowance");
  }
}
