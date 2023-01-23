import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { getBytes32FromIpfsHash } from "@popcorn/utils/src/ipfsHashManipulation";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DeployFunction } from "@anthonymartin/hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import getCreatedProposalId from "../lib/adapters/GrantElection/getCreatedProposalId";
import { GrantElectionAdapter, ElectionTerm, ShareType } from "@popcorn/utils/src/grants";
import ADDRESS_CID_MAP from "../lib/utils/adresssCidMap";
import { DAYS, timeTravel } from "../lib/utils/test";
import { BeneficiaryGovernance, BeneficiaryRegistry, GrantElections } from "../typechain";
import { getSetup } from "./utils";

enum ProposalType {
  BeneficiaryNominationProposal,
  BeneficiaryTakedownProposal,
}
enum Vote {
  Yes,
  No,
}
const VOTE_PERIOD_IN_SECONDS = 30;
const DURATION_DAY = 24 * 60 * 60;
const DURATION_YEAR = DURATION_DAY * 365;

const main: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (!Boolean(parseInt(process.env.WITH_FIXTURES || "0"))) {
    console.log("Skipping BenGovFixtures to avoid time travel");
    return;
  }

  const { deploy, deployments, addresses, signer } = await getSetup(hre);
  console.log("Deploying Fixtures");
  const DEFAULT_REGION = ethers.utils.id("World");

  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const voters = accounts.slice(0, 4);
  const newBeneficiaries = accounts.slice(1, 10);
  const existingBeneficiaries = accounts.slice(10, 20);

  console.log("Getting up contracts");
  const aclRegistry = await hre.ethers.getContractAt("ACLRegistry", (await deployments.get("ACLRegistry")).address);
  const contractRegistry = await hre.ethers.getContractAt(
    "ContractRegistry",
    (
      await deployments.get("ContractRegistry")
    ).address,
  );
  const beneficiaryRegistry = await hre.ethers.getContractAt(
    "BeneficiaryRegistry",
    (
      await deployments.get("BeneficiaryRegistry")
    ).address,
  );
  const testPop = await hre.ethers.getContractAt("MockERC20", (await deployments.get("TestPOP")).address);
  const govStaking = await hre.ethers.getContractAt("GovStaking", (await deployments.get("GovStaking")).address);
  const beneficiaryGovernance = await hre.ethers.getContractAt(
    "BeneficiaryGovernance",
    (
      await deployments.get("BeneficiaryGovernance")
    ).address,
  );
  const grantElections = await hre.ethers.getContractAt(
    "GrantElections",
    (
      await deployments.get("GrantElections")
    ).address,
  );
  const rewardsManager = await hre.ethers.getContractAt(
    "RewardsManager",
    (
      await deployments.get("RewardsManager")
    ).address,
  );
  const participationRewards = await hre.ethers.getContractAt(
    "ParticipationReward",
    (
      await deployments.get("ParticipationReward")
    ).address,
  );
  const faucet = await hre.ethers.getContractAt("Faucet", (await deployments.get("Faucet")).address);

  await (async function setupBenefifiaries() {
    console.log("Setting up Beneficiaries");
    await aclRegistry.grantRole(ethers.utils.id("BeneficiaryGovernance"), deployer.address);
    // Give Eth to Beneficiaries
    await Promise.all(
      accounts.map(async (beneficiary) => {
        const balance = await ethers.provider.getBalance(beneficiary.address);
        if (balance.lt(parseEther(".01"))) {
          await accounts[0].sendTransaction({
            to: beneficiary.address,
            value: parseEther(".02"),
          });
        }
      }),
    );
    // Add beneficiaries to Registry
    await Promise.all(
      existingBeneficiaries.map((account) =>
        beneficiaryRegistry.addBeneficiary(account.address, DEFAULT_REGION, ADDRESS_CID_MAP[account.address], {
          gasLimit: 3000000,
        }),
      ),
    );
  })();
  await (async function mintPop() {
    console.log("Minting Pop");
    await Promise.all(accounts.map((account) => testPop.mint(account.address, parseEther("1000000"))));
  })();
  await (async function setApprovals() {
    console.log("Setting Approvals and Controller Contract");
    await participationRewards.addControllerContract(
      await beneficiaryGovernance.contractName(),
      beneficiaryGovernance.address,
    );
    await participationRewards.addControllerContract(await grantElections.contractName(), grantElections.address);
    await Promise.all(
      accounts.map((account) => testPop.connect(account).approve(grantElections.address, parseEther("1000000"))),
    );
    await Promise.all(
      accounts.map((account) => testPop.connect(account).approve(beneficiaryGovernance.address, parseEther("1000000"))),
    );
    await Promise.all(
      accounts.map((account) => testPop.connect(account).approve(govStaking.address, parseEther("1000000"))),
    );
  })();
  await (async function fundRewardsManager() {
    console.log("Funding the RewardsManager");
    faucet.sendThreeCrv(10000, rewardsManager.address);
    testPop.mint(rewardsManager.address, "5000");
  })();
  await (async function stakePop() {
    console.log("Staking Pop");
    await Promise.all(
      accounts.map((account) => govStaking.connect(account).stake(parseEther("1000"), DURATION_YEAR * 4)),
    );
  })();
  await (async function addFinalizedProposals() {
    console.log("Adding Finalized Proposals and Beneficiaries");

    const unfinalizedNominationProposalIds = await addProposals(
      newBeneficiaries.slice(0, 6),
      ProposalType.BeneficiaryNominationProposal,
      beneficiaryGovernance,
      DEFAULT_REGION,
    );
    await voteOnProposals(beneficiaryGovernance, voters, unfinalizedNominationProposalIds);

    console.log("TakedownProposals");
    const unfinalizedTakedownProposalIds = await addProposals(
      existingBeneficiaries.slice(0, 6),
      ProposalType.BeneficiaryTakedownProposal,
      beneficiaryGovernance,
      DEFAULT_REGION,
    );
    await voteOnProposals(beneficiaryGovernance, voters, unfinalizedTakedownProposalIds);

    console.log("Timetraveling to a time where Proposals are ready to finalize");
    await timeTravel(DAYS * 5);

    console.log("Finalizing Proposals");
    [...unfinalizedNominationProposalIds, ...unfinalizedTakedownProposalIds].forEach((proposalId) =>
      beneficiaryGovernance.connect(deployer).finalize(proposalId),
    );
  })();

  await (async function addProposalsInVetoPeriod() {
    console.log("Adding Proposals and Beneficiaries that will be in Veto Period");
    const nominationProposalIds = await addProposals(
      newBeneficiaries.slice(6, 8),
      ProposalType.BeneficiaryNominationProposal,
      beneficiaryGovernance,
      DEFAULT_REGION,
    );
    await voteOnProposals(beneficiaryGovernance, voters, nominationProposalIds);

    console.log("TakedownProposals");
    const takedownProposalIds = await addProposals(
      existingBeneficiaries.slice(6, 8),
      ProposalType.BeneficiaryTakedownProposal,
      beneficiaryGovernance,
      DEFAULT_REGION,
    );
    await voteOnProposals(beneficiaryGovernance, voters, takedownProposalIds);

    console.log("Timetraveling to a time where Proposals are in Veto Period");
    await timeTravel(DAYS * 3);
    await Promise.all(
      [...nominationProposalIds, ...takedownProposalIds].map((id) => {
        beneficiaryGovernance.connect(newBeneficiaries[3]).vote(id, Vote.No);
        beneficiaryGovernance.connect(newBeneficiaries[4]).vote(id, Vote.No);
      }),
    );
    await Promise.all(
      [...nominationProposalIds, ...takedownProposalIds].map((id) => beneficiaryGovernance.refreshState(id)),
    );
  })();

  await (async function addProposalsInOpenPeriod() {
    console.log("Adding Proposals and Beneficiaries that will be in Open Period");
    const nominationProposalIds = await addProposals(
      newBeneficiaries.slice(8),
      ProposalType.BeneficiaryNominationProposal,
      beneficiaryGovernance,
      DEFAULT_REGION,
    );
    const takedownProposalIds = await addProposals(
      existingBeneficiaries.slice(8),
      ProposalType.BeneficiaryTakedownProposal,
      beneficiaryGovernance,
      DEFAULT_REGION,
    );
    await voteOnProposals(beneficiaryGovernance, voters, nominationProposalIds);
    await voteOnProposals(beneficiaryGovernance, voters, takedownProposalIds);
  })();
  await (async function initializeMonthlyElection() {
    console.log("Initializing Election: Monthly");
    const electionTerm = ElectionTerm.Monthly;
    console.log("Setting Election Configuration");
    await grantElections.connect(deployer).setConfiguration(
      electionTerm,
      2,
      5,
      false, // VRF
      7 * DAYS, // Registration period - default
      7 * DAYS, // Voting period - default
      21 * DAYS, // cooldown period - default
      parseEther("100"),
      true,
      parseEther("2000"),
      true,
      ShareType.EqualWeight,
    );
    const activeBeneficiaryAddresses = (await beneficiaryRegistry.getBeneficiaryList()).filter(
      (addres) => addres !== "0x0000000000000000000000000000000000000000",
    );
    console.log("Initializing Election");
    await grantElections.initialize(electionTerm, DEFAULT_REGION);
    console.log("Registering Beneficiaries for the election");
    await registerBeneficiariesForElection(
      electionTerm,
      activeBeneficiaryAddresses.slice(0, 4),
      grantElections,
      DEFAULT_REGION,
    );
  })();
  await (async function initializeQuarterlyElection() {
    console.log("Initializing Election: Quarterly");
    const electionTerm = ElectionTerm.Quarterly;
    console.log("Setting Election Configuration");
    await grantElections.connect(deployer).setConfiguration(
      electionTerm,
      2,
      5,
      false, // VRF
      VOTE_PERIOD_IN_SECONDS, // Registration period - reduced
      VOTE_PERIOD_IN_SECONDS, // Voting period - reduced
      83 * DAYS, // cooldown period - default
      parseEther("100"),
      true,
      parseEther("2000"),
      true,
      ShareType.EqualWeight,
    );
    const activeBeneficiaryAddresses = await getActiveBeneficiaries(beneficiaryRegistry);
    console.log("Initializing Election");
    await grantElections.initialize(electionTerm, DEFAULT_REGION);
    console.log("Registering Beneficiaries for the election");
    await registerBeneficiariesForElection(
      electionTerm,
      activeBeneficiaryAddresses.slice(0, 4),
      grantElections,
      DEFAULT_REGION,
    );
  })();
  await (async function voteInQuarterlyElection() {
    console.log("Time travel to voting period of Quarterly election");
    await timeTravel(VOTE_PERIOD_IN_SECONDS + 5);
    const electionId = await grantElections.activeElections(DEFAULT_REGION, ElectionTerm.Quarterly);
    const activeBeneficiaryAddresses = await getActiveBeneficiaries(beneficiaryRegistry);
    console.log("Vote in quarterly election");
    await Promise.all(
      voters.map(async (voter) => {
        await grantElections
          .connect(voter)
          .vote(
            activeBeneficiaryAddresses.slice(0, 4),
            [parseEther("100"), parseEther("200"), parseEther("300"), parseEther("350")],
            electionId,
          );
      }),
    );
    console.log("Time travel to confirmation of all votes in quarterly election");
    await timeTravel(VOTE_PERIOD_IN_SECONDS + 5);
    await grantElections.refreshElectionState(ElectionTerm.Quarterly);
    console.log(
      `Quarterly Election metadata: `,
      await GrantElectionAdapter(grantElections).getElectionMetadata(ElectionTerm.Quarterly),
    );
    await refreshElectionState(ElectionTerm.Quarterly, DEFAULT_REGION, grantElections);
  })();
  await (async function initializeYearlyElection() {
    console.log("Initializing Election: Yearly");
    const electionTerm = ElectionTerm.Yearly;
    console.log("Setting Election Configuration");
    await grantElections.connect(deployer).setConfiguration(
      electionTerm,
      2,
      5,
      false, // VRF
      VOTE_PERIOD_IN_SECONDS, // Registration period - reduced
      30 * DAYS, // Voting period - default
      358 * DAYS, // cooldown period - default
      parseEther("100"),
      true,
      parseEther("2000"),
      true,
      ShareType.EqualWeight,
    );
    const activeBeneficiaryAddresses = await getActiveBeneficiaries(beneficiaryRegistry);
    console.log("Initializing Election");
    await grantElections.initialize(electionTerm, DEFAULT_REGION);
    console.log("Registering Beneficiaries for the election");
    await registerBeneficiariesForElection(
      electionTerm,
      activeBeneficiaryAddresses.slice(0, 4),
      grantElections,
      DEFAULT_REGION,
    );
  })();
  await (async function voteInYearlyElection() {
    console.log("Time travel to voting period of Yearly election");
    await timeTravel(VOTE_PERIOD_IN_SECONDS + 5);
    const electionId = await grantElections.activeElections(DEFAULT_REGION, ElectionTerm.Yearly);
    const activeBeneficiaryAddresses = await getActiveBeneficiaries(beneficiaryRegistry);
    console.log("Vote in yearly election");
    await Promise.all(
      voters.map((voter) => {
        grantElections
          .connect(voter)
          .vote(
            activeBeneficiaryAddresses.slice(0, 4),
            [parseEther("100"), parseEther("200"), parseEther("300"), parseEther("350")],
            electionId,
          );
      }),
    );
    console.log("Time travel to confirmation of all votes in yearly election");
    await timeTravel(VOTE_PERIOD_IN_SECONDS + 5);
    await grantElections.refreshElectionState(ElectionTerm.Quarterly);
    console.log(
      `Quarterly Election metadata: `,
      await GrantElectionAdapter(grantElections).getElectionMetadata(ElectionTerm.Quarterly),
    );
  })();
};

