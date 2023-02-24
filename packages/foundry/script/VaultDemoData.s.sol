// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { MockERC4626, IERC20Metadata } from "../test/utils/mocks/MockERC4626.sol";
import { IERC4626Upgradeable as IERC4626, IERC20Upgradeable as IERC20 } from "openzeppelin-contracts-upgradeable/interfaces/IERC4626Upgradeable.sol";
import { ERC20 } from "openzeppelin-contracts/token/ERC20/ERC20.sol";
import { Vault, VaultFees } from "../src/vault/Vault.sol";
import { VaultRegistry, VaultMetadata } from "../src/vault/VaultRegistry.sol";
import { IVaultRegistry } from "../src/interfaces/vault/IVaultRegistry.sol";
import { MultiRewardStaking, IMultiRewardEscrow } from "../src/utils/MultiRewardStaking.sol";
import { VaultRouter } from "../src/vault/VaultRouter.sol";

contract VaultDemoData is Script {
  IERC20 asset = IERC20(0x06325440D014e39736583c165C2963BA99fAf14E); //sETH/Eth LP
  IERC20 pop = IERC20(0xD0Cd466b34A24fcB2f87676278AF2005Ca8A78c4); //pop

  address feeRecipient = address(0x4444);
  MockERC4626 adapter;
  Vault vault;
  VaultRegistry registry;
  MultiRewardStaking staking;

  VaultRouter router;

  address deployer;

  string constant metadataCid = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";
  address[8] swapTokenAddresses;

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
      VaultFees({ deposit: 0, withdrawal: 0, management: 5e15, performance: 0 }),
      feeRecipient,
      deployer
    );

    staking = new MultiRewardStaking();
    staking.initialize(IERC20(vaultAddress), IMultiRewardEscrow(address(0)), deployer);

    pop.approve(address(staking), 10 ether);

    staking.addRewardToken(pop, 0.01 ether, 10 ether, false, 0, 0, 0);

    registry = new VaultRegistry(deployer);

    registry.registerVault(
      VaultMetadata({
        vault: vaultAddress,
        staking: address(staking),
        creator: deployer,
        metadataCID: metadataCid,
        swapTokenAddresses: swapTokenAddresses,
        swapAddress: address(0),
        exchange: 0
      })
    );

    router = new VaultRouter(IVaultRegistry(address(registry)));

    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    emit log_named_address("Vault Address: ", vaultAddress);
    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    emit log_named_address("VaultRegistry Address: ", address(registry));
    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    emit log_named_address("VaultRouter Address: ", address(router));
    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    asset.approve(address(vault), 10 ether);
    vault.deposit(10 ether);

    vm.stopBroadcast();
  }
}
