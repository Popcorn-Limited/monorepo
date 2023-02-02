// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AbstractVaultIntegrationTest } from "../../abstract/AbstractVaultIntegrationTest.sol";
import { CompoundV2Adapter, SafeERC20, IERC20, IERC20Metadata, Math, ICToken, IComptroller, IStrategy, IAdapter } from "../../../../../src/vault/adapter/compound/CompoundV2/CompoundV2Adapter.sol";
import { CompoundV2TestConfigStorage, CompoundV2TestConfig, ITestConfigStorage } from "./CompoundV2TestConfigStorage.sol";
import { MockStrategy } from "../../../../utils/mocks/MockStrategy.sol";

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

    address _asset = abi.decode(testConfig, (address));

    cToken = ICToken(_asset);
    comptroller = IComptroller(cToken.comptroller());
    strategy = IStrategy(address(new MockStrategy()));

    (bool isListed, , ) = comptroller.markets(address(cToken));
    assertEq(isListed, true, "InvalidAsset");

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), address(comptroller), "");

    setUpBaseTest(IERC20(_asset), adapter, "CompoundV2", 1);

    vm.label(address(cToken), "cToken");
    vm.label(address(comptroller), "comptroller");
    vm.label(address(strategy), "strategy");
    vm.label(address(this), "test");
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
}
