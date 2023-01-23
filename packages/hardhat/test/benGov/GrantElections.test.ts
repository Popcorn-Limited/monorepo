import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";
import { ethers, waffle } from "hardhat";
import { ElectionMetadata, GrantElectionAdapter, ShareType } from "@popcorn/utils/src/grants";
import { calculateVaultShare, rankAwardees } from "../../lib/utils/test/finalizeElection";
import { BeneficiaryVaults, GrantElections, MockERC20, ParticipationReward, RandomNumberHelper } from "../../typechain";

interface Contracts {
  mockPop: MockERC20;
  mockStaking: any;
  mockBeneficiaryRegistry: any;
  beneficiaryVaults: BeneficiaryVaults;
  randomNumberHelper: RandomNumberHelper;
  participationReward: ParticipationReward;
  grantElections: GrantElections;
}

let owner: SignerWithAddress,
  nonOwner: SignerWithAddress,
  beneficiary: SignerWithAddress,
  beneficiary2: SignerWithAddress,
  beneficiary3: SignerWithAddress,
  beneficiary4: SignerWithAddress,
  beneficiary5: SignerWithAddress,
  proposer: SignerWithAddress,
  approver: SignerWithAddress,
  governance: SignerWithAddress;

let contracts: Contracts;

const GRANT_TERM = { MONTH: 0, QUARTER: 1, YEAR: 2 };
const ONE_DAY = 86400;
const DEFAULT_REGION = ethers.utils.id("World");
const ElectionState = { Registration: 0, Voting: 1, Closed: 2 };
const registrationBondMonth = parseEther("50");
const registrationBondQuarter = parseEther("100");
const electionId = 0;

async function deployContracts(): Promise<Contracts> {
  const mockPop = await (await (await ethers.getContractFactory("MockERC20")).deploy("TestPOP", "TPOP", 18)).deployed();
  await mockPop.mint(owner.address, parseEther("6500"));
  await mockPop.mint(beneficiary.address, parseEther("500"));
  await mockPop.mint(beneficiary2.address, parseEther("500"));
  await mockPop.mint(beneficiary3.address, parseEther("500"));
  await mockPop.mint(beneficiary4.address, parseEther("500"));
  await mockPop.mint(beneficiary5.address, parseEther("500"));

  const stakingFactory = await ethers.getContractFactory("GovStaking");
  const mockStaking = await waffle.deployMockContract(owner, stakingFactory.interface.format() as any[]);

  const beneficiaryRegistryFactory = await ethers.getContractFactory("BeneficiaryRegistry");
  const mockBeneficiaryRegistry = await waffle.deployMockContract(
    owner,
    beneficiaryRegistryFactory.interface.format() as any[]
  );

  const randomNumberHelper = await (
    await (
      await ethers.getContractFactory("RandomNumberHelper")
    ).deploy(owner.address, mockPop.address, ethers.utils.formatBytes32String("secret"))
  ).deployed();

  const aclRegistry = await (await (await ethers.getContractFactory("ACLRegistry")).deploy()).deployed();

  const contractRegistry = await (
    await (await ethers.getContractFactory("ContractRegistry")).deploy(aclRegistry.address)
  ).deployed();

  const beneficiaryVaults = await (
    await (await ethers.getContractFactory("BeneficiaryVaults")).deploy(contractRegistry.address)
  ).deployed();

  const region = await (
    await (await ethers.getContractFactory("Region")).deploy(beneficiaryVaults.address, contractRegistry.address)
  ).deployed();

  const participationReward = await (
    await ethers.getContractFactory("ParticipationReward")
  ).deploy(contractRegistry.address);
  await participationReward.deployed();

  const grantElections = (await (
    await (await ethers.getContractFactory("GrantElections")).deploy(contractRegistry.address)
  ).deployed()) as GrantElections;

  await aclRegistry.connect(owner).grantRole(ethers.utils.id("DAO"), owner.address);
  await aclRegistry.connect(owner).grantRole(ethers.utils.id("DAO"), governance.address);
  await aclRegistry.connect(owner).grantRole(ethers.utils.id("ElectionResultProposer"), proposer.address);
  await aclRegistry.connect(owner).grantRole(ethers.utils.id("ElectionResultApprover"), approver.address);
  await aclRegistry.connect(owner).grantRole(ethers.utils.id("BeneficiaryGovernance"), grantElections.address);

  await contractRegistry.connect(owner).addContract(ethers.utils.id("POP"), mockPop.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("BeneficiaryVaults"), beneficiaryVaults.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("GovStaking"), mockStaking.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("BeneficiaryRegistry"), mockBeneficiaryRegistry.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("RandomNumberConsumer"), randomNumberHelper.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("ParticipationReward"), participationReward.address, ethers.utils.id("1"));
  await contractRegistry.connect(owner).addContract(ethers.utils.id("Region"), region.address, ethers.utils.id("1"));

  await mockPop.connect(owner).transfer(randomNumberHelper.address, parseEther("500"));
  await mockPop.connect(owner).approve(participationReward.address, parseEther("100000"));
  await mockPop.connect(owner).approve(grantElections.address, parseEther("100000"));

  await participationReward.connect(owner).contributeReward(parseEther("2000"));

  await participationReward
    .connect(governance)
    .addControllerContract(utils.formatBytes32String("GrantElections"), grantElections.address);

  return {
    mockPop,
    mockStaking,
    mockBeneficiaryRegistry,
    beneficiaryVaults,
    randomNumberHelper,
    participationReward,
    grantElections,
  };
}

