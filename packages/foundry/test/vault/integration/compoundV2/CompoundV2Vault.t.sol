// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AbstractVaultIntegrationTest } from "../abstract/AbstractVaultIntegrationTest.sol";
import { CompoundV2Adapter, SafeERC20, IERC20, IERC20Metadata, Math, ICToken, IComptroller, IStrategy, IAdapter } from "../../../../src/vault/adapter/compound/compoundV2/CompoundV2Adapter.sol";
import { CompoundV2TestConfigStorage, CompoundV2TestConfig, ITestConfigStorage } from "./CompoundV2TestConfigStorage.sol";
import { MockStrategy } from "../../../utils/mocks/MockStrategy.sol";
import { Strings } from "openzeppelin-contracts/utils/Strings.sol";

contract CompoundV2VaultTest is AbstractVaultIntegrationTest {
  using Math for uint256;

  ICToken cToken;
  IComptroller comptroller;
  IStrategy strategy;

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
    strategy = IStrategy(address(new MockStrategy()));

    (bool isListed, , ) = comptroller.markets(address(cToken));
    assertEq(isListed, true, "InvalidAsset");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), address(comptroller), testConfig);

    setUpBaseTest(asset, adapter, "CompoundV2", 1);

    vm.label(address(cToken), "cToken");
    vm.label(address(comptroller), "comptroller");
    vm.label(address(strategy), "strategy");
    vm.label(address(this), "test");

    defaultAmount = 100e18;
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

    /*//////////////////////////////////////////////////////////////
                          DEPOSIT / WITHDRAW
    //////////////////////////////////////////////////////////////*/


  function test__deposit_withdrawl_pps_stays_constant(uint80 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), defaultAmount, maxDeposit);

    uint256 pps1;
    uint256 pps2;
    uint256 len = Math.min(uint256(testConfigStorage.getTestConfigLength()), maxConfigs);
    // solhint-disable
    for (uint256 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      // solhint-disable-next-line
      for (uint256 i; i < 3; ++i) {
        pps1 = vault.convertToAssets(defaultAmount);
        deposit(amount);
        pps2 = vault.convertToAssets(defaultAmount);
        assertWithin(pps1, pps2, 2.5e8, string.concat(Strings.toString(i), "-deposit-", testId));
      }
      // solhint-disable-next-line
      for (uint256 i; i < 2; ++i) {
        pps1 = vault.convertToAssets(defaultAmount);
        vm.prank(bob);
        vault.withdraw(amount);
        pps2 = vault.convertToAssets(defaultAmount);
        assertWithin(pps1, pps2, 2.5e8, string.concat(Strings.toString(i), "-withdraw-", testId));
      }
    }
  }

    /*//////////////////////////////////////////////////////////////
                          MINT / REDEEM
    //////////////////////////////////////////////////////////////*/

  function test__mint_redeem_pps_stays_constant(uint80 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), defaultAmount, maxDeposit);

    uint256 pps1;
    uint256 pps2;
    uint256 len = Math.min(uint256(testConfigStorage.getTestConfigLength()), maxConfigs);
    // solhint-disable
    for (uint256 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      // solhint-disable-next-line
      for (uint256 i; i < 3; ++i) {
        pps1 = vault.convertToAssets(defaultAmount);
        mint(amount);
        pps2 = vault.convertToAssets(defaultAmount);
        assertWithin(pps1, pps2, 2.5e8, string.concat(Strings.toString(i), "-mint-", testId));
      }
      // solhint-disable-next-line
      for (uint256 i; i < 2; ++i) {
        pps1 = vault.convertToAssets(defaultAmount);
        vm.prank(bob);
        vault.redeem(amount);
        pps2 = vault.convertToAssets(defaultAmount);
        assertWithin(pps1, pps2, 2.5e8, string.concat(Strings.toString(i), "-redeem-", testId));
      }
    }
  }

  function test__mint_redeem_preview_resembles_actual(uint80 fuzzAmount) public override {
    uint256 amount = bound(uint256(fuzzAmount), defaultAmount, maxDeposit);

    uint256 len = Math.min(uint256(testConfigStorage.getTestConfigLength()), maxConfigs);
    // solhint-disable
    for (uint256 i; i < len; i++) {
      if (i > 0) overrideSetup(testConfigStorage.getTestConfig(i));

      mint(defaultAmount);

      increasePricePerShare(amount * 1000);

      uint256 expectedShares = vault.previewMint(amount);
      uint256 actualShares = mint(amount);
      assertWithin(actualShares, expectedShares, 1, string.concat("mint-", testId));

      expectedShares = vault.previewRedeem(amount);
      vm.prank(bob);
      actualShares = vault.redeem(amount);
      assertWithin(actualShares, expectedShares, 2, string.concat("redeem-", testId));
    }
  }

}
