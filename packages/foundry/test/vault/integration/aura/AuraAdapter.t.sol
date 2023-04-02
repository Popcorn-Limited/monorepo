// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { AuraAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IAuraBooster, IAuraRewards, IAuraStaking, IStrategy, IAdapter, IWithRewards } from "../../../../src/vault/adapter/aura/AuraAdapter.sol";
import { AuraTestConfigStorage, AuraTestConfig } from "./AuraTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage } from "../abstract/AbstractAdapterTest.sol";
import { MockStrategyClaimer } from "../../../utils/mocks/MockStrategyClaimer.sol";

contract AuraAdapterTest is AbstractAdapterTest {
  using Math for uint256;

  IAuraBooster public auraBooster;
  IAuraRewards public auraRewards;
  IAuraStaking public auraStaking;

  address public auraLpToken;
  uint256 public pid;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new AuraTestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    (uint256 _pid, address _auraBooster) = abi.decode(testConfig, (uint256, address));

    auraBooster = IAuraBooster(_auraBooster);
    pid = _pid;

    auraStaking = IAuraStaking(auraBooster.stakerRewards());

    (address balancerLpToken, address _auraLpToken, address _auraGauge, address _auraRewards, , ) = auraBooster
      .poolInfo(pid);

    auraRewards = IAuraRewards(_auraRewards);
    auraLpToken = _auraLpToken;

    setUpBaseTest(IERC20(balancerLpToken), address(new AuraAdapter()), address(auraBooster), 10, "Aura", true);

    vm.label(address(auraBooster), "auraBooster");
    vm.label(address(auraRewards), "auraRewards");
    vm.label(address(auraStaking), "auraStaking");
    vm.label(address(auraLpToken), "auraLpToken");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), externalRegistry, testConfig);
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  // Verify that totalAssets returns the expected amount
  function verify_totalAssets() public override {
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

    assertEq(asset.allowance(address(adapter), address(auraBooster)), type(uint256).max, "allowance");
  }
}
