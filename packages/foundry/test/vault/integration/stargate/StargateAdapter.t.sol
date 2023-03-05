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
  IStargateStaking stargateStaking = IStargateStaking(0xB0D502E938ed5f4df2E681fE6E419ff29631d62b);

  uint256 pid;
  uint256 stakingPid;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new StargateTestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    uint256 _stakingPid = abi.decode(testConfig, (uint256));

    (address _sToken, , , ) = stargateStaking.poolInfo(_stakingPid);

    sToken = ISToken(_sToken);
    asset = IERC20(sToken.token());

    pid = sToken.poolId();
    stakingPid = _stakingPid;

    stargateRouter = IStargateRouter(sToken.router());

    setUpBaseTest(IERC20(asset), address(new StargateAdapter()), address(stargateStaking), 10, "Stargate", true);

    vm.label(address(sToken), "sToken");
    vm.label(address(stargateRouter), "stargateRouter");
    vm.label(address(stargateStaking), "stargateStaking");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), externalRegistry, testConfig);

    minFuzz = defaultAmount;
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

  function test__stargate() public {
    _mintFor(1e18, address(this));
    asset.approve(address(stargateRouter), type(uint256).max);
    stargateRouter.addLiquidity(pid, 1e18, address(this));

    uint256 sTokenBal = sToken.balanceOf(address(this));
    emit log_named_uint("sTokenBal", sTokenBal);

    sToken.approve(address(stargateStaking), type(uint256).max);
    stargateStaking.deposit(stakingPid, sTokenBal);

    (uint256 stake, ) = stargateStaking.userInfo(stakingPid, address(this));
    emit log_named_uint("stake", stake);
  }
}
