// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { AaveV2Adapter, SafeERC20, IERC20, IERC20Metadata, Math, ILendingPool, IAaveMining, IAToken, IProtocolDataProvider, DataTypes } from "../../../../src/vault/adapter/aave/aaveV2/AaveV2Adapter.sol";
import { AaveV2TestConfigStorage, AaveV2TestConfig } from "./AaveV2TestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";

contract AaveV2AdapterTest is AbstractAdapterTest {
  using Math for uint256;

  ILendingPool lendingPool;
  IAaveMining aaveMining;
  IAToken aToken;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("polygon"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new AaveV2TestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    createAdapter();

    (address _asset, address aaveDataProvider) = abi.decode(testConfig, (address, address));
    (address _aToken, , ) = IProtocolDataProvider(aaveDataProvider).getReserveTokensAddresses(_asset);

    aToken = IAToken(_aToken);
    lendingPool = ILendingPool(aToken.POOL());
    aaveMining = IAaveMining(aToken.getIncentivesController());

    setUpBaseTest(IERC20(_asset), adapter, aaveDataProvider, 10, "AaveV2 ", true);

    vm.label(address(aToken), "aToken");
    vm.label(address(lendingPool), "lendingPool");
    vm.label(address(aaveMining), "aaveMining");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), externalRegistry, "");
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function createAdapter() public override {
    adapter = IAdapter(address(new AaveV2Adapter()));
  }

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(aToken), asset.balanceOf(address(aToken)) + amount);
  }

  function iouBalance() public view override returns (uint256) {
    return aToken.balanceOf(address(adapter));
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
    assertEq(adapter.asset(), aToken.UNDERLYING_ASSET_ADDRESS(), "asset");
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

    assertEq(asset.allowance(address(adapter), address(lendingPool)), type(uint256).max, "allowance");
  }

  function getApy() public view returns (uint256) {
    DataTypes.ReserveData memory data = lendingPool.getReserveData(address(asset));
    uint128 supplyRate = data.currentLiquidityRate;
    return uint256(supplyRate / 1e9);
  }

  /*//////////////////////////////////////////////////////////////
                              HARVEST
    //////////////////////////////////////////////////////////////*/

  function test__harvest() public override {
    _mintFor(defaultAmount, bob);

    vm.prank(bob);
    adapter.deposit(defaultAmount, bob);

    // Skip a year
    vm.warp(block.timestamp + 365 days);

    uint256 interest = getApy();
    uint256 expectedFee = adapter.convertToShares((defaultAmount * 5e16) / 1e18);
    uint256 callTime = block.timestamp;

    if (address(strategy) != address(0)) {
      vm.expectEmit(false, false, false, true, address(adapter));
      emit StrategyExecuted();
    }
    vm.expectEmit(false, false, false, true, address(adapter));
    emit Harvested();

    adapter.harvest();

    assertApproxEqAbs(adapter.highWaterMark(), defaultAmount + interest, _delta_, "highWaterMark");
    assertApproxEqAbs(adapter.totalSupply(), defaultAmount + expectedFee, _delta_, "totalSupply");
  }

  /*//////////////////////////////////////////////////////////////
                          ROUNDTRIP TESTS
    //////////////////////////////////////////////////////////////*/

  function test__RT_deposit_withdraw() public override {
    _mintFor(defaultAmount, bob);

    vm.startPrank(bob);
    uint256 shares1 = adapter.deposit(defaultAmount, bob);
    uint256 shares2 = adapter.withdraw(defaultAmount - 1, bob, bob);
    vm.stopPrank();

    assertApproxGeAbs(shares2, shares1, _delta_, testId);
  }

  function test__RT_mint_withdraw() public override {
    _mintFor(adapter.previewMint(defaultAmount), bob);

    vm.startPrank(bob);
    uint256 assets = adapter.mint(defaultAmount, bob);
    uint256 shares = adapter.withdraw(assets - 1, bob, bob);
    vm.stopPrank();

    assertApproxGeAbs(shares, defaultAmount, _delta_, testId);
  }
}
