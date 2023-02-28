// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity 0.8.15;

import { MasterChefAdapter, SafeERC20, IERC20, IERC20Metadata, Math, IStrategy, IAdapter, IMasterChef } from "../../../../src/vault/adapter/sushi/MasterChefAdapter.sol";
import { MasterChefTestConfigStorage, MasterChefTestConfig, ITestConfigStorage } from "./MasterChefTestConfigStorage.sol";
import { MockStrategy } from "../../../utils/mocks/MockStrategy.sol";
import { AbstractAdapterTest } from "../abstract/AbstractAdapterTest.sol";

contract MasterChefVaultTest is AbstractAdapterTest {
  using Math for uint256;

  IMasterChef public masterChef;
  uint256 pid;

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

    setUpBaseTest(IERC20(_masterChef), adapter, 0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd, 10, "MasterChef", true);

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
