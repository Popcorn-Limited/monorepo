// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { CompoundV2Adapter, SafeERC20, IERC20, IERC20Metadata, Math, ICToken, IComptroller } from "../../../../src/vault/adapter/compound/compoundV2/CompoundV2Adapter.sol";
import { CompoundV2TestConfigStorage, CompoundV2TestConfig } from "./CompoundV2TestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";

contract CompoundV2AdapterTest is AbstractAdapterTest {
  using Math for uint256;

  ICToken cToken;
  IComptroller comptroller;

  uint256 compoundDefaultAmount = 1e9;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new CompoundV2TestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    createAdapter();

    address _cToken = abi.decode(testConfig, (address));

    cToken = ICToken(_cToken);
    asset = IERC20(cToken.underlying());
    comptroller = IComptroller(cToken.comptroller());

    (bool isListed, , ) = comptroller.markets(address(cToken));
    assertEq(isListed, true, "InvalidAsset");

    setUpBaseTest(IERC20(asset), adapter, address(comptroller), 10, "CompoundV2", true);

    vm.label(address(cToken), "cToken");
    vm.label(address(comptroller), "comptroller");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), externalRegistry, testConfig);
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function createAdapter() public override {
    adapter = IAdapter(address(new CompoundV2Adapter()));
  }

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(cToken), asset.balanceOf(address(cToken)) + amount);
  }

  function iouBalance() public view override returns (uint256) {
    return cToken.balanceOf(address(adapter));
  }

  // Verify that totalAssets returns the expected amount
  function verify_totalAssets() public override {
    // Make sure totalAssets isn't 0
    deal(address(asset), bob, compoundDefaultAmount);
    vm.startPrank(bob);
    asset.approve(address(adapter), compoundDefaultAmount);
    adapter.deposit(compoundDefaultAmount, bob);
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
    assertEq(adapter.asset(), cToken.underlying(), "asset");
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

    assertEq(asset.allowance(address(adapter), address(cToken)), type(uint256).max, "allowance");
  }

  function getApy() public view returns (uint256) {
    return 0;
  }

  /*//////////////////////////////////////////////////////////////
                          PREVIEW VIEWS
    //////////////////////////////////////////////////////////////*/

  function test__previewDeposit(uint8 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), 1e9, maxAssets);

    deal(address(asset), bob, maxAssets);
    vm.prank(bob);
    asset.approve(address(adapter), maxAssets);

    prop_previewDeposit(bob, bob, amount, testId);
  }

  function test__previewMint(uint8 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), 1e9, maxShares);

    deal(address(asset), bob, maxAssets);
    vm.prank(bob);
    asset.approve(address(adapter), maxAssets);

    prop_previewMint(bob, bob, amount, testId);
  }

  function test__previewWithdraw(uint8 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), 1e9, maxAssets);

    uint256 reqAssets = (adapter.previewMint(adapter.previewWithdraw(amount)) * 10) / 9;
    _mintFor(reqAssets, bob);
    vm.prank(bob);
    adapter.deposit(reqAssets, bob);

    prop_previewWithdraw(bob, bob, bob, amount, testId);
  }

  function test__previewRedeem(uint8 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), 1e9, maxShares);

    uint256 reqAssets = (adapter.previewMint(amount) * 10) / 9;
    _mintFor(reqAssets, bob);
    vm.prank(bob);
    adapter.deposit(reqAssets, bob);

    prop_previewRedeem(bob, bob, bob, amount, testId);
  }

  /*//////////////////////////////////////////////////////////////
                    DEPOSIT/MINT/WITHDRAW/REDEEM
    //////////////////////////////////////////////////////////////*/

  function test__deposit(uint8 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), 1e9, maxAssets);
    uint8 len = uint8(testConfigStorage.getTestConfigLength());
    for (uint8 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      _mintFor(amount, bob);
      prop_deposit(bob, bob, amount, testId);

      increasePricePerShare(raise);

      _mintFor(amount, bob);
      prop_deposit(bob, alice, amount, testId);
    }
  }

  function test__mint(uint8 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), 1e9, maxShares);
    uint8 len = uint8(testConfigStorage.getTestConfigLength());
    for (uint8 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      _mintFor(adapter.previewMint(amount), bob);
      prop_mint(bob, bob, amount, testId);

      increasePricePerShare(raise);

      _mintFor(adapter.previewMint(amount), bob);
      prop_mint(bob, alice, amount, testId);
    }
  }

  function test__withdraw(uint8 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), 1e9, maxAssets);
    uint8 len = uint8(testConfigStorage.getTestConfigLength());
    for (uint8 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      uint256 reqAssets = (adapter.previewMint(adapter.previewWithdraw(amount)) * 10) / 8;
      _mintFor(reqAssets, bob);
      vm.prank(bob);
      adapter.deposit(reqAssets, bob);
      prop_withdraw(bob, bob, amount, testId);

      _mintFor(reqAssets, bob);
      vm.prank(bob);
      adapter.deposit(reqAssets, bob);

      increasePricePerShare(raise);

      vm.prank(bob);
      adapter.approve(alice, type(uint256).max);
      prop_withdraw(alice, bob, amount, testId);
    }
  }

  function test__redeem(uint8 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), 1e9, maxShares);
    uint8 len = uint8(testConfigStorage.getTestConfigLength());
    for (uint8 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      uint256 reqAssets = (adapter.previewMint(amount) * 10) / 9;
      _mintFor(reqAssets, bob);
      vm.prank(bob);
      adapter.deposit(reqAssets, bob);
      prop_redeem(bob, bob, amount, testId);

      _mintFor(reqAssets, bob);
      vm.prank(bob);
      adapter.deposit(reqAssets, bob);

      increasePricePerShare(raise);

      vm.prank(bob);
      adapter.approve(alice, type(uint256).max);
      prop_redeem(alice, bob, amount, testId);
    }
  }

  /*//////////////////////////////////////////////////////////////
                          ROUNDTRIP TESTS
    //////////////////////////////////////////////////////////////*/

  function test__RT_deposit_redeem() public override {
    _mintFor(compoundDefaultAmount, bob);

    vm.startPrank(bob);
    uint256 shares = adapter.deposit(compoundDefaultAmount, bob);
    uint256 assets = adapter.redeem(shares, bob, bob);
    vm.stopPrank();

    assertLe(assets, compoundDefaultAmount, testId);
  }

  function test__RT_deposit_withdraw() public override {
    _mintFor(1e18, bob);

    vm.startPrank(bob);
    uint256 shares1 = adapter.deposit(1e18, bob);
    uint256 shares2 = adapter.withdraw(adapter.maxWithdraw(bob), bob, bob);
    vm.stopPrank();

    assertGe(shares2, shares1, testId);
  }

  function test__RT_mint_withdraw() public override {
    _mintFor(adapter.previewMint(compoundDefaultAmount), bob);

    vm.startPrank(bob);
    uint256 assets = adapter.mint(compoundDefaultAmount, bob);
    uint256 shares = adapter.withdraw(adapter.maxWithdraw(bob), bob, bob);
    vm.stopPrank();

    assertGe(shares, compoundDefaultAmount, testId);
  }

  function test__RT_mint_redeem() public override {
    _mintFor(adapter.previewMint(compoundDefaultAmount), bob);

    vm.startPrank(bob);
    uint256 assets1 = adapter.mint(compoundDefaultAmount, bob);
    uint256 assets2 = adapter.redeem(compoundDefaultAmount, bob, bob);
    vm.stopPrank();

    assertLe(assets2, assets1, testId);
  }

  /*//////////////////////////////////////////////////////////////
                              PAUSE
    //////////////////////////////////////////////////////////////*/

  function test__pause() public override {
    _mintFor(compoundDefaultAmount, bob);

    vm.prank(bob);
    adapter.deposit(compoundDefaultAmount, bob);

    uint256 oldTotalAssets = adapter.totalAssets();
    uint256 oldTotalSupply = adapter.totalSupply();

    adapter.pause();

    // We simply withdraw into the adapter
    // TotalSupply and Assets dont change
    assertApproxEqAbs(oldTotalAssets, adapter.totalAssets(), _delta_, "totalAssets");
    assertApproxEqAbs(oldTotalSupply, adapter.totalSupply(), _delta_, "totalSupply");
    assertApproxEqAbs(asset.balanceOf(address(adapter)), oldTotalAssets, _delta_, "asset balance");
    assertApproxEqAbs(iouBalance(), 0, _delta_, "iou balance");

    vm.startPrank(bob);
    // Deposit and mint are paused (maxDeposit/maxMint are set to 0 on pause)
    vm.expectRevert(abi.encodeWithSelector(MaxError.selector, compoundDefaultAmount));
    adapter.deposit(compoundDefaultAmount, bob);

    vm.expectRevert(abi.encodeWithSelector(MaxError.selector, compoundDefaultAmount));
    adapter.mint(compoundDefaultAmount, bob);

    // Withdraw and Redeem dont revert
    adapter.withdraw(compoundDefaultAmount / 10, bob, bob);
    adapter.redeem(compoundDefaultAmount / 10, bob, bob);
  }

  function test__unpause() public override {
    _mintFor(3e18, bob);

    vm.prank(bob);
    adapter.deposit(1e18, bob);

    uint256 oldTotalAssets = adapter.totalAssets();
    uint256 oldTotalSupply = adapter.totalSupply();
    uint256 oldIouBalance = iouBalance();

    adapter.pause();
    adapter.unpause();

    // We simply deposit back into the external protocol
    // TotalSupply and Assets dont change
    // A Tiny change in cToken balance will throw of the assets by some margin.
    assertApproxEqAbs(oldTotalAssets, adapter.totalAssets(), 3e8, "totalAssets");
    assertApproxEqAbs(oldTotalSupply, adapter.totalSupply(), _delta_, "totalSupply");
    assertApproxEqAbs(asset.balanceOf(address(adapter)), 0, _delta_, "asset balance");
    assertApproxEqAbs(iouBalance(), oldIouBalance, _delta_, "iou balance");

    // Deposit and mint dont revert
    vm.startPrank(bob);
    adapter.deposit(1e18, bob);
    adapter.mint(1e18, bob);
  }

  /*//////////////////////////////////////////////////////////////
                              HARVEST
    //////////////////////////////////////////////////////////////*/

   function test__harvest() public override {
    uint256 performanceFee = 1e16;
    uint256 hwm = 1e18;
    _mintFor(1e18, bob);

    vm.prank(bob);
    adapter.deposit(1e18, bob);

    uint256 oldTotalAssets = adapter.totalAssets();
    adapter.setPerformanceFee(performanceFee);
    increasePricePerShare(raise * 100);

    uint256 gain = ((adapter.convertToAssets(1e18) - adapter.highWaterMark()) * adapter.totalSupply()) / 1e18;
    uint256 fee = (gain * performanceFee) / 1e18;
    uint256 expectedFee = adapter.convertToShares(fee);

    vm.expectEmit(false, false, false, true, address(adapter));
    emit Harvested();

    adapter.harvest();

    assertApproxEqAbs(adapter.totalSupply(), 1e18 + expectedFee, _delta_, "totalSupply");
    assertApproxEqAbs(adapter.balanceOf(feeRecipient), expectedFee, _delta_, "expectedFee");
  }
}
