// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;
import { Test } from "forge-std/Test.sol";
import { Math } from "openzeppelin-contracts/utils/math/Math.sol";
import { MultiMockERC4626, IERC4626, IERC20 } from "./utils/mocks/MultiMockERC4626.sol";
import { MockERC20 } from "./utils/mocks/MockERC20.sol";
import { MockERC4626 } from "./utils/mocks/MockERC4626.sol";
import { Clones } from "openzeppelin-contracts/proxy/Clones.sol";

contract Tester is Test {
  using Math for uint256;

  MultiMockERC4626 multiMockERC4626;
  MockERC20 asset;
  MockERC4626 adapter1;
  MockERC4626 adapter2;
  MockERC4626 adapter3;

  IERC4626[10] adapters;
  uint256[10] allocations;

  address adapterImplementation;
  address implementation;

  function _createAdapter(IERC20 _asset) internal returns (MockERC4626) {
    address adapterAddress = Clones.clone(adapterImplementation);
    MockERC4626(adapterAddress).initialize(_asset, "Mock Token Vault", "vwTKN");
    return MockERC4626(adapterAddress);
  }

  function setUp() public {
    asset = new MockERC20("asset", "asset", 18);

    adapterImplementation = address(new MockERC4626());
    implementation = address(new MultiMockERC4626());

    adapter1 = _createAdapter(IERC20(address(asset)));
    adapter2 = _createAdapter(IERC20(address(asset)));
    adapter3 = _createAdapter(IERC20(address(asset)));

    adapters[0] = IERC4626(address(adapter1));
    adapters[1] = IERC4626(address(adapter2));
    adapters[2] = IERC4626(address(adapter3));

    allocations[0] = 0.25e18;
    allocations[1] = 0.25e18;
    allocations[2] = 0.5e18;

    multiMockERC4626 = MultiMockERC4626(Clones.clone(implementation));
    multiMockERC4626.initialize(
      IERC20(address(asset)),
      adapters,
      allocations,
      2,
      "MultiMockERC4626",
      "MultiMockERC4626"
    );
  }

  function test_deposit_withdraw() public {
    uint256 amount = 4759;
    asset.mint(address(this), amount);
    asset.approve(address(multiMockERC4626), amount);

    uint256 prevD = multiMockERC4626.previewDeposit(amount);
    uint256 shares = multiMockERC4626.deposit(amount, address(this));
    uint256 totalSupply = multiMockERC4626.totalSupply();
    uint256 totalAssets = multiMockERC4626.totalAssets();

    emit log_named_uint("prevD", prevD);
    emit log_named_uint("shares", shares);
    emit log_named_uint("totalSupply", totalSupply);
    emit log_named_uint("totalAssets", totalAssets);

    uint256 prevW = multiMockERC4626.previewWithdraw(amount);
    uint256 burned = multiMockERC4626.withdraw(totalAssets, address(this), address(this));
    totalSupply = multiMockERC4626.totalSupply();
    totalAssets = multiMockERC4626.totalAssets();

    emit log_named_uint("prevW", prevW);
    emit log_named_uint("burned", burned);
    emit log_named_uint("totalSupply", totalSupply);
    emit log_named_uint("totalAssets", totalAssets);
  }

  function test_deposit_redeem() public {
    uint256 amount = 4759;
    asset.mint(address(this), amount);
    asset.approve(address(multiMockERC4626), amount);

    uint256 prevD = multiMockERC4626.previewDeposit(amount);
    uint256 shares = multiMockERC4626.deposit(amount, address(this));
    uint256 totalSupply = multiMockERC4626.totalSupply();
    uint256 totalAssets = multiMockERC4626.totalAssets();

    emit log_named_uint("prevD", prevD);
    emit log_named_uint("shares", shares);
    emit log_named_uint("totalSupply", totalSupply);
    emit log_named_uint("totalAssets", totalAssets);

    uint256 prevR = multiMockERC4626.previewRedeem(totalSupply);
    uint256 burned = multiMockERC4626.redeem(totalSupply, address(this), address(this));
    totalSupply = multiMockERC4626.totalSupply();
    totalAssets = multiMockERC4626.totalAssets();

    emit log_named_uint("prevR", prevR);
    emit log_named_uint("burned", burned);
    emit log_named_uint("totalSupply", totalSupply);
    emit log_named_uint("totalAssets", totalAssets);
  }

  function test_mint_withdraw() public {
    uint256 amount = 4759000000000;
    asset.mint(address(this), amount);
    asset.approve(address(multiMockERC4626), amount);

    uint256 prevM = multiMockERC4626.previewMint(amount);
    uint256 assets = multiMockERC4626.mint(amount, address(this));
    uint256 totalSupply = multiMockERC4626.totalSupply();
    uint256 totalAssets = multiMockERC4626.totalAssets();

    emit log_named_uint("prevM", prevM);
    emit log_named_uint("assets", assets);
    emit log_named_uint("totalSupply", totalSupply);
    emit log_named_uint("totalAssets", totalAssets);

    uint256 prevW = multiMockERC4626.previewWithdraw(totalAssets);
    uint256 returned = multiMockERC4626.withdraw(totalAssets, address(this), address(this));
    totalSupply = multiMockERC4626.totalSupply();
    totalAssets = multiMockERC4626.totalAssets();

    emit log_named_uint("prevW", prevW);
    emit log_named_uint("returned", returned);
    emit log_named_uint("totalSupply", totalSupply);
    emit log_named_uint("totalAssets", totalAssets);
  }
}
