// SPDX-License-Identifier: AGPL-3.0-only
// Docgen-SOLC: 0.8.0
pragma solidity ^0.8.0;

import { Script } from "forge-std/Script.sol";
import { ERC20PresetMinterPauser } from "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import { ACLRegistry, IACLRegistry } from "../../contracts/core/utils/ACLRegistry.sol";
import { ContractRegistry, IContractRegistry } from "../../contracts/core/utils/ContractRegistry.sol";
import { KeeperIncentiveV2 } from "../../contracts/core/utils/KeeperIncentiveV2.sol";
import { ParticipationReward } from "../../contracts/core/utils/ParticipationReward.sol";
import { RewardsManager } from "../../contracts/core/utils/RewardsManager.sol";
import { IUniswapV2Router02 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import { GovStaking } from "../../contracts/core/dao/GovStaking.sol";
import { BeneficiaryGovernance } from "../../contracts/core/dao/BeneficiaryGovernance.sol";
import { BeneficiaryRegistry } from "../../contracts/core/dao/BeneficiaryRegistry.sol";
import { GrantElections } from "../../contracts/core/dao/GrantElections.sol";
import { BeneficiaryVaults } from "../../contracts/core/dao/BeneficiaryVaults.sol";
import { Region } from "../../contracts/core/utils/Region.sol";

/// @notice Deploys all contracts needed for beneficiary governance and sets the admin functions
/// Beneficiaries:
/// 0 - Nomination Proposal
/// No Takedowns so far
/// 2,3 - Monthly Election
/// 4,5 - Quarterly Election
/// 6,7 - Yearly Election
/// 8-18 - Unused
contract DeployBenGov is Script {
  ACLRegistry internal aclRegistry;
  ContractRegistry internal contractRegistry;
  ERC20PresetMinterPauser internal pop;
  KeeperIncentiveV2 internal keeperIncentive;
  ParticipationReward internal participationReward;
  GovStaking internal staking;
  RewardsManager internal rewardsManager;
  BeneficiaryGovernance internal beneficiaryGovernance;
  BeneficiaryRegistry internal beneficiaryRegistry;
  GrantElections internal grantElections;
  BeneficiaryVaults internal beneficiaryVault;
  Region internal region;

  function run() external returns (address) {
    vm.startBroadcast();
    // Deploying core contracts
    aclRegistry = new ACLRegistry();
    aclRegistry.grantRole(keccak256("DAO"), address(0x795D78169c41b0c10a1f9e70c3B2Cfe6960Fd2A2)); // replace with your signer
    aclRegistry.grantRole(keccak256("INCENTIVE_MANAGER_ROLE"), address(0x795D78169c41b0c10a1f9e70c3B2Cfe6960Fd2A2)); // replace with your signer

    contractRegistry = new ContractRegistry(IACLRegistry(address(aclRegistry)));

    pop = new ERC20PresetMinterPauser("Popcorn", "POP");
    contractRegistry.addContract(keccak256("POP"), address(pop), "1");

    keeperIncentive = new KeeperIncentiveV2(IContractRegistry(contractRegistry), 0, 0);
    contractRegistry.addContract(keccak256("KeeperIncentive"), address(keeperIncentive), "1");

    // Deploying Additional util contracts
    participationReward = new ParticipationReward(IContractRegistry(contractRegistry));
    contractRegistry.addContract(keccak256("ParticipationReward"), address(participationReward), "1");

    rewardsManager = new RewardsManager(
      IContractRegistry(contractRegistry),
      IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D)
    );
    contractRegistry.addContract(keccak256("RewardsManager"), address(rewardsManager), "1");
    aclRegistry.grantRole(keccak256("RewardsManager"), address(rewardsManager));
    keeperIncentive.createIncentive(address(rewardsManager), 0, true, true, address(pop), 1, 0);
    keeperIncentive.createIncentive(address(rewardsManager), 0, true, true, address(pop), 1, 0);

    GovStaking staking = new GovStaking(IContractRegistry(contractRegistry));
    contractRegistry.addContract(keccak256("GovStaking"), address(staking), "1");

    // Deploying Beneficiary Governance contracts
    beneficiaryGovernance = new BeneficiaryGovernance(IContractRegistry(contractRegistry));
    contractRegistry.addContract(keccak256("BeneficiaryGovernance"), address(beneficiaryGovernance), "1");
    aclRegistry.grantRole(keccak256("BeneficiaryGovernance"), address(beneficiaryGovernance));
    participationReward.addControllerContract("BeneficiaryGovernance", address(beneficiaryGovernance));

    beneficiaryRegistry = new BeneficiaryRegistry(IContractRegistry(contractRegistry));
    contractRegistry.addContract(keccak256("BeneficiaryRegistry"), address(beneficiaryRegistry), "1");

    grantElections = new GrantElections(IContractRegistry(contractRegistry));
    contractRegistry.addContract(keccak256("GrantElections"), address(grantElections), "1");
    aclRegistry.grantRole(keccak256("BeneficiaryGovernance"), address(grantElections));
    participationReward.addControllerContract(keccak256("GrantElections"), address(grantElections));

    beneficiaryVault = new BeneficiaryVaults(IContractRegistry(contractRegistry));

    region = new Region(address(beneficiaryVault), IContractRegistry(contractRegistry));
    contractRegistry.addContract(keccak256("Region"), address(region), "1");

    vm.stopBroadcast();
    return address(pop);
  }
}
