import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import bluebird from "bluebird";
import { expect } from "chai";
import { BigNumber, utils, Wallet } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";
import { DAO_ROLE, INCENTIVE_MANAGER_ROLE, KEEPER_ROLE } from "../lib/acl/roles";
import ButterBatchProcessingAdapter from "../lib/adapters/ButterBatchAdapter";
import { expectRevert, expectValue } from "../lib/utils/expectValue";
import { timeTravel } from "../lib/utils/test";
import { DAYS } from "../lib/utils/test/constants";
import { ContractRegistry, MockERC20, RewardsEscrow, Staking } from "../typechain";
import { ButterBatchProcessing } from "../typechain/ButterBatchProcessing";
import { MockBasicIssuanceModule } from "../typechain/MockBasicIssuanceModule";
import { MockCurveMetapool } from "../typechain/MockCurveMetapool";
import { MockCurveThreepool } from "../typechain/MockCurveThreepool";
import { MockYearnV2Vault } from "../typechain/MockYearnV2Vault";

const provider = waffle.provider;

interface Contracts {
  mock3Crv: MockERC20;
  mockThreePool: MockCurveThreepool;
  mockPop: MockERC20;
  mockCrvUSDX: MockERC20;
  mockCrvUST: MockERC20;
  mockSetToken: MockERC20;
  mockYearnVaultUSDX: MockYearnV2Vault;
  mockYearnVaultUST: MockYearnV2Vault;
  mockCurveMetapoolUSDX: MockCurveMetapool;
  mockCurveMetapoolUST: MockCurveMetapool;
  mockBasicIssuanceModule: MockBasicIssuanceModule;
  butterBatchProcessing: ButterBatchProcessing;
  staking: Staking;
  contractRegistry: ContractRegistry;
}

enum BatchType {
  Mint,
  Redeem,
}

const DAY = 60 * 60 * 24;

const DepositorInitial = parseEther("100000");
let owner: SignerWithAddress,
  depositor: SignerWithAddress,
  depositor1: SignerWithAddress,
  depositor2: SignerWithAddress,
  depositor3: SignerWithAddress,
  treasury: SignerWithAddress;
let contracts: Contracts;

async function deployContracts(): Promise<Contracts> {
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mock3Crv = await (await MockERC20.deploy("3Crv", "3Crv", 18)).deployed();
  const mockBasicCoin = await (await MockERC20.deploy("Basic", "Basic", 18)).deployed();
  const mockPop = await (await MockERC20.deploy("POP", "POP", 18)).deployed();
  await mock3Crv.mint(depositor.address, DepositorInitial);
  await mock3Crv.mint(depositor1.address, DepositorInitial);
  await mock3Crv.mint(depositor2.address, DepositorInitial);
  await mock3Crv.mint(depositor3.address, DepositorInitial);

  const mockCrvUSDX = await (await MockERC20.deploy("crvUSDX", "crvUSDX", 18)).deployed();
  const mockCrvUST = await (await MockERC20.deploy("crvUST", "crvUST", 18)).deployed();
  const mockSetToken = await await MockERC20.deploy("setToken", "setToken", 18);

  const MockYearnV2Vault = await ethers.getContractFactory("MockYearnV2Vault");
  const mockYearnVaultUSDX = (await (
    await MockYearnV2Vault.deploy(mockCrvUSDX.address)
  ).deployed()) as MockYearnV2Vault;
  const mockYearnVaultUST = (await (await MockYearnV2Vault.deploy(mockCrvUST.address)).deployed()) as MockYearnV2Vault;

  const MockCurveMetapool = await ethers.getContractFactory("MockCurveMetapool");

  //Besides crvUSDX and 3Crv no coins are needed in this test which is why i used the same token in the other places
  const mockCurveMetapoolUSDX = (await (
    await MockCurveMetapool.deploy(
      mockBasicCoin.address,
      mockCrvUSDX.address,
      mock3Crv.address,
      mockBasicCoin.address,
      mockBasicCoin.address,
      mockBasicCoin.address
    )
  ).deployed()) as MockCurveMetapool;
  const mockCurveMetapoolUST = (await (
    await MockCurveMetapool.deploy(
      mockBasicCoin.address,
      mockCrvUST.address,
      mock3Crv.address,
      mockBasicCoin.address,
      mockBasicCoin.address,
      mockBasicCoin.address
    )
  ).deployed()) as MockCurveMetapool;

  const mockBasicIssuanceModule = (await (
    await (
      await ethers.getContractFactory("MockBasicIssuanceModule")
    ).deploy([mockYearnVaultUSDX.address, mockYearnVaultUST.address], [50, 50])
  ).deployed()) as MockBasicIssuanceModule;

  const aclRegistry = await (await (await ethers.getContractFactory("ACLRegistry")).deploy()).deployed();

  const contractRegistry = await (
    await (await ethers.getContractFactory("ContractRegistry")).deploy(aclRegistry.address)
  ).deployed();

  const keeperIncentive = await (
    await (await ethers.getContractFactory("KeeperIncentiveV2")).deploy(contractRegistry.address, 0, 0)
  ).deployed();

  const popStaking = await (
    await (await ethers.getContractFactory("PopLocker")).deploy(mockPop.address, mockPop.address)
  ).deployed();

  const mockThreePoolContract = await ethers.getContractFactory("MockCurveThreepool");
  const mockThreePool = await mockThreePoolContract.deploy(
    mock3Crv.address,
    mockCrvUSDX.address,
    mockCrvUSDX.address,
    mockCrvUSDX.address
  );
  const rewardsEscrow = (await (
    await (await ethers.getContractFactory("RewardsEscrow")).deploy(mockPop.address)
  ).deployed()) as RewardsEscrow;

  const staking = await (
    await (
      await ethers.getContractFactory("Staking")
    ).deploy(mockPop.address, mockSetToken.address, rewardsEscrow.address)
  ).deployed();

  const butterBatchProcessing = (await (
    await (
      await ethers.getContractFactory("ButterBatchProcessing")
    ).deploy(
      contractRegistry.address,
      staking.address,
      mockSetToken.address,
      mock3Crv.address,
      mockThreePool.address,
      mockBasicIssuanceModule.address,
      [mockYearnVaultUSDX.address, mockYearnVaultUST.address],
      [
        {
          curveMetaPool: mockCurveMetapoolUSDX.address,
          crvLPToken: mockCrvUSDX.address,
        },
        {
          curveMetaPool: mockCurveMetapoolUST.address,
          crvLPToken: mockCrvUST.address,
        },
      ],
      {
        batchCooldown: 1800,
        mintThreshold: parseEther("20000"),
        redeemThreshold: parseEther("200"),
      }
    )
  ).deployed()) as ButterBatchProcessing;

  await aclRegistry.grantRole(DAO_ROLE, owner.address);
  await aclRegistry.grantRole(KEEPER_ROLE, owner.address);
  await aclRegistry.grantRole(INCENTIVE_MANAGER_ROLE, owner.address);

  await butterBatchProcessing.connect(owner).setSlippage(7, 200);

  await butterBatchProcessing.setApprovals();

  await contractRegistry.connect(owner).addContract(ethers.utils.id("POP"), mockPop.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("KeeperIncentive"), keeperIncentive.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("PopLocker"), popStaking.address, ethers.utils.id("1"));

  await keeperIncentive
    .connect(owner)
    .createIncentive(butterBatchProcessing.address, 0, true, false, mockPop.address, 1, 0);

  await keeperIncentive
    .connect(owner)
    .createIncentive(butterBatchProcessing.address, 0, true, false, mockPop.address, 1, 0);

  return {
    mock3Crv,
    mockPop,
    mockCrvUSDX,
    mockCrvUST,
    mockThreePool,
    mockSetToken,
    mockYearnVaultUSDX,
    mockYearnVaultUST,
    mockCurveMetapoolUSDX,
    mockCurveMetapoolUST,
    mockBasicIssuanceModule,
    butterBatchProcessing,
    staking,
    contractRegistry,
  };
}

