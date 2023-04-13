// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { GearboxPassivePoolAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IContractRegistry, IContractRegistry, IPoolService } from "../../../../../src/vault/adapter/gearbox/passivePool/GearboxPassivePoolAdapter.sol";
import { GearboxPassivePoolTestConfigStorage, GearboxPassivePoolTestConfig } from "./GearboxPassivePoolTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../../abstract/AbstractAdapterTest.sol";

contract GearboxPassivePoolAdapterTest is AbstractAdapterTest {
  using Math for uint256;

  IAddressProvider addressProvider = IAddressProvider(0xcF64698AFF7E5f27A11dff868AF228653ba53be0);
  IPoolService poolService;
  IERC20 dieselToken;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new GearboxPassivePoolTestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    uint256 _pid = abi.decode(testConfig, (uint256));

    poolService = IPoolService(IContractRegistry(addressProvider.getContractsRegister()).pools(_pid));
    dieselToken = IERC20(poolService.dieselToken());

    setUpBaseTest(
      IERC20(poolService.underlyingToken()),
      address(new GearboxPassivePoolAdapter()),
      address(addressProvider),
      10,
      "Gearbox PP ",
      false
    );

    vm.label(address(poolService), "poolService");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");

    adapter.initialize(
      abi.encode(asset, address(this), address(0), 0, sigs, ""),
      externalRegistry,
      testConfig
    );
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function increasePricePerShare(uint256 amount) public override {
    // deal(address(asset), address(yearnVault), asset.balanceOf(address(yearnVault)) + amount);
  }

  function iouBalance() public view override returns (uint256) {
    return dieselToken.balanceOf(address(adapter));
  }

  // Verify that totalAssets returns the expected amount
  // function verify_totalAssets() public override {
  //   // Make sure totalAssets isnt 0
  //   deal(address(asset), bob, defaultAmount);
  //   vm.startPrank(bob);
  //   asset.approve(address(adapter), defaultAmount);
  //   adapter.deposit(defaultAmount, bob);
  //   vm.stopPrank();

  //   assertApproxEqAbs(
  //     adapter.totalAssets(),
  //     adapter.convertToAssets(adapter.totalSupply()),
  //     _delta_,
  //     string.concat("totalSupply converted != totalAssets", baseTestId)
  //   );

  //   assertApproxEqAbs(
  //     adapter.totalAssets(),
  //     iouBalance().mulDiv(
  //       yearnVault.pricePerShare(),
  //       10 ** IERC20Metadata(address(asset)).decimals(),
  //       Math.Rounding.Up
  //     ),
  //     _delta_,
  //     string.concat("totalAssets != yearn assets", baseTestId)
  //   );
  // }
}
