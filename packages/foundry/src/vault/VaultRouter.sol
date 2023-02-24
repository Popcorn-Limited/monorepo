// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15

pragma solidity ^0.8.15;

import { IERC4626Upgradeable as IERC4626 } from "openzeppelin-contracts-upgradeable/interfaces/IERC4626Upgradeable.sol";
import { IVaultRegistry, VaultMetadata } from "../interfaces/vault/IVaultRegistry.sol";

/**
 * @title   VaultRouter
 * @author  RedVeil
 * @notice
 *
 */
contract VaultRouter {
  IVaultRegistry public vaultRegistry;

  constructor(IVaultRegistry _vaultRegistry) {
    vaultRegistry = _vaultRegistry;
  }

  error NoStaking();

  function depositAndStake(
    IERC4626 vault,
    uint256 assetAmount,
    address receiver
  ) external {
    VaultMetadata memory metadata = vaultRegistry.getVault(address(vault));
    if (metadata.staking == address(0)) revert NoStaking();

    uint256 shares = vault.deposit(assetAmount, address(this));
    vault.approve(metadata.staking, shares);
    IERC4626(metadata.staking).deposit(shares, receiver);
  }

  function redeemAndWithdraw(
    IERC4626 vault,
    uint256 burnAmount,
    address receiver,
    address owner
  ) external {
    VaultMetadata memory metadata = vaultRegistry.getVault(address(vault));
    if (metadata.staking == address(0)) revert NoStaking();

    IERC4626(metadata.staking).redeem(burnAmount, address(this), owner);

    vault.redeem(burnAmount, receiver, address(this));
  }
}