const deployAndAssignContracts = async () => {
  [owner, depositor, depositor1, depositor2, depositor3, treasury] = await ethers.getSigners();
  contracts = await deployContracts();
  await contracts.mock3Crv.connect(depositor).approve(contracts.butterBatchProcessing.address, parseEther("100000000"));
};

describe("ButterBatchProcessing", function () {
  beforeEach(async function () {
    await deployAndAssignContracts();
  });
  describe("setStaking", () => {
    const NEW_STAKING_ADDRESS = Wallet.createRandom().address;

    it("should allow dao role to set staking", async () => {
      await contracts.butterBatchProcessing.connect(owner).setStaking(NEW_STAKING_ADDRESS);
      expectValue(await contracts.butterBatchProcessing.staking(), NEW_STAKING_ADDRESS);
    });
    it("should allow not allow a non-dao role to set staking", async () => {
      await expectRevert(
        contracts.butterBatchProcessing.connect(depositor).setStaking(NEW_STAKING_ADDRESS),
        "you dont have the right role"
      );
    });
  });
  describe("EOA only flash loan defender", () => {
    it("does not allow interaction from unapproved contracts on depositForMint", async () => {
      const defendedContract = await ethers.getContractFactory("ButterBatchProcessingDefendedHelper");
      const deployed = await defendedContract.deploy(contracts.butterBatchProcessing.address);
      await expectRevert(deployed.connect(depositor).depositMint(), "Access denied for caller");
    });
    it("does not allow interaction from unapproved contracts on depositForRedeem", async () => {
      const defendedContract = await ethers.getContractFactory("ButterBatchProcessingDefendedHelper");
      const deployed = await defendedContract.deploy(contracts.butterBatchProcessing.address);
      await expectRevert(deployed.connect(depositor).depositRedeem(), "Access denied for caller");
    });
  });
  context("setters and getters", () => {
    describe("set slippage", async () => {
      const SLIPPAGE = 54;
      it("sets slippage value with correct permissions", async () => {
        await contracts.butterBatchProcessing.connect(owner).setSlippage(SLIPPAGE, SLIPPAGE);
        const slippage = await contracts.butterBatchProcessing.slippage();
        expectValue(slippage[0], SLIPPAGE);
        expectValue(slippage[1], SLIPPAGE);
      });
      it("does not allow unauthenticated address to set redeem slippage", async () => {
        await expectRevert(
          contracts.butterBatchProcessing.connect(depositor).setSlippage(SLIPPAGE, SLIPPAGE),
          "you dont have the right role"
        );
      });
    });

    describe("setApprovals", async () => {
      it("sets approvals idempotently", async () => {
        //  run setApproval multiple times to assert idempotency
        await contracts.butterBatchProcessing.setApprovals();
        await contracts.butterBatchProcessing.setApprovals();
        await contracts.butterBatchProcessing.setApprovals();

        const threeCrvMetapoolAllowance_0 = await contracts.mock3Crv.allowance(
          contracts.butterBatchProcessing.address,
          contracts.mockCurveMetapoolUSDX.address
        );
        const yearnAllowance_0 = await contracts.mockCrvUSDX.allowance(
          contracts.butterBatchProcessing.address,
          contracts.mockYearnVaultUSDX.address
        );

        const lpMetapoolAllowance_0 = await contracts.mockCrvUSDX.allowance(
          contracts.butterBatchProcessing.address,
          contracts.mockCurveMetapoolUSDX.address
        );

        expect(threeCrvMetapoolAllowance_0).to.equal(ethers.constants.MaxUint256);
        expect(yearnAllowance_0).to.equal(ethers.constants.MaxUint256);
        expect(lpMetapoolAllowance_0).to.equal(ethers.constants.MaxUint256);

        const threeCrvMetapoolAllowance_1 = await contracts.mock3Crv.allowance(
          contracts.butterBatchProcessing.address,
          contracts.mockCurveMetapoolUST.address
        );
        const yearnAllowance_1 = await contracts.mockCrvUST.allowance(
          contracts.butterBatchProcessing.address,
          contracts.mockYearnVaultUST.address
        );

        const lpMetapoolAllowance_1 = await contracts.mockCrvUST.allowance(
          contracts.butterBatchProcessing.address,
          contracts.mockCurveMetapoolUST.address
        );

        expect(threeCrvMetapoolAllowance_1).to.equal(ethers.constants.MaxUint256);
        expect(yearnAllowance_1).to.equal(ethers.constants.MaxUint256);
        expect(lpMetapoolAllowance_1).to.equal(ethers.constants.MaxUint256);
      });
    });
    describe("setCurvePoolTokenPairs", () => {
      it("sets curve pool token pairs", async () => {
        const YUST_TOKEN_ADDRESS = "0x1c6a9783f812b3af3abbf7de64c3cd7cc7d1af44";
        const UST_METAPOOL_ADDRESS = "0x890f4e345B1dAED0367A877a1612f86A1f86985f";
        const CRV_UST_TOKEN_ADDRESS = "0x94e131324b6054c0D789b190b2dAC504e4361b53";
        await contracts.butterBatchProcessing.connect(owner).setCurvePoolTokenPairs(
          [YUST_TOKEN_ADDRESS],
          [
            {
              curveMetaPool: UST_METAPOOL_ADDRESS,
              crvLPToken: CRV_UST_TOKEN_ADDRESS,
            },
          ]
        );
        expect(await contracts.butterBatchProcessing.curvePoolTokenPairs(YUST_TOKEN_ADDRESS)).to.deep.eq([
          UST_METAPOOL_ADDRESS,
          CRV_UST_TOKEN_ADDRESS,
        ]);
      });
    });
    describe("setBatchCooldown", () => {
      it("sets batch cooldown period", async () => {
        await contracts.butterBatchProcessing.setProcessingThreshold(52414, parseEther("20000"), parseEther("200"));
        const processingThreshold = await contracts.butterBatchProcessing.processingThreshold();
        expect(processingThreshold[0]).to.equal(BigNumber.from(52414));
      });
      it("should revert if not owner", async function () {
        await expect(
          contracts.butterBatchProcessing
            .connect(depositor)
            .setProcessingThreshold(52414, parseEther("20000"), parseEther("200"))
        ).to.be.revertedWith("you dont have the right role");
      });
    });
    describe("setMintThreshold", () => {
      it("sets mint threshold", async () => {
        await contracts.butterBatchProcessing.setProcessingThreshold(1800, parseEther("100342312"), parseEther("200"));
        const processingThreshold = await contracts.butterBatchProcessing.processingThreshold();
        expect(processingThreshold[1]).to.equal(parseEther("100342312"));
      });
      it("should revert if not owner", async function () {
        await expect(
          contracts.butterBatchProcessing
            .connect(depositor)
            .setProcessingThreshold(1800, parseEther("100342312"), parseEther("200"))
        ).to.be.revertedWith("you dont have the right role");
      });
    });
    describe("setRedeemThreshold", () => {
      it("sets redeem threshold", async () => {
        await contracts.butterBatchProcessing.setProcessingThreshold(
          1800,
          parseEther("20000"),
          parseEther("100342312")
        );
        const processingThreshold = await contracts.butterBatchProcessing.processingThreshold();
        expect(processingThreshold[2]).to.equal(parseEther("100342312"));
      });
      it("should revert if not owner", async function () {
        await expect(
          contracts.butterBatchProcessing
            .connect(depositor)
            .setProcessingThreshold(1800, parseEther("20000"), parseEther("100342312"))
        ).to.be.revertedWith("you dont have the right role");
      });
    });
  });
  context("batch generation", () => {
    describe("mint batch generation", () => {
      it("should set a non-zero batchId when initialized", async () => {
        const batchId0 = await contracts.butterBatchProcessing.batchIds(0);
        const adapter = new ButterBatchProcessingAdapter(contracts.butterBatchProcessing);
        const batch = await adapter.getBatch(batchId0);
        expect(
          batch.batchId.match(/0x.+[^0x0000000000000000000000000000000000000000000000000000000000000000]/)?.length
        ).equal(1);
      });
      it("should set batch struct properties when the contract is deployed", async () => {
        const batchId0 = await contracts.butterBatchProcessing.batchIds(0);
        const adapter = new ButterBatchProcessingAdapter(contracts.butterBatchProcessing);
        const batch = await adapter.getBatch(batchId0);
        expectValue(batch.batchType, BatchType.Mint);
        expectValue(batch.claimable, false);
        expectValue(batch.claimableTokenAddress, contracts.mockSetToken.address);
        expectValue(batch.suppliedTokenAddress, contracts.mock3Crv.address);
      });
    });
    describe("redeem batch generation", () => {
      it("should set a non-zero batchId when initialized", async () => {
        const batchId1 = await contracts.butterBatchProcessing.batchIds(1);
        const adapter = new ButterBatchProcessingAdapter(contracts.butterBatchProcessing);
        const batch = await adapter.getBatch(batchId1);
        expect(
          batch.batchId.match(/0x.+[^0x0000000000000000000000000000000000000000000000000000000000000000]/)?.length
        ).equal(1);
      });
      it("should set batch struct properties when the contract is deployed", async () => {
        const batchId1 = await contracts.butterBatchProcessing.batchIds(1);
        const adapter = new ButterBatchProcessingAdapter(contracts.butterBatchProcessing);
        const batch = await adapter.getBatch(batchId1);

        expect(batch).to.deep.contain({
          batchType: BatchType.Redeem,
          claimable: false,
          claimableTokenAddress: contracts.mock3Crv.address,
          suppliedTokenAddress: contracts.mockSetToken.address,
        });
        expect(batch.claimableTokenBalance).to.equal(BigNumber.from(0));
        expect(batch.unclaimedShares).to.equal(BigNumber.from(0));
        expect(batch.suppliedTokenBalance).to.equal(BigNumber.from(0));
      });
    });
  });
  describe("minting", function () {
    context("depositing", function () {
      describe("batch struct", () => {
        const deposit = async (amount?: number) => {
          await contracts.butterBatchProcessing
            .connect(depositor)
            .depositForMint(parseEther(amount ? amount.toString() : "10"), depositor.address);
        };

        const subject = async (batchId) => {
          const adapter = new ButterBatchProcessingAdapter(contracts.butterBatchProcessing);
          const batch = await adapter.getBatch(batchId);
          return batch;
        };

        it("increments suppliedTokenBalance and unclaimedShares with deposit", async () => {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          await deposit(10);
          const batch = await subject(batchId);
          expectValue(batch.suppliedTokenBalance, parseEther("10"));
          expectValue(batch.unclaimedShares, parseEther("10"));
        });
        it("depositing does not make a batch claimable", async () => {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          await deposit(10);
          expect(await subject(batchId)).to.deep.contain({
            claimable: false,
          });
        });
        it("increments suppliedTokenBalance and unclaimedShares when multiple deposits are made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          await deposit(); // 10
          await deposit(); // 10
          await deposit(); // 10
          const batch = await subject(batchId);
          expectValue(batch.claimableTokenBalance, parseEther("0"));
          expectValue(batch.suppliedTokenBalance, parseEther("30"));
          expectValue(batch.unclaimedShares, parseEther("30"));
        });
        it("increments claimableTokenBalance when batch is minted", async () => {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          await deposit(); // 10
          await timeTravel(1 * DAY); // wait enough time to mint batch
          await contracts.butterBatchProcessing.batchMint();
          const batchHysiOwned = await contracts.mockSetToken.balanceOf(contracts.butterBatchProcessing.address);
          const batch = await subject(batchId);
          expectValue(batch.claimableTokenBalance, batchHysiOwned);
          expectValue(batch.suppliedTokenBalance, parseEther("10"));
          expectValue(batch.unclaimedShares, parseEther("10"));
        });
        it("sets batch to claimable when batch is minted", async () => {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          await deposit(); // 10
          await timeTravel(1 * DAY); // wait enough time to mint batch
          await contracts.butterBatchProcessing.batchMint();
          expect(await subject(batchId)).to.deep.contain({
            claimable: true,
          });
        });
        it("decrements unclaimedShares and claimable when claim is made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          await deposit(); // 10
          await timeTravel(1 * DAY); // wait enough time to mint batch
          await contracts.butterBatchProcessing.batchMint();
          await contracts.butterBatchProcessing.connect(depositor).claim(batchId, depositor.address);
          const batch = await subject(batchId);
          expectValue(batch.claimable, true);
          expectValue(batch.unclaimedShares, parseEther("0"));
          expectValue(batch.claimableTokenBalance, parseEther("0"));
        });
      });

      it("deposits 3crv in the current mintBatch", async function () {
        const result = await contracts.butterBatchProcessing
          .connect(depositor)
          .depositForMint(parseEther("10000"), depositor.address);
        expect(result)
          .to.emit(contracts.butterBatchProcessing, "Deposit")
          .withArgs(depositor.address, parseEther("10000"));
        expect(await contracts.mock3Crv.balanceOf(contracts.butterBatchProcessing.address)).to.equal(
          parseEther("10000")
        );
        const currentMintBatchId = await contracts.butterBatchProcessing.currentMintBatchId();
        const currentBatch = await contracts.butterBatchProcessing.batches(currentMintBatchId);
        expect(currentBatch.suppliedTokenBalance).to.equal(parseEther("10000"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("10000"));
      });
      it("adds the mintBatch to the users batches", async function () {
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("10000"), depositor.address);

        const currentMintBatchId = await contracts.butterBatchProcessing.currentMintBatchId();
        expect(await contracts.butterBatchProcessing.accountBatches(depositor.address, 0)).to.equal(currentMintBatchId);
      });
      it("allows multiple deposits", async function () {
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("10000"), depositor.address);
        await contracts.mock3Crv
          .connect(depositor1)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing
          .connect(depositor1)
          .depositForMint(parseEther("10000"), depositor1.address);
        await contracts.mock3Crv
          .connect(depositor2)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing
          .connect(depositor2)
          .depositForMint(parseEther("5000"), depositor2.address);
        await contracts.butterBatchProcessing
          .connect(depositor2)
          .depositForMint(parseEther("5000"), depositor2.address);
        const currentMintBatchId = await contracts.butterBatchProcessing.currentMintBatchId();
        const currentBatch = await contracts.butterBatchProcessing.batches(currentMintBatchId);
        expect(currentBatch.suppliedTokenBalance).to.equal(parseEther("30000"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("30000"));
        expect(await contracts.butterBatchProcessing.accountBatches(depositor.address, 0)).to.equal(currentMintBatchId);
        expect(await contracts.butterBatchProcessing.accountBatches(depositor1.address, 0)).to.equal(
          currentMintBatchId
        );
        expect(await contracts.butterBatchProcessing.accountBatches(depositor2.address, 0)).to.equal(
          currentMintBatchId
        );
      });
    });
    context("batch minting", function () {
      context("reverts", function () {
        it("reverts when minting too early", async function () {
          await contracts.mock3Crv
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
          await contracts.butterBatchProcessing
            .connect(depositor)
            .depositForMint(parseEther("10000"), depositor.address);
          await expect(contracts.butterBatchProcessing.connect(owner).batchMint()).to.be.revertedWith(
            "can not execute batch mint yet"
          );
        });
        it("reverts when called by someone other the keeper", async function () {
          await contracts.mock3Crv
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
          await contracts.butterBatchProcessing
            .connect(depositor)
            .depositForMint(parseEther("10000"), depositor.address);
          await provider.send("evm_increaseTime", [1800]);

          await expect(contracts.butterBatchProcessing.connect(depositor).batchMint()).to.be.revertedWith(
            "you dont have the right role"
          );
        });
        it("reverts when slippage is too high", async () => {
          await contracts.mockThreePool.setVirtualPrice(parseEther("2"));
          await contracts.butterBatchProcessing.connect(owner).setSlippage(0, 7);
          await contracts.mock3Crv
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
          await contracts.butterBatchProcessing
            .connect(depositor)
            .depositForMint(parseEther("10000"), depositor.address);

          await timeTravel(1 * DAYS);

          await expect(contracts.butterBatchProcessing.connect(owner).batchMint()).to.be.revertedWith(
            "slippage too high"
          );
        });
      });
      context("success", function () {
        it("batch mints", async function () {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();

          await contracts.mock3Crv
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
          await contracts.butterBatchProcessing
            .connect(depositor)
            .depositForMint(parseEther("10000"), depositor.address);
          await provider.send("evm_increaseTime", [1800]);
          const result = await contracts.butterBatchProcessing.connect(owner).batchMint();
          expect(result)
            .to.emit(contracts.butterBatchProcessing, "BatchMinted")
            .withArgs(batchId, parseEther("10000"), parseEther("100"));
          expect(await contracts.mockSetToken.balanceOf(contracts.butterBatchProcessing.address)).to.equal(
            parseEther("100")
          );
        });
        it("mints early when mintThreshold is met", async function () {
          await contracts.mock3Crv
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
          await contracts.butterBatchProcessing
            .connect(depositor)
            .depositForMint(parseEther("10000"), depositor.address);
          await contracts.mock3Crv
            .connect(depositor1)
            .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
          await contracts.butterBatchProcessing
            .connect(depositor1)
            .depositForMint(parseEther("10000"), depositor1.address);
          await expect(contracts.butterBatchProcessing.connect(owner).batchMint()).to.emit(
            contracts.butterBatchProcessing,
            "BatchMinted"
          );
        });
        it("advances to the next batch", async function () {
          await contracts.mock3Crv
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
          await contracts.butterBatchProcessing
            .connect(depositor)
            .depositForMint(parseEther("10000"), depositor.address);
          await provider.send("evm_increaseTime", [1800]);

          const previousMintBatchId = await contracts.butterBatchProcessing.currentMintBatchId();
          await contracts.butterBatchProcessing.batchMint();

          const previousBatch = await contracts.butterBatchProcessing.batches(previousMintBatchId);
          expect(previousBatch.claimable).to.equal(true);

          const currentMintBatchId = await contracts.butterBatchProcessing.currentMintBatchId();
          expect(currentMintBatchId).to.not.equal(previousMintBatchId);
        });
      });
    });
    context("claiming", function () {
      beforeEach(async function () {
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("10000"), depositor.address);
        await contracts.mock3Crv
          .connect(depositor1)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing
          .connect(depositor1)
          .depositForMint(parseEther("10000"), depositor1.address);
        await contracts.mock3Crv
          .connect(depositor2)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing
          .connect(depositor2)
          .depositForMint(parseEther("10000"), depositor2.address);
        await contracts.mock3Crv
          .connect(depositor3)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing
          .connect(depositor3)
          .depositForMint(parseEther("10000"), depositor3.address);
      });
      it("reverts when batch is not yet claimable", async function () {
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        await expect(
          contracts.butterBatchProcessing.connect(depositor).claim(batchId, depositor.address)
        ).to.be.revertedWith("not yet claimable");
      });
      it("claims batch successfully", async function () {
        await provider.send("evm_increaseTime", [1800]);
        await provider.send("evm_mine", []);
        await contracts.butterBatchProcessing.connect(owner).batchMint();
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        expect(await contracts.butterBatchProcessing.connect(depositor).claim(batchId, depositor.address))
          .to.emit(contracts.butterBatchProcessing, "Claimed")
          .withArgs(depositor.address, BatchType.Mint, parseEther("10000"), parseEther("100"));
        expect(await contracts.mockSetToken.balanceOf(depositor.address)).to.equal(parseEther("100"));
        const batch = await contracts.butterBatchProcessing.batches(batchId);
        expect(batch.unclaimedShares).to.equal(parseEther("30000"));
        expect(batch.claimableTokenBalance).to.equal(parseEther("300"));
      });
      describe("claim and stake", () => {
        it("reverts when batch is not yet claimable", async function () {
          const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
          await expect(
            contracts.butterBatchProcessing.connect(depositor).claimAndStake(batchId, depositor.address)
          ).to.be.revertedWith("not yet claimable");
        });
        it("reverts when the batchType is Redeem", async function () {
          //Prepare claimable redeem batch
          await contracts.mockCrvUSDX.mint(contracts.mockYearnVaultUSDX.address, parseEther("20000"));
          await contracts.mockCrvUST.mint(contracts.mockYearnVaultUST.address, parseEther("20000"));
          await contracts.mockYearnVaultUSDX.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
          await contracts.mockYearnVaultUST.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
          await contracts.mockSetToken.mint(depositor.address, parseEther("10"));
          await contracts.mockSetToken
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("10"));
          await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("10"));
          await provider.send("evm_increaseTime", [1800]);
          const batchId = await contracts.butterBatchProcessing.currentRedeemBatchId();

          await contracts.butterBatchProcessing.connect(owner).batchRedeem();

          //Actual Test
          await expect(
            contracts.butterBatchProcessing.connect(depositor).claimAndStake(batchId, depositor.address)
          ).to.be.revertedWith("Can only stake BTR");
        });
        it("claims and stakes batch successully", async function () {
          await provider.send("evm_increaseTime", [1800]);
          await provider.send("evm_mine", []);
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          await contracts.butterBatchProcessing.connect(owner).batchMint();

          expect(await contracts.butterBatchProcessing.connect(depositor).claimAndStake(batchId, depositor.address))
            .to.emit(contracts.butterBatchProcessing, "Claimed")
            .withArgs(depositor.address, BatchType.Mint, parseEther("10000"), parseEther("100"));
          expect(await contracts.staking.balanceOf(depositor.address)).to.equal(parseEther("100"));
        });
      });
    });
  });

  describe("redeeming", function () {
    beforeEach(async function () {
      await contracts.mockSetToken.mint(depositor.address, parseEther("100"));
      await contracts.mockSetToken.mint(depositor1.address, parseEther("100"));
      await contracts.mockSetToken.mint(depositor2.address, parseEther("100"));
      await contracts.mockSetToken.mint(depositor3.address, parseEther("100"));
      await contracts.mockYearnVaultUSDX.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
      await contracts.mockYearnVaultUST.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
      await contracts.mockSetToken
        .connect(depositor)
        .increaseAllowance(contracts.butterBatchProcessing.address, parseEther("10000000000"));
    });
    context("depositing", function () {
      describe("batch struct", () => {
        const deposit = async (amount?: number) => {
          await contracts.butterBatchProcessing
            .connect(depositor)
            .depositForRedeem(parseEther(amount ? amount.toString() : "10"));
        };

        const subject = async (batchId) => {
          const adapter = new ButterBatchProcessingAdapter(contracts.butterBatchProcessing);
          const batch = await adapter.getBatch(batchId);
          return batch;
        };

        it("increments suppliedTokenBalance and unclaimedShares when a redeem deposit is made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
          await deposit(10);
          const batch = await subject(batchId);
          expectValue(batch.suppliedTokenBalance, parseEther("10"));
          expectValue(batch.claimable, false);
          expectValue(batch.unclaimedShares, parseEther("10"));
        });
        it("increments suppliedTokenBalance and unclaimedShares when multiple deposits are made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
          await deposit(); // 10
          await deposit(); // 10
          await deposit(); // 10
          const batch = await subject(batchId);
          expectValue(batch.claimableTokenBalance, parseEther("0"));
          expectValue(batch.suppliedTokenBalance, parseEther("30"));
          expectValue(batch.claimable, false);
          expectValue(batch.unclaimedShares, parseEther("30"));
        });
        it("updates struct when batch is minted", async () => {
          const batchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
          await deposit(); // 10
          await timeTravel(1 * DAY); // wait enough time to redeem batch
          await contracts.butterBatchProcessing.batchRedeem();
          const batch = await subject(batchId);
          expectValue(batch.suppliedTokenBalance, parseEther("10"));
          expectValue(batch.claimable, true);
          expectValue(batch.unclaimedShares, parseEther("10"));
        });
        it("decrements unclaimedShares and claimable when claim is made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
          await deposit(); // 10
          await timeTravel(1 * DAY); // wait enough time to redeem batch
          await contracts.butterBatchProcessing.batchRedeem();
          await contracts.butterBatchProcessing.connect(depositor).claim(batchId, depositor.address);
          const batch = await subject(batchId);
          expectValue(batch.claimable, true);
          expectValue(batch.unclaimedShares, parseEther("0"));
          expectValue(batch.claimableTokenBalance, parseEther("0"));
        });
      });
      it("deposits setToken in the current redeemBatch", async function () {
        await contracts.mockSetToken
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        const result = await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
        expect(result)
          .to.emit(contracts.butterBatchProcessing, "Deposit")
          .withArgs(depositor.address, parseEther("100"));
        expect(await contracts.mockSetToken.balanceOf(contracts.butterBatchProcessing.address)).to.equal(
          parseEther("100")
        );
        const currentRedeemBatchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
        const currentBatch = await contracts.butterBatchProcessing.batches(currentRedeemBatchId);
        expect(currentBatch.suppliedTokenBalance).to.equal(parseEther("100"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("100"));
      });
      it("adds the redeemBatch to the users batches", async function () {
        await contracts.mockSetToken
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));

        const currentRedeemBatchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
        expect(await contracts.butterBatchProcessing.accountBatches(depositor.address, 0)).to.equal(
          currentRedeemBatchId
        );
      });
      it("allows multiple deposits", async function () {
        await contracts.mockSetToken
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
        await contracts.mockSetToken
          .connect(depositor1)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor1).depositForRedeem(parseEther("100"));
        await contracts.mockSetToken
          .connect(depositor2)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor2).depositForRedeem(parseEther("50"));
        await contracts.butterBatchProcessing.connect(depositor2).depositForRedeem(parseEther("50"));
        const currentRedeemBatchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
        const currentBatch = await contracts.butterBatchProcessing.batches(currentRedeemBatchId);
        expect(currentBatch.suppliedTokenBalance).to.equal(parseEther("300"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("300"));
        expect(await contracts.butterBatchProcessing.accountBatches(depositor.address, 0)).to.equal(
          currentRedeemBatchId
        );
        expect(await contracts.butterBatchProcessing.accountBatches(depositor1.address, 0)).to.equal(
          currentRedeemBatchId
        );
        expect(await contracts.butterBatchProcessing.accountBatches(depositor2.address, 0)).to.equal(
          currentRedeemBatchId
        );
      });
    });
    context("batch redeeming", function () {
      beforeEach(async function () {
        await contracts.mockSetToken.mint(depositor.address, parseEther("100"));
        await contracts.mockSetToken.mint(depositor1.address, parseEther("100"));
        await contracts.mockSetToken.mint(depositor2.address, parseEther("100"));
        await contracts.mockSetToken.mint(depositor3.address, parseEther("100"));
        await contracts.mockCrvUSDX.mint(contracts.mockYearnVaultUSDX.address, parseEther("20000"));
        await contracts.mockCrvUST.mint(contracts.mockYearnVaultUST.address, parseEther("20000"));
      });

      context("reverts", function () {
        it("reverts when redeeming too early", async function () {
          await contracts.mockSetToken
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("100"));
          await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
          await expect(contracts.butterBatchProcessing.connect(owner).batchRedeem()).to.be.revertedWith(
            "can not execute batch redeem yet"
          );
        });
        it("reverts when slippage too high", async function () {
          await contracts.butterBatchProcessing.connect(owner).setSlippage(7, 1);

          await contracts.mockThreePool.setVirtualPrice(parseEther("1"));

          await contracts.mockSetToken
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("100"));
          await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));

          await timeTravel(1 * DAYS);

          await expect(contracts.butterBatchProcessing.connect(owner).batchRedeem()).to.be.revertedWith(
            "slippage too high"
          );
        });
        it("reverts when called by someone other the keeper", async function () {
          await contracts.mockSetToken
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("100"));
          await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
          await provider.send("evm_increaseTime", [1800]);

          await expect(contracts.butterBatchProcessing.connect(depositor).batchRedeem()).to.be.revertedWith(
            "you dont have the right role"
          );
        });
      });
      context("success", function () {
        it("batch redeems", async function () {
          const batchId = await contracts.butterBatchProcessing.currentRedeemBatchId();

          await contracts.mockSetToken
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("100"));
          await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
          await provider.send("evm_increaseTime", [1800]);

          const result = await contracts.butterBatchProcessing.connect(owner).batchRedeem();
          expect(result)
            .to.emit(contracts.butterBatchProcessing, "BatchRedeemed")
            .withArgs(batchId, parseEther("100"), parseEther("9990"));
          expect(await contracts.mock3Crv.balanceOf(contracts.butterBatchProcessing.address)).to.equal(
            parseEther("9990")
          );
        });
        it("mints early when redeemThreshold is met", async function () {
          await contracts.mockSetToken
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("100"));
          await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
          await contracts.mockSetToken
            .connect(depositor1)
            .approve(contracts.butterBatchProcessing.address, parseEther("100"));
          await contracts.butterBatchProcessing.connect(depositor1).depositForRedeem(parseEther("100"));
          const result = await contracts.butterBatchProcessing.connect(owner).batchRedeem();
          expect(result).to.emit(contracts.butterBatchProcessing, "BatchRedeemed");
        });
        it("advances to the next batch", async function () {
          await contracts.mockSetToken
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("100"));
          await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
          await provider.send("evm_increaseTime", [1800]);

          const previousRedeemBatchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
          await contracts.butterBatchProcessing.batchRedeem();

          const previousBatch = await contracts.butterBatchProcessing.batches(previousRedeemBatchId);
          expect(previousBatch.claimable).to.equal(true);

          const currentRedeemBatchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
          expect(currentRedeemBatchId).to.not.equal(previousRedeemBatchId);
        });
      });
    });
    context("claiming", function () {
      beforeEach(async function () {
        await contracts.mockSetToken
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
        await contracts.mockSetToken
          .connect(depositor1)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor1).depositForRedeem(parseEther("100"));
        await contracts.mockSetToken
          .connect(depositor2)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor2).depositForRedeem(parseEther("100"));
        await contracts.mockSetToken
          .connect(depositor3)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor3).depositForRedeem(parseEther("100"));
        await contracts.mockCrvUSDX.mint(contracts.mockYearnVaultUSDX.address, parseEther("20000"));
        await contracts.mockCrvUST.mint(contracts.mockYearnVaultUST.address, parseEther("20000"));
      });
      it("reverts when batch is not yet claimable", async function () {
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        await expect(contracts.butterBatchProcessing.claim(batchId, depositor.address)).to.be.revertedWith(
          "not yet claimable"
        );
      });
      it("claim batch successfully", async function () {
        await provider.send("evm_increaseTime", [1800]);
        await contracts.butterBatchProcessing.connect(owner).batchRedeem();
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        expect(await contracts.butterBatchProcessing.connect(depositor).claim(batchId, depositor.address))
          .to.emit(contracts.butterBatchProcessing, "Claimed")
          .withArgs(depositor.address, BatchType.Redeem, parseEther("100"), parseEther("9990"));
        expect(await contracts.mock3Crv.balanceOf(depositor.address)).to.equal(parseEther("109990"));
        const batch = await contracts.butterBatchProcessing.batches(batchId);
        expect(batch.unclaimedShares).to.equal(parseEther("300"));
      });
    });
  });
  context("withdrawing from batch", function () {
    describe("batch struct", () => {
      const withdraw = async (batchId: string, amount?: BigNumber) => {
        return contracts.butterBatchProcessing
          .connect(depositor)
          .withdrawFromBatch(batchId, amount ? amount : parseEther("10"), depositor.address);
      };
      const subject = async (batchId) => {
        const adapter = new ButterBatchProcessingAdapter(contracts.butterBatchProcessing);
        const batch = await adapter.getBatch(batchId);
        return batch;
      };
      context("redeem batch withdrawal", () => {
        beforeEach(async function () {
          await contracts.mockSetToken.mint(depositor.address, parseEther("100"));
          await contracts.mockSetToken.mint(depositor1.address, parseEther("100"));
          await contracts.mockSetToken.mint(depositor2.address, parseEther("100"));
          await contracts.mockSetToken.mint(depositor3.address, parseEther("100"));
          await contracts.mockYearnVaultUSDX.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
          await contracts.mockYearnVaultUST.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
          await contracts.mockSetToken
            .connect(depositor)
            .increaseAllowance(contracts.butterBatchProcessing.address, parseEther("10000000000"));
          await contracts.mockSetToken.connect(owner).mint(depositor.address, parseEther("100"));
          await contracts.mockSetToken
            .connect(depositor)
            .approve(contracts.butterBatchProcessing.address, parseEther("100"));
          await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
          await contracts.mockCrvUSDX.mint(contracts.mockYearnVaultUSDX.address, parseEther("20000"));
          await contracts.mockCrvUST.mint(contracts.mockYearnVaultUST.address, parseEther("20000"));
        });

        it("decrements suppliedTokenBalance and unclaimedShares when a withdrawal is made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
          const batchBefore = await subject(batchId);
          await withdraw(batchId);
          const batchAfter = await subject(batchId);
          expect(batchAfter.suppliedTokenBalance.lt(batchBefore.suppliedTokenBalance)).to.be.true;
          expect(batchAfter.unclaimedShares.lt(batchBefore.unclaimedShares)).to.be.true;
        });
        it("decrements suppliedTokenBalance and unclaimedShares when multiple deposits are made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
          const batchBefore = await subject(batchId);
          await withdraw(batchId, parseEther("10"));
          await withdraw(batchId, parseEther("10"));
          await withdraw(batchId, parseEther("10"));
          const batchAfter = await subject(batchId);
          expect(batchBefore.suppliedTokenBalance.sub(parseEther("30"))).to.equal(batchAfter.suppliedTokenBalance);
          expect(batchBefore.unclaimedShares.sub(parseEther("30"))).to.equal(batchAfter.unclaimedShares);
        });
        it("transfers set token to depositor after withdraw", async function () {
          const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
          await contracts.butterBatchProcessing
            .connect(depositor)
            .withdrawFromBatch(batchId, parseEther("100"), depositor.address);
          expect(await contracts.mockSetToken.balanceOf(depositor.address)).to.equal(parseEther("200"));
        });
        it("reverts when the batch was already redeemed", async function () {
          const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
          await timeTravel(1 * DAY);
          await contracts.butterBatchProcessing.batchRedeem();
          await expect(withdraw(batchId)).to.be.revertedWith("already processed");
        });
      });
      context("mint batch withdrawal", () => {
        beforeEach(async function () {
          await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("100"), depositor.address);
        });
        it("decrements suppliedTokenBalance and unclaimedShares when a withdrawal is made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          const batchBefore = await subject(batchId);
          await withdraw(batchId, parseEther("10"));
          const batchAfter = await subject(batchId);
          expect(batchAfter.suppliedTokenBalance.lt(batchBefore.suppliedTokenBalance)).to.be.true;
          expect(batchAfter.unclaimedShares.lt(batchBefore.unclaimedShares)).to.be.true;
        });
        it("decrements suppliedTokenBalance and unclaimedShares when multiple deposits are made", async () => {
          const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
          const batchBefore = await subject(batchId);
          await withdraw(batchId, parseEther("10"));
          await withdraw(batchId, parseEther("10"));
          await withdraw(batchId, parseEther("10"));
          const batchAfter = await subject(batchId);
          expect(batchBefore.suppliedTokenBalance.sub(parseEther("30"))).to.equal(batchAfter.suppliedTokenBalance);
          expect(batchBefore.unclaimedShares.sub(parseEther("30"))).to.equal(batchAfter.unclaimedShares);
        });
        it("emits an event when withdrawn", async function () {
          const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
          expect(await withdraw(batchId, parseEther("100")))
            .to.emit(contracts.butterBatchProcessing, "WithdrawnFromBatch")
            .withArgs(batchId, parseEther("100"), depositor.address);
        });
        it("transfers 3crv to depositor after withdraw", async function () {
          const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
          const balanceBefore = await contracts.mock3Crv.balanceOf(depositor.address);
          await contracts.butterBatchProcessing
            .connect(depositor)
            .withdrawFromBatch(batchId, parseEther("100"), depositor.address);
          const balanceAfter = await contracts.mock3Crv.balanceOf(depositor.address);
          expect(balanceAfter.sub(balanceBefore)).to.equal(parseEther("100"));
        });
        it("reverts when the batch was already minted", async function () {
          const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
          await timeTravel(1 * DAY);
          await contracts.butterBatchProcessing.batchMint();
          await expect(withdraw(batchId)).to.be.revertedWith("already processed");
        });
      });
    });
  });
  context("moveUnclaimedDepositsIntoCurrentBatch", function () {
    context("error", function () {
      it("reverts when length of batchIds and shares are not matching", async function () {
        await expect(
          contracts.butterBatchProcessing
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch(
              new Array(2).fill("0xa15f699e141c27ed0edace41ff8fa7b836e3ddb658b25c811a1674e9c7a75c5c"),
              new Array(3).fill(parseEther("10")),
              BatchType.Mint
            )
        ).to.be.revertedWith("array lengths must match");
      });
      it("reverts if given a batch that is not from the correct batchType", async function () {
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("10000"), depositor.address);

        await provider.send("evm_increaseTime", [1800]);
        await provider.send("evm_mine", []);
        await contracts.butterBatchProcessing.connect(owner).batchMint();
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        await expect(
          contracts.butterBatchProcessing.moveUnclaimedDepositsIntoCurrentBatch(
            [batchId],
            [parseEther("10000")],
            BatchType.Redeem
          )
        ).to.be.revertedWith("incorrect batchType");
      });
      it("reverts on an unclaimable batch", async function () {
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("10000"), depositor.address);
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        await expect(
          contracts.butterBatchProcessing.moveUnclaimedDepositsIntoCurrentBatch(
            [batchId],
            [parseEther("10000")],
            BatchType.Mint
          )
        ).to.be.revertedWith("has not yet been processed");
      });
      it("reverts if the user has insufficient funds", async function () {
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("10000"), depositor.address);
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        await provider.send("evm_increaseTime", [2500]);
        await provider.send("evm_mine", []);
        await contracts.butterBatchProcessing.batchMint();
        await expect(
          contracts.butterBatchProcessing.moveUnclaimedDepositsIntoCurrentBatch(
            [batchId],
            [parseEther("20000")],
            BatchType.Mint
          )
        ).to.be.revertedWith("not enough funds");
      });
    });
    context("success", function () {
      it("moves hysi into current redeemBatch", async function () {
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("10000"), depositor.address);
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        await provider.send("evm_increaseTime", [1800]);
        await provider.send("evm_mine", []);
        await contracts.butterBatchProcessing.connect(owner).batchMint();
        const mintedHYSI = await contracts.mockSetToken.balanceOf(contracts.butterBatchProcessing.address);
        expect(
          await contracts.butterBatchProcessing
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch([batchId], [parseEther("10000")], BatchType.Mint)
        )
          .to.emit(contracts.butterBatchProcessing, "MovedUnclaimedDepositsIntoCurrentBatch")
          .withArgs(mintedHYSI, BatchType.Mint, depositor.address);
        const currentRedeemBatchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
        const redeemBatch = await contracts.butterBatchProcessing.batches(currentRedeemBatchId);
        expect(redeemBatch.suppliedTokenBalance).to.be.equal(mintedHYSI);
      });
      it("moves 3crv into current mintBatch", async function () {
        await contracts.mockSetToken.mint(depositor.address, parseEther("100"));
        await contracts.mockCrvUSDX.mint(contracts.mockYearnVaultUSDX.address, parseEther("20000"));
        await contracts.mockCrvUST.mint(contracts.mockYearnVaultUST.address, parseEther("20000"));
        await contracts.mockYearnVaultUSDX.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
        await contracts.mockYearnVaultUST.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
        await contracts.mockSetToken
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("100"));
        await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        await provider.send("evm_increaseTime", [1800]);
        await provider.send("evm_mine", []);
        await contracts.butterBatchProcessing.connect(owner).batchRedeem();
        const redeemed3CRV = await contracts.mock3Crv.balanceOf(contracts.butterBatchProcessing.address);
        expect(
          await contracts.butterBatchProcessing
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch([batchId], [parseEther("100")], BatchType.Redeem)
        )
          .to.emit(contracts.butterBatchProcessing, "MovedUnclaimedDepositsIntoCurrentBatch")
          .withArgs(redeemed3CRV, BatchType.Redeem, depositor.address);
        const currentMintBatchId = await contracts.butterBatchProcessing.currentMintBatchId();
        const redeemBatch = await contracts.butterBatchProcessing.batches(currentMintBatchId);
        expect(redeemBatch.suppliedTokenBalance).to.be.equal(redeemed3CRV);
      });
      it("moves only parts of the funds in a batch", async function () {
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
        await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("10000"), depositor.address);
        const batchId = await contracts.butterBatchProcessing.accountBatches(depositor.address, 0);
        await provider.send("evm_increaseTime", [1800]);
        await provider.send("evm_mine", []);
        await contracts.butterBatchProcessing.connect(owner).batchMint();
        const mintedHYSI = await contracts.mockSetToken.balanceOf(contracts.butterBatchProcessing.address);
        await expect(
          await contracts.butterBatchProcessing
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch([batchId], [parseEther("5000")], BatchType.Mint)
        )
          .to.emit(contracts.butterBatchProcessing, "MovedUnclaimedDepositsIntoCurrentBatch")
          .withArgs(mintedHYSI.div(2), BatchType.Mint, depositor.address);
        const currentRedeemBatchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
        const redeemBatch = await contracts.butterBatchProcessing.batches(currentRedeemBatchId);
        expect(redeemBatch.suppliedTokenBalance).to.be.equal(mintedHYSI.div(2));
        const mintBatch = await contracts.butterBatchProcessing.batches(batchId);
        expect(mintBatch.claimableTokenBalance).to.be.equal(mintedHYSI.div(2));
      });
      it("moves funds from up to 20 batches", async function () {
        await contracts.mockCrvUSDX.mint(contracts.mockYearnVaultUSDX.address, parseEther("100000"));
        await contracts.mockCrvUST.mint(contracts.mockYearnVaultUST.address, parseEther("100000"));
        await contracts.mockYearnVaultUSDX.mint(contracts.mockBasicIssuanceModule.address, parseEther("100000"));
        await contracts.mockYearnVaultUST.mint(contracts.mockBasicIssuanceModule.address, parseEther("100000"));

        await contracts.mock3Crv.mint(depositor.address, parseEther("2000"));
        await contracts.mock3Crv
          .connect(depositor)
          .approve(contracts.butterBatchProcessing.address, parseEther("2000"));
        await bluebird.map(
          new Array(20).fill(0),
          async (i) => {
            await contracts.butterBatchProcessing
              .connect(depositor)
              .depositForMint(parseEther("100"), depositor.address);
            await provider.send("evm_increaseTime", [1800]);
            await provider.send("evm_mine", []);
            await contracts.butterBatchProcessing.connect(owner).batchMint();
          },
          { concurrency: 1 }
        );
        const batchIds = await contracts.butterBatchProcessing.getAccountBatches(depositor.address);
        const mintedHYSI = await contracts.mockSetToken.balanceOf(contracts.butterBatchProcessing.address);
        expect(
          await contracts.butterBatchProcessing
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch(batchIds, new Array(20).fill(parseEther("100")), BatchType.Mint)
        )
          .to.emit(contracts.butterBatchProcessing, "MovedUnclaimedDepositsIntoCurrentBatch")
          .withArgs(mintedHYSI, BatchType.Mint, depositor.address);
        const currentRedeemBatchId = await contracts.butterBatchProcessing.currentRedeemBatchId();
        const redeemBatch = await contracts.butterBatchProcessing.batches(currentRedeemBatchId);
        expect(redeemBatch.suppliedTokenBalance).to.be.equal(mintedHYSI);
      });
    });
  });
  context("paused", function () {
    let claimableMintId;
    let claimableRedeemId;
    let currentMintId;
    let currentRedeemId;

    beforeEach(async function () {
      //Prepare MintBatches
      claimableMintId = await contracts.butterBatchProcessing.currentMintBatchId();
      await contracts.butterBatchProcessing.connect(owner).setProcessingThreshold(1800, parseEther("20000"), 0);
      await contracts.mock3Crv.mint(depositor.address, parseEther("40000"));
      await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("20000"), depositor.address);
      await contracts.butterBatchProcessing.connect(owner).batchMint();
      currentMintId = await contracts.butterBatchProcessing.currentMintBatchId();
      await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("20000"), depositor.address);

      //Prepare RedeemBatches
      await contracts.mockYearnVaultUSDX.mint(contracts.mockBasicIssuanceModule.address, parseEther("200000"));
      await contracts.mockYearnVaultUST.mint(contracts.mockBasicIssuanceModule.address, parseEther("200000"));
      await contracts.mockSetToken.mint(depositor.address, parseEther("400"));
      await contracts.mockSetToken
        .connect(depositor)
        .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
      claimableRedeemId = await contracts.butterBatchProcessing.currentRedeemBatchId();
      await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));
      await contracts.butterBatchProcessing.connect(owner).batchRedeem();
      currentRedeemId = await contracts.butterBatchProcessing.currentRedeemBatchId();
      await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("100"));

      //Pause Contract
      await contracts.butterBatchProcessing.connect(owner).pause();
    });
    it("prevents deposit for mint", async function () {
      await expectRevert(
        contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("1"), depositor.address),
        "Pausable: paused"
      );
    });
    it("prevents deposit for redeem", async function () {
      await expectRevert(
        contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("1")),
        "Pausable: paused"
      );
    });
    it("prevents mint", async function () {
      await expectRevert(contracts.butterBatchProcessing.connect(owner).batchMint(), "Pausable: paused");
    });
    it("prevents redeem", async function () {
      await expectRevert(contracts.butterBatchProcessing.connect(owner).batchRedeem(), "Pausable: paused");
    });
    it("prevents to move unclaimed deposits into the current batch", async function () {
      const batchId = await contracts.butterBatchProcessing.currentMintBatchId();
      await expectRevert(
        contracts.butterBatchProcessing
          .connect(depositor)
          .moveUnclaimedDepositsIntoCurrentBatch([batchId], [parseEther("1")], BatchType.Mint),
        "Pausable: paused"
      );
    });
    it("still allows to withdraw from mint batch", async function () {
      await expect(
        contracts.butterBatchProcessing
          .connect(depositor)
          .withdrawFromBatch(currentMintId, parseEther("10"), depositor.address)
      )
        .to.emit(contracts.butterBatchProcessing, "WithdrawnFromBatch")
        .withArgs(currentMintId, parseEther("10"), depositor.address);
    });
    it("still allows to withdraw from redeem batch", async function () {
      await expect(
        contracts.butterBatchProcessing
          .connect(depositor)
          .withdrawFromBatch(currentRedeemId, parseEther("1"), depositor.address)
      )
        .to.emit(contracts.butterBatchProcessing, "WithdrawnFromBatch")
        .withArgs(currentRedeemId, parseEther("1"), depositor.address);
    });
    it("still allows to claim minted butter", async function () {
      await expect(contracts.butterBatchProcessing.connect(depositor).claim(claimableMintId, depositor.address))
        .to.emit(contracts.butterBatchProcessing, "Claimed")
        .withArgs(depositor.address, BatchType.Mint, parseEther("20000"), parseEther("200"));
    });
    it("still allows to claim redemeed 3crv", async function () {
      await expect(contracts.butterBatchProcessing.connect(depositor).claim(claimableRedeemId, depositor.address))
        .to.emit(contracts.butterBatchProcessing, "Claimed")
        .withArgs(depositor.address, BatchType.Redeem, parseEther("100"), parseEther("475.714285714285714286"));
    });
    it("allows deposits for minting after unpausing", async function () {
      await contracts.butterBatchProcessing.unpause();

      await expect(
        contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("1"), depositor.address)
      )
        .to.emit(contracts.butterBatchProcessing, "Deposit")
        .withArgs(depositor.address, parseEther("1"));
    });
    it("allows deposits for redeeming after unpausing", async function () {
      await contracts.butterBatchProcessing.unpause();

      await expect(contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("1")))
        .to.emit(contracts.butterBatchProcessing, "Deposit")
        .withArgs(depositor.address, parseEther("1"));
    });
  });
  describe("redemption fee", () => {
    context("sets RedemptionFee", () => {
      it("sets a redemptionRate when called with DAO role", async () => {
        expect(await contracts.butterBatchProcessing.setRedemptionFee(100, owner.address))
          .to.emit(contracts.butterBatchProcessing, "RedemptionFeeUpdated")
          .withArgs(100, owner.address);
        const redemptionFee = await contracts.butterBatchProcessing.redemptionFee();
        expect(redemptionFee[1]).to.equal(100);
        expect(redemptionFee[2]).to.equal(owner.address);
      });
      it("reverts when setting redemptionRate without DAO role", async () => {
        await expectRevert(
          contracts.butterBatchProcessing.connect(depositor).setRedemptionFee(100, owner.address),
          "you dont have the right role"
        );
      });
      it("reverts when setting a feeRate higher than 1%", async () => {
        await expectRevert(contracts.butterBatchProcessing.setRedemptionFee(1000, owner.address), "dont get greedy");
      });
    });
    context("with redemption fee", () => {
      let batchId;
      const depositAmount = parseEther("100");
      const feeRate = 100;
      beforeEach(async () => {
        await contracts.butterBatchProcessing.setRedemptionFee(feeRate, owner.address);
        await contracts.mockSetToken.mint(depositor.address, depositAmount);
        await contracts.mockSetToken.connect(depositor).approve(contracts.butterBatchProcessing.address, depositAmount);
        await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(depositAmount);
        await contracts.mockYearnVaultUSDX.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
        await contracts.mockYearnVaultUST.mint(contracts.mockBasicIssuanceModule.address, parseEther("20000"));
        await contracts.mockCrvUSDX.mint(contracts.mockYearnVaultUSDX.address, parseEther("20000"));
        await contracts.mockCrvUST.mint(contracts.mockYearnVaultUST.address, parseEther("20000"));
        await provider.send("evm_increaseTime", [1800]);
        await provider.send("evm_mine", []);
        batchId = contracts.butterBatchProcessing.currentRedeemBatchId();
        await contracts.butterBatchProcessing.connect(owner).batchRedeem();
      });
      it("takes the fee", async () => {
        const accountBalance = await contracts.butterBatchProcessing.accountBalances(batchId, depositor.address);
        const batch = await contracts.butterBatchProcessing.batches(batchId);
        const claimAmountWithoutFee = batch.claimableTokenBalance.mul(accountBalance).div(batch.unclaimedShares);
        const fee = claimAmountWithoutFee.mul(feeRate).div(10000);
        const oldBal = await contracts.mock3Crv.balanceOf(depositor.address);

        expect(await contracts.butterBatchProcessing.connect(depositor).claim(batchId, depositor.address))
          .to.emit(contracts.butterBatchProcessing, "Claimed")
          .withArgs(depositor.address, BatchType.Redeem, depositAmount, claimAmountWithoutFee.sub(fee));

        const newBal = await contracts.mock3Crv.balanceOf(depositor.address);
        expect(newBal).to.equal(oldBal.add(claimAmountWithoutFee.sub(fee)));
        const redemptionFee = await contracts.butterBatchProcessing.redemptionFee();
        expect(redemptionFee[0]).to.equal(fee);
      });
      describe("sweethearts", () => {
        it("sets a sweetheart when called with DAO role", async () => {
          expect(await contracts.butterBatchProcessing.updateSweetheart(depositor.address, true))
            .to.emit(contracts.butterBatchProcessing, "SweetheartUpdated")
            .withArgs(depositor.address, true);
          expect(await contracts.butterBatchProcessing.sweethearts(depositor.address)).to.equal(true);
        });
        it("removes a sweetheart when called with DAO role", async () => {
          await contracts.butterBatchProcessing.updateSweetheart(depositor.address, true);
          expect(await contracts.butterBatchProcessing.updateSweetheart(depositor.address, false))
            .to.emit(contracts.butterBatchProcessing, "SweetheartUpdated")
            .withArgs(depositor.address, false);
          expect(await contracts.butterBatchProcessing.sweethearts(depositor.address)).to.equal(false);
        });
        it("reverts when trying to set a sweetheart without DAO role", async () => {
          expect(await contracts.butterBatchProcessing.updateSweetheart(depositor.address, true))
            .to.emit(contracts.butterBatchProcessing, "SweetheartUpdated")
            .withArgs(depositor.address, true);
          expect(await contracts.butterBatchProcessing.sweethearts(depositor.address)).to.equal(true);
        });
        it("doesnt apply the redemption fee as a sweetheart", async () => {
          await contracts.butterBatchProcessing.updateSweetheart(depositor.address, true);
          const accountBalance = await contracts.butterBatchProcessing.accountBalances(batchId, depositor.address);
          const batch = await contracts.butterBatchProcessing.batches(batchId);
          const claimAmount = batch.claimableTokenBalance.mul(accountBalance).div(batch.unclaimedShares);
          const oldBal = await contracts.mock3Crv.balanceOf(depositor.address);

          expect(await contracts.butterBatchProcessing.connect(depositor).claim(batchId, depositor.address))
            .to.emit(contracts.butterBatchProcessing, "Claimed")
            .withArgs(depositor.address, BatchType.Redeem, depositAmount, claimAmount);

          const newBal = await contracts.mock3Crv.balanceOf(depositor.address);
          expect(newBal).to.equal(oldBal.add(claimAmount));
          const redemptionFee = await contracts.butterBatchProcessing.redemptionFee();
          expect(redemptionFee[0]).to.equal(BigNumber.from("0"));
        });
      });
    });
  });
  describe("recover yToken leftover", function () {
    it("sends leftovers to the treasury", async () => {
      //Preparation
      await contracts.contractRegistry.addContract(ethers.utils.id("Treasury"), treasury.address, ethers.utils.id("1"));
      await contracts.mockYearnVaultUSDX.mint(contracts.butterBatchProcessing.address, parseEther("200"));

      //Actual Test
      await contracts.butterBatchProcessing.recoverLeftover(contracts.mockYearnVaultUSDX.address, parseEther("100"));
      expectValue(
        await contracts.mockYearnVaultUSDX.balanceOf(contracts.butterBatchProcessing.address),
        parseEther("100")
      );
      expectValue(await contracts.mockYearnVaultUSDX.balanceOf(treasury.address), parseEther("100"));
    });
    it("reverts if there is no balance of the specific yToken", async () => {
      //Preparation
      await contracts.contractRegistry.addContract(ethers.utils.id("Treasury"), treasury.address, ethers.utils.id("1"));
      //Actual Test
      await expectRevert(
        contracts.butterBatchProcessing.recoverLeftover(treasury.address, parseEther("100")),
        "yToken doesnt exist"
      );
    });
    it("reverts if the balance of the yToken is too low", async () => {
      //Preparation
      await contracts.contractRegistry.addContract(ethers.utils.id("Treasury"), treasury.address, ethers.utils.id("1"));
      //Actual Test
      await expectRevert(
        contracts.butterBatchProcessing.recoverLeftover(contracts.mockYearnVaultUSDX.address, parseEther("100")),
        "ERC20: transfer amount exceeds balance"
      );
    });
  });
});