export default main;
main.dependencies = [
  "setup",
  "acl-registry",
  "contract-registry",
  "participation-reward",
  "gov-staking",
  "beneficiary-governance",
  "beneficiary-registry",
  "grant-elections",
  "faucet",
];
main.tags = ["core", "beneficiary-governance-demo-data"];

async function getActiveBeneficiaries(beneficiaryRegistry: BeneficiaryRegistry) {
  return (await beneficiaryRegistry.getBeneficiaryList()).filter(
    (addres) => addres !== "0x0000000000000000000000000000000000000000",
  );
}

async function addProposals(
  accountsToAdd: SignerWithAddress[],
  proposalType: ProposalType,
  beneficiaryGovernance: BeneficiaryGovernance,
  region,
): Promise<number[]> {
  return Promise.all(
    accountsToAdd.map(async (beneficiary) => {
      console.log("Adding beneficiary proposal", beneficiary.address, "with type", proposalType);
      const receipt = await beneficiaryGovernance
        .connect(beneficiary)
        .createProposal(beneficiary.address, region, ADDRESS_CID_MAP[beneficiary.address], proposalType, {
          gasLimit: 3000000,
        })
        .then((res) => res.wait(1));
      return getCreatedProposalId(receipt, ethers.provider);
    }),
  );
}

