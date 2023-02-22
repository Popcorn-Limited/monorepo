// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity 0.8.15;

import { AbstractVaultIntegrationTest } from "../abstract/AbstractVaultIntegrationTest.sol";
import { MasterChefAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IStrategy, IAdapter, IMasterChef, IRewarder } from "../../../../src/vault/adapter/sushi/MasterChefAdapter.sol";
import { MasterChefTestConfigStorage, MasterChefTestConfig, ITestConfigStorage } from "./MasterChefTestConfigStorage.sol";
import { MockStrategy } from "../../../utils/mocks/MockStrategy.sol";

contract MasterChefVaultTest is AbstractVaultIntegrationTest {
  using Math for uint256;

  IMasterChef public masterChef;
  IRewarder public rewards;
  uint256 pid;

  IStrategy strategy;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new MasterChefTestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    createAdapter();

    (address _masterChef, uint256 _pid) = abi.decode(testConfig, (address, uint256));

    masterChef = IMasterChef(_masterChef);
    pid = _pid;

    IMasterChef.PoolInfo memory info = masterChef.poolInfo(_pid);

    strategy = IStrategy(address(new MockStrategy()));

    adapter.initialize(abi.encode(asset, address(this), strategy, 0, sigs, ""), _masterChef, testConfig);

    setUpBaseTest(IERC20(_masterChef), adapter, "MasterChef", 1);

    vm.label(address(_masterChef), "masterChef");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function createAdapter() public override {
    adapter = IAdapter(address(new MasterChefAdapter()));
  }

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(masterChef), asset.balanceOf(address(masterChef)) + amount);
  }
}
