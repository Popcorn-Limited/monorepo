import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BatchType } from "@popcorn/utils/src/types";
import { expect } from "chai";
import { utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";
import { BUTTER_ZAPPER, DAO_ROLE, INCENTIVE_MANAGER_ROLE, KEEPER_ROLE } from "../lib/acl/roles";
import { expectRevert } from "../lib/utils/expectValue";
import { timeTravel } from "../lib/utils/test";
import { KeeperIncentiveV2, MockERC20, RewardsEscrow } from "../typechain";
import { ButterBatchProcessing } from "../typechain/ButterBatchProcessing";
import { ButterBatchProcessingZapper } from "../typechain/ButterBatchProcessingZapper";
import { MockBasicIssuanceModule } from "../typechain/MockBasicIssuanceModule";
import { MockCurveMetapool } from "../typechain/MockCurveMetapool";
import { MockCurveThreepool } from "../typechain/MockCurveThreepool";
import { MockYearnV2Vault } from "../typechain/MockYearnV2Vault";

const provider = waffle.provider;

interface Contracts {
  mock3Crv: MockERC20;
  mockDAI: MockERC20;
  mockUSDC: MockERC20;
  mockUSDT: MockERC20;
  mockCrvUSDX: MockERC20;
  mockCrvUST: MockERC20;
  mockSetToken: MockERC20;
  mockYearnVaultUSDX: MockYearnV2Vault;
  mockYearnVaultUST: MockYearnV2Vault;
  mockCurveMetapoolUSDX: MockCurveMetapool;
  mockCurveMetapoolUST: MockCurveMetapool;
  mockCurveThreePool: MockCurveThreepool;
  mockBasicIssuanceModule: MockBasicIssuanceModule;
  keeperIncentive: KeeperIncentiveV2;
  butterBatchProcessing: ButterBatchProcessing;
  butterBatchProcessingZapper: ButterBatchProcessingZapper;
}

const DAY = 60 * 60 * 24;

const DepositorInitial = parseEther("100");
let owner: SignerWithAddress, depositor: SignerWithAddress;
let contracts: Contracts;

async function deployContracts(): Promise<Contracts> {
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockPop = await (await MockERC20.deploy("POP", "POP", 18)).deployed();
  const mock3Crv = await (await MockERC20.deploy("3Crv", "3Crv", 18)).deployed();
  const mockDAI = await (await MockERC20.deploy("DAI", "DAI", 18)).deployed();
  const mockUSDC = await (await MockERC20.deploy("USDC", "USDC", 18)).deployed();
  const mockUSDT = await (await MockERC20.deploy("USDT", "USDT", 18)).deployed();

  const mockBasicCoin = await (await MockERC20.deploy("Basic", "Basic", 18)).deployed();

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

  const MockCurveThreepool = await ethers.getContractFactory("MockCurveThreepool");
  const mockCurveThreePool = (await (
    await MockCurveThreepool.deploy(mock3Crv.address, mockDAI.address, mockUSDC.address, mockUSDT.address)
  ).deployed()) as MockCurveThreepool;

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

  const staking = await (
    await (await ethers.getContractFactory("PopLocker")).deploy(mockPop.address, mockPop.address)
  ).deployed();

  const rewardsEscrow = (await (
    await (await ethers.getContractFactory("RewardsEscrow")).deploy(mockPop.address)
  ).deployed()) as RewardsEscrow;

  const butterStaking = await (
    await (
      await ethers.getContractFactory("Staking")
    ).deploy(mockPop.address, mockSetToken.address, rewardsEscrow.address)
  ).deployed();

  const butterBatchProcessing = (await (
    await (
      await ethers.getContractFactory("ButterBatchProcessing")
    ).deploy(
      contractRegistry.address,
      butterStaking.address,
      mockSetToken.address,
      mock3Crv.address,
      mockCurveThreePool.address,
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

  await butterBatchProcessing.connect(owner).setSlippage(100, 100);
  await butterBatchProcessing.setApprovals();

  const butterBatchProcessingZapper = (await (
    await (
      await ethers.getContractFactory("ButterBatchProcessingZapper")
    ).deploy(contractRegistry.address, mockCurveThreePool.address, mock3Crv.address)
  ).deployed()) as ButterBatchProcessingZapper;

  await mockYearnVaultUSDX.mint(mockBasicIssuanceModule.address, parseEther("20000"));
  await mockYearnVaultUST.mint(mockBasicIssuanceModule.address, parseEther("20000"));
  await mockCrvUSDX.mint(mockYearnVaultUSDX.address, parseEther("20000"));
  await mockCrvUST.mint(mockYearnVaultUST.address, parseEther("20000"));

  await mockDAI.mint(depositor.address, DepositorInitial);
  await mockDAI.connect(depositor).approve(butterBatchProcessingZapper.address, DepositorInitial);

  await mockUSDC.mint(depositor.address, DepositorInitial);
  await mockUSDC.connect(depositor).approve(butterBatchProcessingZapper.address, DepositorInitial);

  await mockSetToken.mint(depositor.address, DepositorInitial);
  await mockSetToken.connect(depositor).approve(butterBatchProcessing.address, DepositorInitial);

  await aclRegistry.grantRole(BUTTER_ZAPPER, butterBatchProcessingZapper.address);

  await contractRegistry.connect(owner).addContract(ethers.utils.id("POP"), mockPop.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("KeeperIncentive"), keeperIncentive.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("ButterBatchProcessing"), butterBatchProcessing.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("PopLocker"), staking.address, ethers.utils.id("1"));

  await keeperIncentive
    .connect(owner)
    .createIncentive(butterBatchProcessing.address, 0, true, false, mockPop.address, 1, 0);
  await keeperIncentive
    .connect(owner)
    .createIncentive(butterBatchProcessing.address, 0, true, false, mockPop.address, 1, 0);

  await butterBatchProcessingZapper.setApprovals();
  await aclRegistry.grantRole(ethers.utils.id("ApprovedContract"), butterBatchProcessingZapper.address);

  return {
    mock3Crv,
    mockDAI,
    mockUSDC,
    mockUSDT,
    mockCrvUSDX,
    mockCrvUST,
    mockSetToken,
    mockYearnVaultUSDX,
    mockYearnVaultUST,
    mockCurveMetapoolUSDX,
    mockCurveMetapoolUST,
    mockCurveThreePool,
    mockBasicIssuanceModule,
    keeperIncentive,
    butterBatchProcessing,
    butterBatchProcessingZapper,
  };
}

const deployAndAssignContracts = async () => {
  [owner, depositor] = await ethers.getSigners();
  contracts = await deployContracts();
  await contracts.mock3Crv.connect(depositor).approve(contracts.butterBatchProcessing.address, parseEther("100000000"));
};

describe("ButterBatchProcessingZapper", function () {
  beforeEach(async function () {
    await deployAndAssignContracts();
  });
  describe("setApprovals", async () => {
    it("sets approvals idempotently", async () => {
      //  run setApproval multiple times to assert idempotency
      await contracts.butterBatchProcessingZapper.setApprovals();
      await contracts.butterBatchProcessingZapper.setApprovals();
      await contracts.butterBatchProcessingZapper.setApprovals();

      const dai3PoolAllowance = await contracts.mockDAI.allowance(
        contracts.butterBatchProcessingZapper.address,
        contracts.mockCurveThreePool.address
      );
      const usdc3PoolAllowance = await contracts.mockUSDC.allowance(
        contracts.butterBatchProcessingZapper.address,
        contracts.mockCurveThreePool.address
      );
      const usdt3PoolAllowance = await contracts.mockUSDT.allowance(
        contracts.butterBatchProcessingZapper.address,
        contracts.mockCurveThreePool.address
      );

      const threeCrvButterBatchAllowance = await contracts.mock3Crv.allowance(
        contracts.butterBatchProcessingZapper.address,
        contracts.butterBatchProcessing.address
      );

      expect(dai3PoolAllowance).to.equal(ethers.constants.MaxUint256);
      expect(usdc3PoolAllowance).to.equal(ethers.constants.MaxUint256);
      expect(usdt3PoolAllowance).to.equal(ethers.constants.MaxUint256);
      expect(threeCrvButterBatchAllowance).to.equal(ethers.constants.MaxUint256);
    });
  });
  describe("zapIntoBatch", function () {
    it("zaps into a mint queue with one stablecoin", async function () {
      const result = await contracts.butterBatchProcessingZapper
        .connect(depositor)
        .zapIntoBatch([DepositorInitial, 0, 0], 0);

      expect(result)
        .to.emit(contracts.butterBatchProcessingZapper, "ZappedIntoBatch")
        .withArgs(DepositorInitial, depositor.address);

      expect(result).to.emit(contracts.butterBatchProcessing, "Deposit").withArgs(depositor.address, DepositorInitial);

      expect(await contracts.mockDAI.balanceOf(depositor.address)).to.equal(0);
    });

    it("zaps into a mint queue with multiple stablecoins", async function () {
      const result = await contracts.butterBatchProcessingZapper
        .connect(depositor)
        .zapIntoBatch([DepositorInitial, DepositorInitial, 0], 0);

      expect(result)
        .to.emit(contracts.butterBatchProcessingZapper, "ZappedIntoBatch")
        .withArgs(DepositorInitial.mul(2), depositor.address);

      expect(result)
        .to.emit(contracts.butterBatchProcessing, "Deposit")
        .withArgs(depositor.address, DepositorInitial.mul(2));

      expect(await contracts.mockDAI.balanceOf(depositor.address)).to.equal(0);
      expect(await contracts.mockUSDC.balanceOf(depositor.address)).to.equal(0);
    });
  });
  describe("zapOutOfBatch", function () {
    it("zaps out of the queue into a stablecoin", async function () {
      const expectedStableAmount = parseEther("99.9");
      //Create Batch
      await contracts.butterBatchProcessingZapper.connect(depositor).zapIntoBatch([DepositorInitial, 0, 0], 0);
      const [batchId] = await contracts.butterBatchProcessing.getAccountBatches(depositor.address);
      //Actual Test
      const result = await contracts.butterBatchProcessingZapper
        .connect(depositor)
        .zapOutOfBatch(batchId, DepositorInitial, 0, 0);

      expect(result)
        .to.emit(contracts.butterBatchProcessingZapper, "ZappedOutOfBatch")
        .withArgs(batchId, 0, DepositorInitial, expectedStableAmount, depositor.address);

      expect(result)
        .to.emit(contracts.butterBatchProcessing, "WithdrawnFromBatch")
        .withArgs(batchId, DepositorInitial, depositor.address);

      expect(await contracts.mockDAI.balanceOf(depositor.address)).to.equal(expectedStableAmount);
    });
  });
  describe("claimAndSwapToStable", function () {
    it("reverts when claiming a mint batch", async function () {
      await contracts.butterBatchProcessingZapper.connect(depositor).zapIntoBatch([DepositorInitial, 0, 0], 0);
      const [batchId] = await contracts.butterBatchProcessing.getAccountBatches(depositor.address);
      await timeTravel(1800);
      await contracts.butterBatchProcessing.connect(owner).batchMint();

      await expect(
        contracts.butterBatchProcessingZapper.claimAndSwapToStable(batchId, 0, parseEther("1"))
      ).to.be.revertedWith("needs to return 3crv");
    });
    it("claims batch and swaps into stablecoin", async function () {
      const claimableAmount = parseEther("999");
      const expectedStableAmount = parseEther("998.001");
      //Create Batch
      await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("10"));
      const [batchId] = await contracts.butterBatchProcessing.getAccountBatches(depositor.address);
      await timeTravel(1800);
      await contracts.butterBatchProcessing.connect(owner).batchRedeem();

      //Actual Test
      const result = await contracts.butterBatchProcessingZapper.connect(depositor).claimAndSwapToStable(batchId, 0, 0);

      expect(result)
        .to.emit(contracts.butterBatchProcessingZapper, "ClaimedIntoStable")
        .withArgs(batchId, 0, claimableAmount, expectedStableAmount, depositor.address);

      expect(result)
        .to.emit(contracts.butterBatchProcessing, "Claimed")
        .withArgs(contracts.butterBatchProcessingZapper.address, BatchType.Redeem, parseEther("10"), claimableAmount);

      expect(await contracts.mockDAI.balanceOf(depositor.address)).to.equal(expectedStableAmount.add(DepositorInitial));
    });
  });
  describe("ButterBatchProcessing is paused", function () {
    let currentMintId;
    let claimableRedeemId;

    beforeEach(async function () {
      //Prepare MintBatches
      currentMintId = await contracts.butterBatchProcessing.currentMintBatchId();
      await contracts.mock3Crv.mint(depositor.address, parseEther("40000"));
      await contracts.butterBatchProcessing.connect(depositor).depositForMint(parseEther("20000"), depositor.address);

      await contracts.mockSetToken.mint(depositor.address, parseEther("400"));
      await contracts.mockSetToken
        .connect(depositor)
        .approve(contracts.butterBatchProcessing.address, parseEther("10000"));
      claimableRedeemId = await contracts.butterBatchProcessing.currentRedeemBatchId();
      await contracts.butterBatchProcessing.connect(depositor).depositForRedeem(parseEther("200"));
      await contracts.butterBatchProcessing.connect(owner).batchRedeem();

      //Pause Contract
      await contracts.butterBatchProcessing.connect(owner).pause();
    });
    it("prevents zapping into a batch", async function () {
      await expectRevert(
        contracts.butterBatchProcessingZapper.connect(depositor).zapIntoBatch([parseEther("1"), 0, 0], 0),
        "Pausable: paused"
      );
    });
    it("allows zapping out of a batch", async function () {
      await expect(
        contracts.butterBatchProcessingZapper.connect(depositor).zapOutOfBatch(currentMintId, parseEther("100"), 0, 0)
      )
        .to.emit(contracts.butterBatchProcessingZapper, "ZappedOutOfBatch")
        .withArgs(currentMintId, 0, parseEther("100"), parseEther("99.9"), depositor.address);
    });
    it("allows claiming and zapping into a stablecoin", async function () {
      await expect(
        contracts.butterBatchProcessingZapper.connect(depositor).claimAndSwapToStable(claimableRedeemId, 0, 0)
      )
        .to.emit(contracts.butterBatchProcessingZapper, "ClaimedIntoStable")
        .withArgs(claimableRedeemId, 0, parseEther("19980"), parseEther("19960.02"), depositor.address);
    });
    it("takes a redemption fee", async () => {
      await contracts.butterBatchProcessing.setRedemptionFee(100, owner.address);
      await contracts.butterBatchProcessingZapper.connect(depositor).claimAndSwapToStable(claimableRedeemId, 0, 0);
      const redemptionFee = await contracts.butterBatchProcessing.redemptionFee();
      expect(redemptionFee[0]).to.equal(parseEther("199.8"));
    });
  });
});
