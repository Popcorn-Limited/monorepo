// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { MockERC4626, IERC20Metadata } from "../test/utils/mocks/MockERC4626.sol";
import { IERC4626, IERC20 } from "../src/interfaces/vault/IERC4626.sol";
import { ERC20 } from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import { Vault } from "../src/vault/Vault.sol";
import { VaultFees } from "../src/interfaces/vault/IVault.sol";

contract DeployVault is Script {
  IERC20 asset = IERC20(0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb); //sETH
  address feeRecipient = address(0x4444);
  MockERC4626 adapter;
  Vault vault;
  address deployer;

  event log(string str);
  event log_named_address(string str, address addr);

  function run() public {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    deployer = vm.addr(deployerPrivateKey);

    vm.startBroadcast(deployerPrivateKey);

    adapter = new MockERC4626(asset, "Mock Token Vault", "vwTKN");

    address vaultAddress = address(new Vault());
    vault = Vault(vaultAddress);
    vault.initialize(
      asset,
      IERC4626(address(adapter)),
      VaultFees({ deposit: 0, withdrawal: 0, management: 0, performance: 0 }),
      feeRecipient,
      deployer
    );

    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    emit log_named_address("Vault Address: ", vaultAddress);
    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    vm.stopBroadcast();
  }
}
