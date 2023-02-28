// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { StargateAdapter, SafeERC20, IERC20, IERC20Metadata, Math, ISToken, IStargateStaking, IStargateRouter } from "../../../../src/vault/adapter/stargate/StargateAdapter.sol";
import { StargateTestConfigStorage, StargateTestConfig } from "./StargateTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";

contract StargateAdapterTest is AbstractAdapterTest {
  using Math for uint256;

  ISToken sToken;
  IStargateRouter stargateRouter;
  IStargateStaking stargateStaking;
  uint256 pid;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("polygon"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new StargateTestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    createAdapter();
    (address _stargateStaking, uint256 _pid) = abi.decode(testConfig, (address, uint256));

    stargateStaking = IStargateStaking(_stargateStaking);
    pid = _pid;

    (address _sToken, , , ) = stargateStaking.poolInfo(pid);

    sToken = ISToken(_sToken);
    asset = IERC20(sToken.token());
    emit log_named_address("DING1", address(asset));

    stargateRouter = IStargateRouter(sToken.router());

    setUpBaseTest(IERC20(asset), address(new StargateAdapter()), address(stargateStaking), 10, "Stargate", true);

    vm.label(address(sToken), "sToken");
    vm.label(address(stargateRouter), "stargateRouter");
    vm.label(address(stargateStaking), "stargateStaking");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), externalRegistry, testConfig);

    defaultAmount = 10**IERC20Metadata(address(asset)).decimals();
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(sToken), asset.balanceOf(address(sToken)) + amount);
  }

  function iouBalance() public view override returns (uint256) {
    return sToken.balanceOf(address(adapter));
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
    assertEq(adapter.asset(), sToken.token(), "asset");
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

    assertEq(asset.allowance(address(adapter), address(stargateRouter)), type(uint256).max, "allowance");
    assertEq(sToken.allowance(address(adapter), address(stargateStaking)), type(uint256).max, "allowance");
  }
}
