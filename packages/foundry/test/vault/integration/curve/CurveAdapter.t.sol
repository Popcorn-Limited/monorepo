// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { CurveAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IGauge, IGaugeFactory, IWithRewards, IStrategy } from "../../../../src/vault/adapter/curve/CurveAdapter.sol";
import { CurveTestConfigStorage, CurveTestConfig } from "./CurveTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";
import { MockStrategyClaimer } from "../../../utils/mocks/MockStrategyClaimer.sol";

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

  function test__claim() public override {
    strategy = IStrategy(address(new MockStrategyClaimer()));
    createAdapter();
    adapter.initialize(
      abi.encode(asset, address(this), strategy, 0, sigs, ""),
      externalRegistry,
      testConfigStorage.getTestConfig(0)
    );

    _mintFor(1000e18, bob);

    vm.prank(bob);
    adapter.deposit(1000e18, bob);

    vm.warp(block.timestamp + 30 days);

    vm.prank(bob);
    adapter.withdraw(1, bob, bob);

    address[] memory rewardTokens = IWithRewards(address(adapter)).rewardTokens();
    assertEq(rewardTokens[0], 0x172370d5Cd63279eFa6d502DAB29171933a610AF); // CRV

    assertGt(IERC20(rewardTokens[0]).balanceOf(address(adapter)), 0);
  }
}
