// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { AbstractVaultIntegrationTest } from "../abstract/AbstractVaultIntegrationTest.sol";
import { AaveV3Adapter, SafeERC20, IERC20, IERC20Metadata, Math, ILendingPool, IAaveIncentives, IAToken, IStrategy, IAdapter, IProtocolDataProvider } from "../../../../src/vault/adapter/aave/aaveV3/AaveV3Adapter.sol";
import { AaveV3TestConfigStorage, AaveV3TestConfig, ITestConfigStorage } from "./AaveV3TestConfigStorage.sol";
import { MockStrategy } from "../../../utils/mocks/MockStrategy.sol";

contract AaveV3VaultTest is AbstractVaultIntegrationTest {
  using Math for uint256;

  ILendingPool lendingPool;
  IAaveIncentives aaveIncentives;
  IAToken aToken;
  IStrategy strategy;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("polygon"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new AaveV3TestConfigStorage()));

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
    aaveIncentives = IAaveIncentives(aToken.getIncentivesController());
    strategy = IStrategy(address(new MockStrategy()));

    adapter.initialize(abi.encode(IERC20(_asset), address(this), strategy, 0, sigs, ""), aaveDataProvider, "");

    setUpBaseTest(IERC20(_asset), adapter, "AaveV2", 1);

    vm.label(address(aToken), "aToken");
    vm.label(address(lendingPool), "lendingPool");
    vm.label(address(aaveIncentives), "aaveIncentives");
    vm.label(address(strategy), "strategy");
    vm.label(address(this), "test");
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function createAdapter() public override {
    adapter = IAdapter(address(new AaveV3Adapter()));
  }

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(aToken), asset.balanceOf(address(aToken)) + amount);
  }
}