async function prepareElection(grantTerm: number, electionId: number): Promise<void> {
  await contracts.grantElections.initialize(grantTerm, DEFAULT_REGION);
  await contracts.mockStaking.mock.getVoiceCredits.returns(100);
  await contracts.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
  await contracts.grantElections.connect(beneficiary).registerForElection(beneficiary.address, electionId);
  await contracts.grantElections.connect(beneficiary).registerForElection(beneficiary2.address, electionId);
  await contracts.grantElections.connect(beneficiary).registerForElection(beneficiary3.address, electionId);
  await contracts.grantElections.connect(beneficiary).registerForElection(beneficiary4.address, electionId);
  await contracts.grantElections.connect(beneficiary).registerForElection(beneficiary5.address, electionId);
  ethers.provider.send("evm_increaseTime", [1000]);
  ethers.provider.send("evm_mine", []);
  await contracts.grantElections.vote(
    [beneficiary.address, beneficiary2.address, beneficiary3.address, beneficiary4.address, beneficiary5.address],
    [40, 15, 20, 15, 10],
    electionId
  );
}

describe.skip("GrantElections", function () {
  beforeEach(async function () {
    [
      owner,
      nonOwner,
      beneficiary,
      beneficiary2,
      beneficiary3,
      beneficiary4,
      beneficiary5,
      proposer,
      approver,
      governance,
    ] = await ethers.getSigners();
    contracts = await deployContracts();
  });

  describe("defaults", function () {
    it("should set correct monthly defaults", async function () {
      const monthly = await GrantElectionAdapter(contracts.grantElections).electionDefaults(GRANT_TERM.MONTH);
      expect(monthly.registrationBondRequired).to.equal(true);
      expect(monthly.registrationBond).to.equal(parseEther("50"));
      expect(monthly.useChainLinkVRF).to.equal(true);
      expect(monthly.ranking).to.equal(3);
      expect(monthly.awardees).to.equal(1);
      expect(monthly.registrationPeriod).to.equal(7 * ONE_DAY);
      expect(monthly.votingPeriod).to.equal(7 * ONE_DAY);
      expect(monthly.cooldownPeriod).to.equal(21 * ONE_DAY);
      expect(monthly.finalizationIncentive).to.equal(parseEther("2000"));
      expect(monthly.enabled).to.equal(true);
      expect(monthly.shareType).to.equal(ShareType.EqualWeight);
    });

    it("should set correct quarterly defaults", async function () {
      const quarterly = await GrantElectionAdapter(contracts.grantElections).electionDefaults(GRANT_TERM.QUARTER);
      expect(quarterly.registrationBondRequired).to.equal(true);
      expect(quarterly.registrationBond).to.equal(parseEther("100"));
      expect(quarterly.useChainLinkVRF).to.equal(true);
      expect(quarterly.ranking).to.equal(5);
      expect(quarterly.awardees).to.equal(2);
      expect(quarterly.registrationPeriod).to.equal(14 * ONE_DAY);
      expect(quarterly.votingPeriod).to.equal(14 * ONE_DAY);
      expect(quarterly.cooldownPeriod).to.equal(83 * ONE_DAY);
      expect(quarterly.finalizationIncentive).to.equal(parseEther("2000"));
      expect(quarterly.enabled).to.equal(true);
      expect(quarterly.shareType).to.equal(ShareType.EqualWeight);
    });
    it("should set correct yearly defaults", async function () {
      const yearly = await GrantElectionAdapter(contracts.grantElections).electionDefaults(GRANT_TERM.YEAR);
      expect(yearly.registrationBondRequired).to.equal(true);
      expect(yearly.registrationBond).to.equal(parseEther("1000"));
      expect(yearly.useChainLinkVRF).to.equal(true);
      expect(yearly.ranking).to.equal(7);
      expect(yearly.awardees).to.equal(3);
      expect(yearly.registrationPeriod).to.equal(30 * ONE_DAY);
      expect(yearly.votingPeriod).to.equal(30 * ONE_DAY);
      expect(yearly.cooldownPeriod).to.equal(358 * ONE_DAY);
      expect(yearly.finalizationIncentive).to.equal(parseEther("2000"));
      expect(yearly.enabled).to.equal(true);
      expect(yearly.shareType).to.equal(ShareType.EqualWeight);
    });

    it("should set configuration for grant elections", async function () {
      await contracts.grantElections
        .connect(governance)
        .setConfiguration(GRANT_TERM.QUARTER, 15, 10, false, 100, 100, 100, 0, false, parseEther("100"), true, 0);
      const quarterly = await GrantElectionAdapter(contracts.grantElections).electionDefaults(GRANT_TERM.QUARTER);
      expect(quarterly.registrationBondRequired).to.equal(false);
      expect(quarterly.registrationBond).to.equal(0);
      expect(quarterly.useChainLinkVRF).to.equal(false);
      expect(quarterly.ranking).to.equal(15);
      expect(quarterly.awardees).to.equal(10);
      expect(quarterly.registrationPeriod).to.equal(100);
      expect(quarterly.votingPeriod).to.equal(100);
      expect(quarterly.cooldownPeriod).to.equal(100);
      expect(quarterly.finalizationIncentive).to.equal(parseEther("100"));
      expect(quarterly.enabled).to.equal(true);
      expect(quarterly.shareType).to.equal(ShareType.EqualWeight);
    });
  });

  describe("setters", function () {
    it("should allow to fund incentives", async function () {
      await contracts.grantElections.connect(owner).fundKeeperIncentive(parseEther("4000"));
      const incentiveBudget = await contracts.grantElections.incentiveBudget();
      const balance = await contracts.mockPop.balanceOf(owner.address);
      expect(incentiveBudget).to.equal(parseEther("4000"));
      expect(balance).to.equal(parseEther("0"));
    });
  });

  describe("registration", function () {
    it("should allow beneficiary to register for election with no bond when bond disabled", async function () {
      await contracts.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await contracts.grantElections.connect(governance).toggleRegistrationBondRequirement(GRANT_TERM.YEAR);
      await contracts.grantElections.initialize(GRANT_TERM.YEAR, DEFAULT_REGION);
      await contracts.grantElections.registerForElection(beneficiary.address, electionId);
      const metadata = await GrantElectionAdapter(contracts.grantElections).getElectionMetadata(electionId);
      expect(metadata).to.deep.contains({
        registeredBeneficiaries: [beneficiary.address],
      });
    });

    it("should prevent beneficiary to register for election without a bond", async function () {
      await contracts.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await contracts.grantElections.initialize(GRANT_TERM.YEAR, DEFAULT_REGION);
      await expect(
        contracts.grantElections.connect(beneficiary).registerForElection(beneficiary.address, electionId)
      ).to.be.revertedWith("insufficient registration bond balance");
    });

    it("should allow beneficiary to register for election with a bond", async function () {
      await contracts.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await contracts.grantElections.initialize(GRANT_TERM.YEAR, DEFAULT_REGION);
      await contracts.mockPop.mint(beneficiary2.address, parseEther("1000"));
      await contracts.mockPop.connect(beneficiary2).approve(contracts.grantElections.address, parseEther("1000"));

      await contracts.grantElections.connect(beneficiary2).registerForElection(beneficiary2.address, electionId);

      const metadata = await GrantElectionAdapter(contracts.grantElections).getElectionMetadata(electionId);

      expect(metadata).to.deep.contains({
        registeredBeneficiaries: [beneficiary2.address],
      });

      const bennies = await contracts.grantElections.getRegisteredBeneficiaries(electionId);
      expect(bennies).to.deep.equal([beneficiary2.address]);
    });

    it("should transfer POP to election contract on registration", async function () {
      await contracts.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await contracts.grantElections.initialize(GRANT_TERM.YEAR, DEFAULT_REGION);
      await contracts.mockPop.mint(beneficiary2.address, parseEther("1000"));
      await contracts.mockPop.connect(beneficiary2).approve(contracts.grantElections.address, parseEther("1000"));

      await contracts.grantElections.connect(beneficiary2).registerForElection(beneficiary2.address, electionId);

      const popBalanceForElection = await contracts.mockPop.balanceOf(contracts.grantElections.address);
      expect(popBalanceForElection).to.equal(parseEther("1000"));
    });
  });

  describe("initialization", function () {
    it("should successfully initialize an election if one hasn't already been created", async function () {
      const currentBlock = await waffle.provider.getBlock("latest");
      const result = await contracts.grantElections.initialize(GRANT_TERM.QUARTER, DEFAULT_REGION);
      expect(result)
        .to.emit(contracts.grantElections, "ElectionInitialized")
        .withArgs(GRANT_TERM.QUARTER, DEFAULT_REGION, currentBlock.timestamp + 1);
      expect(result)
        .to.emit(contracts.participationReward, "VaultInitialized")
        .withArgs(
          ethers.utils.solidityKeccak256(["uint8", "uint256"], [GRANT_TERM.QUARTER, currentBlock.timestamp + 1])
        );
    });

    it("should set correct election metadata", async function () {
      const currentBlock = await waffle.provider.getBlock("latest");
      await contracts.grantElections.initialize(GRANT_TERM.QUARTER, DEFAULT_REGION);
      const metadata = await GrantElectionAdapter(contracts.grantElections).getElectionMetadata(electionId);
      expect(metadata.votes.length).to.equal(0);
      expect(metadata.electionTerm).to.equal(GRANT_TERM.QUARTER);
      expect(metadata.registeredBeneficiaries.length).to.equal(0);
      expect(metadata.electionState).to.equal(ElectionState.Registration);
      expect(metadata.electionStateStringLong).to.equal("open for registration");
      expect(metadata.electionStateStringShort).to.equal("registration");
      expect(metadata.bondRequirements.required).to.equal(true);
      expect(metadata.bondRequirements.amount).to.equal(parseEther("100"));
      expect(metadata.configuration.awardees).to.equal(2);
      expect(metadata.configuration.ranking).to.equal(5);
      expect(metadata.useChainlinkVRF).to.equal(true);
      expect(metadata.periods.cooldownPeriod).to.equal(83 * ONE_DAY);
      expect(metadata.periods.registrationPeriod).to.equal(14 * ONE_DAY);
      expect(metadata.periods.votingPeriod).to.equal(14 * ONE_DAY);
      expect(metadata.startTime).to.equal(currentBlock.timestamp + 1);
      expect(metadata.randomNumber).to.equal(0);
      expect(metadata.shareType).to.equal(0);
    });

    it("should prevent an election from initializing if it isn't finalized", async function () {
      await contracts.grantElections.initialize(GRANT_TERM.QUARTER, DEFAULT_REGION);
      await expect(contracts.grantElections.initialize(GRANT_TERM.QUARTER, DEFAULT_REGION)).to.be.revertedWith(
        "election not yet finalized"
      );
    });
    it("should allow to create a new election for a term when the old one is finalized", async function () {
      const merkleRoot = ethers.utils.formatBytes32String("merkleRoot");
      await contracts.grantElections
        .connect(governance)
        .setConfiguration(
          GRANT_TERM.QUARTER,
          4,
          2,
          false,
          1000,
          20 * 86400,
          100,
          0,
          false,
          parseEther("2000"),
          true,
          0
        );
      await prepareElection(GRANT_TERM.QUARTER, electionId);
      ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
      ethers.provider.send("evm_mine", []);
      await contracts.grantElections.refreshElectionState(electionId);
      await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
      await contracts.grantElections.connect(approver).approveFinalization(electionId, merkleRoot);
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      const currentBlock = await ethers.provider._getBlock(currentBlockNumber);
      const result = contracts.grantElections.initialize(GRANT_TERM.QUARTER, DEFAULT_REGION);
      await expect(result)
        .to.emit(contracts.grantElections, "ElectionInitialized")
        .withArgs(GRANT_TERM.QUARTER, DEFAULT_REGION, currentBlock.timestamp + 1);

      await expect(result).to.emit(contracts.beneficiaryVaults, "VaultClosed").withArgs(GRANT_TERM.QUARTER);

      const activeElectionId = await contracts.grantElections.activeElections(DEFAULT_REGION, GRANT_TERM.QUARTER);
      expect(activeElectionId).to.equal(electionId + 1);
    });
    it("should not initialize a vault even the needed budget is larger than rewardBudget", async function () {
      await contracts.participationReward
        .connect(governance)
        .setRewardsBudget(utils.formatBytes32String("GrantElections"), parseEther("3000"));
      const currentBlock = await waffle.provider.getBlock("latest");
      const result = await contracts.grantElections.initialize(GRANT_TERM.QUARTER, DEFAULT_REGION);
      expect(result)
        .to.emit(contracts.grantElections, "ElectionInitialized")
        .withArgs(GRANT_TERM.QUARTER, DEFAULT_REGION, currentBlock.timestamp + 1);
      expect(result).to.not.emit(contracts.participationReward, "VaultInitialized");
      const election = await contracts.grantElections.elections(electionId);
      expect(election.vaultId).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000");
    });
  });

  describe("voting", function () {
    beforeEach(async function () {
      await contracts.grantElections.initialize(GRANT_TERM.MONTH, DEFAULT_REGION);
    });
    it("should require voice credits", async function () {
      await expect(contracts.grantElections.vote([], [], electionId)).to.be.revertedWith("Voice credits are required");
    });

    it("should require beneficiaries", async function () {
      await expect(contracts.grantElections.vote([], [1], electionId)).to.be.revertedWith("Beneficiaries are required");
    });

    it("should require election open for voting", async function () {
      await expect(contracts.grantElections.vote([beneficiary.address], [1], electionId)).to.be.revertedWith(
        "Election not open for voting"
      );
    });

    it("should require staked voice credits", async function () {
      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
      ethers.provider.send("evm_mine", []);
      await contracts.mockStaking.mock.getVoiceCredits.returns(0);
      await expect(contracts.grantElections.vote([beneficiary.address], [1], electionId)).to.be.revertedWith(
        "must have voice credits from staking"
      );
    });

    it("should require eligible beneficiary", async function () {
      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
      ethers.provider.send("evm_mine", []);
      await contracts.mockStaking.mock.getVoiceCredits.returns(10);
      await expect(contracts.grantElections.vote([beneficiary.address], [1], electionId)).to.be.revertedWith(
        "ineligible beneficiary"
      );
    });

    it("should vote successfully", async function () {
      await contracts.mockPop.connect(beneficiary).approve(contracts.grantElections.address, registrationBondMonth);

      await contracts.mockStaking.mock.getVoiceCredits.returns(10);
      await contracts.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await contracts.grantElections.connect(beneficiary).registerForElection(beneficiary.address, electionId);

      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
      ethers.provider.send("evm_mine", []);

      await contracts.grantElections.vote([beneficiary.address], [5], electionId);
      const metadata = await GrantElectionAdapter(contracts.grantElections).getElectionMetadata(GRANT_TERM.MONTH);
      expect(metadata["votes"][0]).to.deep.contain({
        voter: owner.address,
        beneficiary: beneficiary.address,
      });
      expect(metadata["votes"][0].weight).to.equal(BigNumber.from(Math.round(Math.sqrt(5))));
    });

    it("should not allow to vote twice for same address and grant term", async function () {
      await contracts.mockPop.connect(beneficiary).approve(contracts.grantElections.address, registrationBondMonth);
      await contracts.mockStaking.mock.getVoiceCredits.returns(10);
      await contracts.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await contracts.grantElections.connect(beneficiary).registerForElection(beneficiary.address, electionId);
      ethers.provider.send("evm_increaseTime", [7 * ONE_DAY]);
      ethers.provider.send("evm_mine", []);

      await contracts.grantElections.vote([beneficiary.address], [5], electionId);
      await expect(contracts.grantElections.vote([beneficiary.address], [1], electionId)).to.be.revertedWith(
        "address already voted for election term"
      );
    });
  });

  describe("finalization", function () {
    const merkleRoot = ethers.utils.formatBytes32String("merkleRoot");
    describe("without randomization", function () {
      beforeEach(async function () {
        await contracts.grantElections
          .connect(governance)
          .setConfiguration(
            GRANT_TERM.MONTH,
            4,
            2,
            false,
            1000,
            20 * 86400,
            100,
            0,
            false,
            parseEther("2000"),
            true,
            0
          );
        await prepareElection(GRANT_TERM.MONTH, electionId);
      });
      describe("propose finalization", function () {
        it("require to be called by a proposer", async function () {
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await expect(
            contracts.grantElections.connect(nonOwner).proposeFinalization(electionId, merkleRoot)
          ).to.be.revertedWith("you dont have the right role");
        });

        it("require election closed", async function () {
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await expect(
            contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot)
          ).to.be.revertedWith("wrong election state");
        });

        it("require not finalized", async function () {
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await contracts.grantElections.refreshElectionState(electionId);
          await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
          await contracts.grantElections.connect(approver).approveFinalization(electionId, merkleRoot);
          await expect(
            contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot)
          ).to.be.revertedWith("wrong election state");
        });

        it("overwrites merkleRoot when calling proposeFinalization twice", async function () {
          const newMerkleRoot = ethers.utils.formatBytes32String("newMerkleRoot");
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await contracts.grantElections.refreshElectionState(electionId);
          await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
          expect(await contracts.grantElections.getElectionMerkleRoot(electionId)).to.equal(merkleRoot);
          await contracts.grantElections.connect(proposer).proposeFinalization(electionId, newMerkleRoot);
          expect(await contracts.grantElections.getElectionMerkleRoot(electionId)).to.equal(newMerkleRoot);
        });

        it("propose finalization successfully", async function () {
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await contracts.grantElections.refreshElectionState(electionId);
          const result = await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
          expect(result).to.emit(contracts.grantElections, "FinalizationProposed").withArgs(electionId, merkleRoot);
          const election = await contracts.grantElections.elections(electionId);
          expect(election.electionState).to.equal(3);
        });
        describe("incentive payout", function () {
          it("doesnt pays out incentive if the incentiveBudget is too low", async function () {
            await contracts.grantElections.connect(owner).fundKeeperIncentive(parseEther("1000"));
            ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
            ethers.provider.send("evm_mine", []);
            await contracts.grantElections.refreshElectionState(electionId);
            await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
            const balance1 = await contracts.mockPop.balanceOf(proposer.address);
            expect(balance1).to.equal(0);
            const incentiveBudget1 = await contracts.grantElections.incentiveBudget();
            expect(incentiveBudget1).to.equal(parseEther("1000"));
          });

          it("pays out incentive", async function () {
            await contracts.grantElections.connect(owner).fundKeeperIncentive(parseEther("2000"));
            ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
            ethers.provider.send("evm_mine", []);
            await contracts.grantElections.refreshElectionState(electionId);
            await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
            const balance1 = await contracts.mockPop.balanceOf(proposer.address);
            expect(balance1).to.equal(parseEther("2000"));
            const incentiveBudget1 = await contracts.grantElections.incentiveBudget();
            expect(incentiveBudget1).to.equal(0);
          });

          it("doesnt pay out incentive when calling proposeFinalization again", async function () {
            //Enough pop to fund 2 incentives
            await contracts.grantElections.connect(owner).fundKeeperIncentive(parseEther("4000"));
            ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
            ethers.provider.send("evm_mine", []);
            await contracts.grantElections.refreshElectionState(electionId);
            await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
            const balance1 = await contracts.mockPop.balanceOf(proposer.address);
            expect(balance1).to.equal(parseEther("2000"));
            const incentiveBudget1 = await contracts.grantElections.incentiveBudget();
            expect(incentiveBudget1).to.equal(parseEther("2000"));

            await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
            const balance2 = await contracts.mockPop.balanceOf(proposer.address);
            expect(balance2).to.equal(parseEther("2000"));
            const incentiveBudget2 = await contracts.grantElections.incentiveBudget();
            expect(incentiveBudget2).to.equal(parseEther("2000"));
          });
        });
      });
      describe("approve finalization", function () {
        it("approveFinalization needs an election in proposedFinalization state", async function () {
          await expect(
            contracts.grantElections.connect(approver).approveFinalization(electionId, merkleRoot)
          ).to.be.revertedWith("finalization not yet proposed");
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await contracts.grantElections.refreshElectionState(electionId);
          await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
          await contracts.grantElections.connect(approver).approveFinalization(electionId, merkleRoot);
          await expect(
            contracts.grantElections.connect(approver).approveFinalization(electionId, merkleRoot)
          ).to.be.revertedWith("election already finalized");
        });

        it("approves finalization successfully", async function () {
          await expect(
            contracts.grantElections.connect(approver).approveFinalization(electionId, merkleRoot)
          ).to.be.revertedWith("finalization not yet proposed");
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await contracts.grantElections.refreshElectionState(electionId);
          await contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot);
          const result = await contracts.grantElections.connect(approver).approveFinalization(electionId, merkleRoot);
          expect(result).to.emit(contracts.grantElections, "ElectionFinalized").withArgs(electionId, merkleRoot);
          expect(result).to.emit(contracts.beneficiaryVaults, "VaultOpened").withArgs(0, merkleRoot);
          const election = await contracts.grantElections.elections(electionId);
          expect(election.electionState).to.equal(4);
        });
        it("merkle root contains correct winners with their equal weight share allocations", async function () {
          await contracts.grantElections
            .connect(governance)
            .setConfiguration(
              GRANT_TERM.QUARTER,
              4,
              2,
              false,
              1000,
              20 * 86400,
              100,
              0,
              false,
              parseEther("2000"),
              true,
              0
            );
          await prepareElection(GRANT_TERM.QUARTER, electionId + 1);
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await contracts.grantElections.refreshElectionState(electionId + 1);

          const electionMetaData: ElectionMetadata = await GrantElectionAdapter(
            contracts.grantElections
          ).getElectionMetadata(electionId + 1);
          let winner = rankAwardees(electionMetaData);
          winner = calculateVaultShare(winner, electionMetaData.shareType);
          expect(winner[0][0]).to.equal(beneficiary.address);
          expect(winner[1][0]).to.equal(beneficiary3.address);
          expect(winner[0][1]).to.equal(parseEther("50"));
          expect(winner[1][1]).to.equal(parseEther("50"));
        });
        it("merkle root contains correct winners with their dynamic weight share allocations", async function () {
          await contracts.grantElections
            .connect(governance)
            .setConfiguration(
              GRANT_TERM.QUARTER,
              4,
              2,
              false,
              1000,
              20 * 86400,
              100,
              0,
              false,
              parseEther("2000"),
              true,
              1
            );
          await prepareElection(GRANT_TERM.QUARTER, electionId + 1);
          ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
          ethers.provider.send("evm_mine", []);
          await contracts.grantElections.refreshElectionState(electionId + 1);

          const electionMetaData: ElectionMetadata = await GrantElectionAdapter(
            contracts.grantElections
          ).getElectionMetadata(electionId + 1);
          let winner = rankAwardees(electionMetaData);
          winner = calculateVaultShare(winner, electionMetaData.shareType);
          expect(winner[0][0]).to.equal(beneficiary.address);
          expect(winner[1][0]).to.equal(beneficiary3.address);
          expect(winner[0][1]).to.equal(parseEther("60"));
          expect(winner[1][1]).to.equal(parseEther("40"));
        });
      });
    });
    describe("with randomization", function () {
      beforeEach(async function () {
        await contracts.grantElections
          .connect(governance)
          .setConfiguration(GRANT_TERM.MONTH, 4, 2, true, 1000, 20 * 86400, 100, 0, false, parseEther("2000"), true, 0);
        await prepareElection(GRANT_TERM.MONTH, electionId);
        ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
        ethers.provider.send("evm_mine", []);
        await contracts.grantElections.refreshElectionState(electionId);
      });
      it("creates a random number", async function () {
        await contracts.randomNumberHelper.mockFulfillRandomness(7);
        await contracts.grantElections.getRandomNumber(electionId);
        const election = await contracts.grantElections.elections(electionId);
        expect(election.randomNumber).to.equal(8);
      });
      it("requires a random number to propose finalization", async function () {
        await expect(
          contracts.grantElections.connect(proposer).proposeFinalization(electionId, merkleRoot)
        ).to.revertedWith("randomNumber required");
      });
      it("merkle root contains correct winners with their equal weight share allocations", async function () {
        await contracts.grantElections
          .connect(governance)
          .setConfiguration(
            GRANT_TERM.QUARTER,
            4,
            2,
            true,
            1000,
            20 * 86400,
            100,
            0,
            false,
            parseEther("2000"),
            true,
            0
          );
        await prepareElection(GRANT_TERM.QUARTER, electionId + 1);
        ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
        ethers.provider.send("evm_mine", []);
        await contracts.grantElections.refreshElectionState(electionId + 1);
        await contracts.randomNumberHelper.mockFulfillRandomness(96);
        await contracts.grantElections.getRandomNumber(electionId + 1);

        const electionMetaData: ElectionMetadata = await GrantElectionAdapter(
          contracts.grantElections
        ).getElectionMetadata(electionId + 1);
        let winner = rankAwardees(electionMetaData);
        winner = calculateVaultShare(winner, electionMetaData.shareType);
        expect(winner[0][0]).to.equal(beneficiary3.address);
        expect(winner[1][0]).to.equal(beneficiary2.address);
        expect(winner[0][1]).to.equal(parseEther("50"));
        expect(winner[1][1]).to.equal(parseEther("50"));
      });
      it("merkle root contains correct winners with their dynamic weight share allocations", async function () {
        await contracts.grantElections
          .connect(governance)
          .setConfiguration(
            GRANT_TERM.QUARTER,
            4,
            2,
            true,
            1000,
            20 * 86400,
            100,
            0,
            false,
            parseEther("2000"),
            true,
            1
          );
        await prepareElection(GRANT_TERM.QUARTER, electionId + 1);
        ethers.provider.send("evm_increaseTime", [30 * ONE_DAY]);
        ethers.provider.send("evm_mine", []);
        await contracts.grantElections.refreshElectionState(electionId + 1);
        await contracts.randomNumberHelper.mockFulfillRandomness(96);
        await contracts.grantElections.getRandomNumber(electionId + 1);

        const electionMetaData: ElectionMetadata = await GrantElectionAdapter(
          contracts.grantElections
        ).getElectionMetadata(electionId + 1);
        let winner = rankAwardees(electionMetaData);
        winner = calculateVaultShare(winner, electionMetaData.shareType);
        expect(winner[0][0]).to.equal(beneficiary3.address);
        expect(winner[1][0]).to.equal(beneficiary2.address);
        expect(winner[0][1]).to.equal(parseEther("57.142857142857142857"));
        expect(winner[1][1]).to.equal(parseEther("42.857142857142857142"));
      });
    });
  });
});
