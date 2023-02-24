// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { Test } from "forge-std/Test.sol";
import { MockERC20 } from "../utils/mocks/MockERC20.sol";
import { MockERC4626 } from "../utils/mocks/MockERC4626.sol";
import { Vault } from "../../src/vault/Vault.sol";
import { IERC4626Upgradeable as IERC4626, IERC20Upgradeable as IERC20 } from "openzeppelin-contracts-upgradeable/interfaces/IERC4626Upgradeable.sol";
import { VaultFees } from "../../src/interfaces/vault/IVault.sol";
import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";
import { Clones } from "openzeppelin-contracts/proxy/Clones.sol";

contract Tester is Test {
  MockERC20 asset;
  MockERC4626 adapter;

  address adapterImplementation;

  function setUp() public {
    asset = new MockERC20("Mock Token", "TKN", 18);

    adapterImplementation = address(new MockERC4626());
    address adapterAddress = Clones.clone(adapterImplementation);
    MockERC4626(adapterAddress).initialize(IERC20(address(asset)), "Mock Token Vault", "vwTKN");
    adapter = MockERC4626(adapterAddress);
  }

  function test_mint() public {
    asset.mint(address(this), 1);

    asset.approve(address(adapter), 1);
    adapter.mint(1e9, address(this));
    emit log_uint(adapter.balanceOf(address(this)));
    emit log_uint(adapter.totalSupply());
    emit log_uint(adapter.totalAssets());
  }

  function test_deposit() public {
    asset.mint(address(this), 1);

    asset.approve(address(adapter), 1);
    adapter.deposit(1, address(this));
    emit log_uint(adapter.balanceOf(address(this)));
    emit log_uint(adapter.totalSupply());
    emit log_uint(adapter.totalAssets());
  }
}
