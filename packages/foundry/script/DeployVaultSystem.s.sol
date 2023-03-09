// SPDX-License-Identifier: GPL-3.0
// Docgen-SOLC: 0.8.15
pragma solidity ^0.8.15;

import { Script } from "forge-std/Script.sol";
import { CloneRegistry } from "../src/vault/CloneRegistry.sol";
import { CloneFactory } from "../src/vault/CloneFactory.sol";
import { PermissionRegistry } from "../src/vault/PermissionRegistry.sol";
import { TemplateRegistry, Template } from "../src/vault/TemplateRegistry.sol";
import { DeploymentController } from "../src/vault/DeploymentController.sol";
import { VaultController, IAdapter, VaultInitParams, VaultMetadata } from "../src/vault/VaultController.sol";
import { Vault } from "../src/vault/Vault.sol";
import { AdminProxy } from "../src/vault/AdminProxy.sol";
import { VaultRegistry } from "../src/vault/VaultRegistry.sol";

import { MultiRewardEscrow } from "../src/utils/MultiRewardEscrow.sol";
import { MultiRewardStaking } from "../src/utils/MultiRewardStaking.sol";

import { ICloneRegistry } from "../src/interfaces/vault/ICloneRegistry.sol";
import { ICloneFactory } from "../src/interfaces/vault/ICloneFactory.sol";
import { IPermissionRegistry, Permission } from "../src/interfaces/vault/IPermissionRegistry.sol";
import { ITemplateRegistry } from "../src/interfaces/vault/ITemplateRegistry.sol";
import { IDeploymentController } from "../src/interfaces/vault/IDeploymentController.sol";
import { IVaultRegistry } from "../src/interfaces/vault/IVaultRegistry.sol";
import { IAdminProxy } from "../src/interfaces/vault/IAdminProxy.sol";
import { IVaultController, DeploymentArgs } from "../src/interfaces/vault/IVaultController.sol";

import { IMultiRewardEscrow } from "../src/interfaces/IMultiRewardEscrow.sol";
import { IMultiRewardStaking } from "../src/interfaces/IMultiRewardStaking.sol";
import { IOwned } from "../src/interfaces/IOwned.sol";
import { IPausable } from "../src/interfaces/IPausable.sol";

import { VaultRouter } from "../src/vault/VaultRouter.sol";
import { YearnAdapter } from "../src/vault/adapter/yearn/YearnAdapter.sol";
import { BeefyAdapter } from "../src/vault/adapter/beefy/BeefyAdapter.sol";

import { VaultRouter } from "../src/vault/VaultRouter.sol";

import { MockStrategy } from "../test/utils/mocks/MockStrategy.sol";

contract DeployVaultSystem is Script {
  ITemplateRegistry templateRegistry;
  IPermissionRegistry permissionRegistry;
  ICloneRegistry cloneRegistry;
  IVaultRegistry vaultRegistry;

  ICloneFactory factory;
  IDeploymentController deploymentController;
  IAdminProxy adminProxy;

  IMultiRewardStaking staking;
  IMultiRewardEscrow escrow;

  VaultController controller;

  address stakingImpl;
  address yearnImpl;
  address beefyImpl;
  address strategyImpl;
  address vaultImpl;

  address deployer;
  address feeRecipient = address(0x4444);

  bytes32 templateCategory = "templateCategory";
  bytes32 templateId = "MockAdapter";
  string metadataCid = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR";
  bytes4[8] requiredSigs;
  address[8] swapTokenAddresses;

  event log(string str);
  event log_named_address(string str, address addr);

  function run() public {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    deployer = vm.addr(deployerPrivateKey);

    vm.startBroadcast(deployerPrivateKey);

    stakingImpl = address(new MultiRewardStaking());
    yearnImpl = address(new YearnAdapter());
    beefyImpl = address(new BeefyAdapter());
    strategyImpl = address(new MockStrategy());
    vaultImpl = address(new Vault());

    adminProxy = IAdminProxy(address(new AdminProxy(deployer)));

    permissionRegistry = IPermissionRegistry(address(new PermissionRegistry(address(adminProxy))));
    vaultRegistry = IVaultRegistry(address(new VaultRegistry(address(adminProxy))));
    escrow = IMultiRewardEscrow(address(new MultiRewardEscrow(address(adminProxy), feeRecipient)));

    deployDeploymentController();
    deploymentController.nominateNewOwner(address(adminProxy));
    adminProxy.execute(address(deploymentController), abi.encodeWithSelector(IOwned.acceptOwnership.selector, ""));

    controller = new VaultController(
      deployer,
      adminProxy,
      deploymentController,
      vaultRegistry,
      permissionRegistry,
      escrow
    );

    adminProxy.nominateNewOwner(address(controller));
    controller.acceptAdminProxyOwnership();

    bytes32[] memory templateCategories = new bytes32[](4);
    templateCategories[0] = "Vault";
    templateCategories[1] = "Adapter";
    templateCategories[2] = "Strategy";
    templateCategories[3] = "Staking";
    controller.addTemplateCategories(templateCategories);

    addTemplate("Staking", "MultiRewardStaking", stakingImpl, address(0), true, true);
    addTemplate("Adapter", "YearnAdapter", yearnImpl, address(0x50c1a2eA0a861A967D9d0FFE2AE4012c2E053804), false, true);
    addTemplate("Adapter", "BeefyAdapter", beefyImpl, address(permissionRegistry), true, true);

    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    emit log_named_address("VaultController: ", address(controller));
    emit log_named_address("VaultRegistry: ", address(vaultRegistry));
    emit log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    vm.stopBroadcast();
  }

  function deployDeploymentController() public {
    factory = ICloneFactory(address(new CloneFactory(deployer)));
    cloneRegistry = ICloneRegistry(address(new CloneRegistry(deployer)));
    templateRegistry = ITemplateRegistry(address(new TemplateRegistry(deployer)));

    deploymentController = IDeploymentController(
      address(new DeploymentController(deployer, factory, cloneRegistry, templateRegistry))
    );

    factory.nominateNewOwner(address(deploymentController));
    cloneRegistry.nominateNewOwner(address(deploymentController));
    templateRegistry.nominateNewOwner(address(deploymentController));
    deploymentController.acceptDependencyOwnership();
  }

  function addTemplate(
    bytes32 templateCategory,
    bytes32 templateId,
    address implementation,
    address registry,
    bool requiresInitData,
    bool endorse
  ) public {
    deploymentController.addTemplate(
      templateCategory,
      templateId,
      Template({
        implementation: implementation,
        endorsed: false,
        metadataCid: metadataCid,
        requiresInitData: requiresInitData,
        registry: registry,
        requiredSigs: requiredSigs
      })
    );
    bytes32[] memory templateCategories = new bytes32[](1);
    bytes32[] memory templateIds = new bytes32[](1);
    templateCategories[0] = templateCategory;
    templateIds[0] = templateId;
    if (endorse) controller.toggleTemplateEndorsements(templateCategories, templateIds);
  }
}
