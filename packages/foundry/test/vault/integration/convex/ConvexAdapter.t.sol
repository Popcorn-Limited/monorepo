// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { ConvexAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IConvexBooster, IConvexRewards } from "../../../../src/vault/adapter/convex/ConvexAdapter.sol";
import { ConvexTestConfigStorage, ConvexTestConfig } from "./ConvexTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";

contract ConvexAdapterTest is AbstractAdapterTest {
  using Math for uint256;

  IConvexBooster convexBooster = IConvexBooster(0xF403C135812408BFbE8713b5A23a04b3D48AAE31);
  IConvexRewards convexRewards;
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
    uint256 _pid = abi.decode(testConfig, (uint256));

    pid = _pid;

    (address _asset, , , address _convexRewards, , ) = convexBooster.poolInfo(pid);
    convexRewards = IConvexRewards(_convexRewards);

    setUpBaseTest(IERC20(_asset), address(new ConvexAdapter()), address(convexBooster), 10, "Convex", true);

    vm.label(address(convexBooster), "convexBooster");
    vm.label(address(convexRewards), "convexRewards");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), externalRegistry, testConfig);
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(convexRewards), asset.balanceOf(address(convexRewards)) + amount);
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

    assertEq(asset.allowance(address(adapter), address(convexBooster)), type(uint256).max, "allowance");
  }
}
