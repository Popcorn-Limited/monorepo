// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { GearboxAdapter, SafeERC20, IERC20, IERC20Metadata, Math, PercentageMath, IPoolService, IAddressProvider, IGearboxContractRegistry } from "../../../../src/vault/adapter/gearbox/GearboxAdapter.sol";
import { IERC4626Upgradeable as IERC4626, IERC20Upgradeable as IERC20 } from "openzeppelin-contracts-upgradeable/interfaces/IERC4626Upgradeable.sol";
import { GearboxTestConfigStorage, GearboxTestConfig } from "./GearboxTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";
import { SafeMath } from "openzeppelin-contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract GearboxAdapterTest is AbstractAdapterTest {
  using Math for uint256;
  using SafeMath for uint256;
  using PercentageMath for uint256;

  // VaultAPI lidoVault;
  // VaultAPI lidoBooster;
  uint256 maxAssetsNew;
  IAdapter adapterTest;

  uint256 public pid;

  /// @notice The booster address for Convex
  IPoolService public pool;

  IAddressProvider public gearboxAddressProvider;

  // IERC20 public asset;
  IERC20 public dieselToken;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new GearboxTestConfigStorage(1)));

    // _setUpTest(testConfigStorage.getTestConfig(0));
    bytes memory encodedData = abi.encode(0xcF64698AFF7E5f27A11dff868AF228653ba53be0, 1);
    _setUpTest(encodedData);

    maxAssetsNew = Math.min(
      (pool.expectedLiquidityLimit().sub(pool.expectedLiquidity())) / 100,
      dieselToken.totalSupply() / 100
    );
    defaultAmount = Math.min(10**IERC20Metadata(address(asset)).decimals() * 1e9, maxAssetsNew);
    maxAssets = Math.min(10**IERC20Metadata(address(asset)).decimals() * 1e9, maxAssetsNew);
    console.log("maxAssetsNew", maxAssetsNew);
    maxShares = pool.expectedLiquidityLimit().sub(pool.expectedLiquidity()).div(3);
  }

  function _setUpTest(bytes memory testConfig) internal {
    createAdapter();

    (address _gearboxAddressProvider, uint256 _pid) = abi.decode(testConfig, (address, uint256));

    gearboxAddressProvider = IAddressProvider(_gearboxAddressProvider);

    pool = IPoolService(IGearboxContractRegistry(gearboxAddressProvider.getContractsRegister()).pools(_pid));
    pid = _pid;
    asset = IERC20(pool.underlyingToken());
    dieselToken = IERC20(pool.dieselToken());

    setUpBaseTest(
      asset,
      address(new GearboxAdapter()),
      0xcF64698AFF7E5f27A11dff868AF228653ba53be0,
      10,
      "Gearbox  ",
      false
    );

    vm.label(address(pool), "GearboxPool");
    vm.label(address(asset), "asset");
    vm.label(address(dieselToken), "dieselToken");
    vm.label(address(this), "test");

    adapter.initialize(
      abi.encode(asset, address(this), address(0), 0, sigs, ""),
      address(0),
      abi.encode(0xcF64698AFF7E5f27A11dff868AF228653ba53be0, 1)
    );
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function createAdapter() public override {
    adapter = IAdapter(address(new GearboxAdapter()));
  }

  function increasePricePerShare(uint256 amount) public override {
    deal(address(dieselToken), address(adapter), dieselToken.balanceOf(address(this)) + amount);
  }

  function iouBalance() public view override returns (uint256) {
    return dieselToken.balanceOf(address(adapter));
  }

  function test__unpause() public virtual override {
    _mintFor(defaultAmount * 3, bob);

    vm.prank(bob);
    adapter.deposit(defaultAmount, bob);

    uint256 oldTotalAssets = adapter.totalAssets();
    uint256 oldTotalSupply = adapter.totalSupply();
    uint256 oldIouBalance = iouBalance();

    adapter.pause();
    adapter.unpause();

    // We simply deposit back into the external protocol
    // TotalSupply and Assets dont change
    assertApproxEqAbs(oldTotalAssets, adapter.totalAssets(), _delta_, "totalAssets");
    assertApproxEqAbs(oldTotalSupply, adapter.totalSupply(), _delta_, "totalSupply");
    assertApproxEqAbs(asset.balanceOf(address(adapter)), 0, _delta_, "asset balance");
    assertApproxEqAbs(iouBalance(), oldIouBalance, _delta_, "iou balance");

    // Deposit and mint dont revert
    vm.startPrank(bob);
    adapter.deposit(defaultAmount, bob);
    adapter.mint(defaultAmount, bob);
  }

  // // This test fails on the original implementation due to the fact that the amount of assets returned when we withdraw will be lower because of the swap slippage
  function test__withdraw(uint8 fuzzAmount) public virtual override {
    uint256 amount = bound(uint256(fuzzAmount), minFuzz, maxAssets);
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

  function test__RT_deposit_withdraw() public virtual override {
    _mintFor(defaultAmount, bob);

    vm.startPrank(bob);
    uint256 shares1 = adapter.deposit(defaultAmount, bob);
    uint256 shares2 = adapter.withdraw(defaultAmount, bob, bob);
    vm.stopPrank();

    assertGe(shares2, shares1 - 1, testId); // you lose 1 share to the rounding
  }

  function test__RT_mint_redeem() public virtual override {
    _mintFor(adapter.previewMint(defaultAmount), bob);

    vm.startPrank(bob);
    uint256 assets1 = adapter.mint(defaultAmount, bob);
    uint256 assets2 = adapter.redeem(defaultAmount, bob, bob);
    vm.stopPrank();

    assertLe(assets2 - 1, assets1, testId); //
  }

  function test__mint(uint8 fuzzAmount) public virtual override {
    uint256 amount = bound(uint256(fuzzAmount), minFuzz, maxShares);
    uint8 len = uint8(testConfigStorage.getTestConfigLength());
    for (uint8 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      _mintFor(adapter.previewMint(amount), bob);
      prop_mint(bob, bob, amount, testId);

      increasePricePerShare(raise);

      if (amount > adapter.maxMint(bob)) {
        // This condition stops the user from depositing more than the Gearbox pool will accept
        uint256 amountOfAssetsThatCanBeDeposited = adapter.maxMint(bob);
        _mintFor(adapter.previewMint(amountOfAssetsThatCanBeDeposited), bob);
        prop_mint(bob, alice, amountOfAssetsThatCanBeDeposited, testId);
      } else {
        _mintFor(adapter.previewMint(amount), bob);
        prop_mint(bob, alice, amount, testId);
      }
    }
  }

  // // This test fails on the original implementation due to the fact that that the defaultAmount needs to be adjusted
  function test__redeem(uint8 fuzzAmount) public virtual override {
    uint256 amount = bound(uint256(fuzzAmount), 10, defaultAmount);
    uint8 len = uint8(testConfigStorage.getTestConfigLength());
    for (uint8 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      uint256 reqAssets = (adapter.previewMint(adapter.previewWithdraw(amount)) * 10) / 8;
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
}
