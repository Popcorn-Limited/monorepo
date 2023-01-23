// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";

import { YearnAdapter, SafeERC20, IERC20, IERC20Metadata, Math, VaultAPI, IYearnRegistry } from "../../../../src/vault/adapter/yearn/YearnAdapter.sol";
import { YearnTestConfigStorage, YearnTestConfig } from "./YearnTestConfigStorage.sol";
import { AbstractAdapterTest, ITestConfigStorage, IAdapter } from "../abstract/AbstractAdapterTest.sol";

contract YearnAdapterTest is AbstractAdapterTest {
  using Math for uint256;

  VaultAPI yearnVault;

  function setUp() public {
    uint256 forkId = vm.createSelectFork(vm.rpcUrl("mainnet"));
    vm.selectFork(forkId);

    testConfigStorage = ITestConfigStorage(address(new YearnTestConfigStorage()));

    _setUpTest(testConfigStorage.getTestConfig(0));
  }

  function overrideSetup(bytes memory testConfig) public override {
    _setUpTest(testConfig);
  }

  function _setUpTest(bytes memory testConfig) internal {
    createAdapter();

    address _asset = abi.decode(testConfig, (address));

    setUpBaseTest(IERC20(_asset), adapter, 0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804, 10, "Yearn ", false);

    yearnVault = VaultAPI(IYearnRegistry(externalRegistry).latestVault(_asset));

    vm.label(address(yearnVault), "yearnVault");
    vm.label(address(asset), "asset");
    vm.label(address(this), "test");

    adapter.initialize(abi.encode(asset, address(this), address(0), 0, sigs, ""), externalRegistry, "");
  }

  /*//////////////////////////////////////////////////////////////
                          HELPER
    //////////////////////////////////////////////////////////////*/

  function createAdapter() public override {
    adapter = IAdapter(address(new YearnAdapter()));
  }

  function increasePricePerShare(uint256 amount) public override {
    deal(address(asset), address(yearnVault), asset.balanceOf(address(yearnVault)) + amount);
  }

  function iouBalance() public view override returns (uint256) {
    return yearnVault.balanceOf(address(adapter));
  }

  // Verify that totalAssets returns the expected amount
  function verify_totalAssets() public override {
    // Make sure totalAssets isnt 0
    deal(address(asset), bob, defaultAmount);
    vm.startPrank(bob);
    asset.approve(address(adapter), defaultAmount);
    adapter.deposit(defaultAmount, bob);
    vm.stopPrank();

    assertApproxEqAbs(
      adapter.totalAssets(),
      adapter.convertToAssets(adapter.totalSupply()),
      _delta_,
      string.concat("totalSupply converted != totalAssets", baseTestId)
    );
    assertApproxEqAbs(
      adapter.totalAssets(),
      iouBalance().mulDiv(
        yearnVault.pricePerShare(),
        10 ** IERC20Metadata(address(adapter)).decimals(),
        Math.Rounding.Up
      ),
      _delta_,
      string.concat("totalAssets != yearn assets", baseTestId)
    );
  }

  /*//////////////////////////////////////////////////////////////
                          INITIALIZATION
    //////////////////////////////////////////////////////////////*/

  function verify_adapterInit() public override {
    assertEq(adapter.asset(), yearnVault.token(), "asset");
    assertEq(
      IERC20Metadata(address(adapter)).name(),
      string.concat("Popcorn Yearn", IERC20Metadata(address(asset)).name(), " Adapter"),
      "name"
    );
    assertEq(
      IERC20Metadata(address(adapter)).symbol(),
      string.concat("popY-", IERC20Metadata(address(asset)).symbol()),
      "symbol"
    );

    assertEq(asset.allowance(address(adapter), address(yearnVault)), type(uint256).max, "allowance");
  }

  function test__malicious_initial_deposit() public {
    /// If a malicicous user deposits a tiny amount of after adapter creation...
    /// ...and than sends a large amount of shares of the underlying protocol to the vault...
    /// ...the next user will loose some of their funds.
    /// This only works when the assets use by the attack are 1e6 times of the initial deposit.
    /// The attacker will earn 10% of their attack amount. (10% of 10e6 = 1e6)
    /// A possible fix is to deposit a certain amount of assets on construction to make this attack too expensive.
    /// Its important to note that this attack is also possible later on if the token amounts are still small enough.
    /// Over time with more and more deposits the attack gets increasingly more expensive until it becomes impossible.
    uint256 aliceDeposit = 10;
    uint256 aliceAttack = aliceDeposit * 1e6;
    uint256 bobDeposit = 1e6;

    _mintFor(aliceAttack + aliceDeposit, alice);
    _mintFor(bobDeposit * 21, bob);

    VaultAPI yVault = YearnAdapter(address(adapter)).yVault();
    // alice deposits 10 wei of vault asset.
    vm.prank(alice);
    adapter.deposit(aliceDeposit, alice);

    // alice now has 10 vault share.
    assertApproxEqAbs(adapter.balanceOf(address(alice)), _delta_, aliceDeposit);

    // alice deposits 10mil tokens of vault asset
    // directy to the wrapped Yearn vault.
    vm.prank(alice);
    asset.approve(address(yVault), aliceAttack * 10);
    vm.prank(alice);
    yVault.deposit(aliceAttack);
    uint256 yVaultBal = yVault.balanceOf(alice);
    assertGe(yVaultBal, 0);

    // alice "donates" these Yearn shares directly
    // to the vault wrapper.
    vm.prank(alice);
    yVault.transfer(address(adapter), yVaultBal);

    // Underlying vault balance is equal to
    // 10mil vault asset tokens.
    assertApproxEqAbs(adapter.totalAssets(), aliceAttack, _delta_);

    // bob deposits to vault
    vm.prank(bob);
    adapter.deposit(bobDeposit, bob);

    // bob gets no shares
    assertEq(adapter.balanceOf(address(bob)), 0);

    // bob deposits more to the vault...
    vm.prank(bob);
    adapter.deposit(bobDeposit * 10, bob);

    // But his first deposit is still lost
    assertEq(adapter.balanceOf(address(bob)), 9);
    assertApproxEqRel(adapter.convertToAssets(9), bobDeposit * 10, 6e15);

    // ...and even more
    vm.prank(bob);
    adapter.deposit(bobDeposit * 10, bob);

    // But his first deposit is still lost
    assertEq(adapter.balanceOf(address(bob)), 18);
    assertApproxEqRel(adapter.convertToAssets(18), bobDeposit * 20, 4e15);

    // Alices asset balance is higher than what she invested
    assertGt(adapter.convertToAssets(adapter.balanceOf(address(alice))), aliceDeposit + aliceAttack);
    emit log_uint(adapter.convertToAssets(adapter.balanceOf(address(alice))));
  }

  /*//////////////////////////////////////////////////////////////
                          ROUNDTRIP TESTS
    //////////////////////////////////////////////////////////////*/

  // NOTE - The yearn adapter suffers often from an off-by-one error which "steals" 1 wei from the user
  function test__RT_deposit_withdraw() public override {
    _mintFor(defaultAmount, bob);

    vm.startPrank(bob);
    uint256 shares1 = adapter.deposit(defaultAmount, bob);
    uint256 shares2 = adapter.withdraw(defaultAmount - 1, bob, bob);
    vm.stopPrank();

    assertApproxGeAbs(shares2, shares1, _delta_, testId);
  }

  // NOTE - The yearn adapter suffers often from an off-by-one error which "steals" 1 wei from the user
  function test__RT_mint_withdraw() public override {
    _mintFor(adapter.previewMint(defaultAmount), bob);

    vm.startPrank(bob);
    uint256 assets = adapter.mint(defaultAmount, bob);
    uint256 shares = adapter.withdraw(assets - 1, bob, bob);
    vm.stopPrank();

    assertApproxGeAbs(shares, defaultAmount, _delta_, testId);
  }
}