function voteOnProposals(
  beneficiaryGovernance: BeneficiaryGovernance,
  voters: SignerWithAddress[],
  nominationProposalIds: number[],
): PromiseLike<void[]> {
  console.log("Voting on proposals", nominationProposalIds);
  return Promise.all(
    nominationProposalIds.map(async (id, i) => {
      await beneficiaryGovernance.connect(voters[0]).vote(id, Vote.Yes);
      await beneficiaryGovernance.connect(voters[1]).vote(id, i > 3 ? Vote.No : Vote.Yes);
      await beneficiaryGovernance.connect(voters[2]).vote(id, Vote.No);
    }),
  );
}

async function registerBeneficiariesForElection(grantTerm, beneficiaries, grantElections: GrantElections, region) {
  console.log("Registering beneficiaries for election");
  const electionId = await grantElections.activeElections(region, grantTerm);
  return Promise.all(
    beneficiaries.map((account) =>
      grantElections.registerForElection(account, electionId, {
        gasLimit: 3000000,
      }),
    ),
  );
}
const refreshElectionState = async (
  electionTerm: ElectionTerm,
  region: string,
  grantElections: GrantElections,
): Promise<void> => {
  const electionId = await grantElections.activeElections(region, electionTerm);
  await grantElections.refreshElectionState(electionId);
};
