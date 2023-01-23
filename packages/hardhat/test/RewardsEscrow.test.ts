import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { Block } from "@ethersproject/providers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import bluebird from "bluebird";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";
import { expectBigNumberCloseTo, expectDeepValue, expectRevert, expectValue } from "../lib/utils/expectValue";
import { DAYS, timeTravel } from "../lib/utils/test";
import { MockERC20 } from "../typechain";
import { PopLocker } from "../typechain/PopLocker";
import { RewardsEscrow } from "../typechain/RewardsEscrow";

interface Contracts {
  mockPop: MockERC20;
  mockToken: MockERC20;
  staking: PopLocker;
  rewardsEscrow: RewardsEscrow;
}

type Escrow = [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber, string] & {
  start: BigNumber;
  lastUpdateTime: BigNumber;
  end: BigNumber;
  initialBalance: BigNumber;
  balance: BigNumber;
  account: string;
};

let owner: SignerWithAddress,
  nonOwner: SignerWithAddress,
  staker: SignerWithAddress,
  staker2: SignerWithAddress,
  staking1: SignerWithAddress,
  staking2: SignerWithAddress;

let contracts: Contracts;
const STAKING_FUND = parseEther("10");
const DAY = 86400;
const WEEK = 7 * DAY;
const REWARDS_EPOCH = 1 * WEEK;
const LOCKED_AMOUNT = parseEther("4.5");
const NONEXISTENT_ESCROW_ID = ethers.utils.formatBytes32String("some nonexistent escrow ID");

async function deployContracts(): Promise<Contracts> {
  const mockPop = (await (
    await (await ethers.getContractFactory("MockERC20")).deploy("TestPOP", "TPOP", 18)
  ).deployed()) as MockERC20;
  await mockPop.mint(owner.address, parseEther("500"));
  await mockPop.mint(nonOwner.address, parseEther("10"));

  const mockToken = (await (
    await (await ethers.getContractFactory("MockERC20")).deploy("Test Token", "TEST", 18)
  ).deployed()) as MockERC20;
  await mockToken.mint(owner.address, parseEther("100"));
  await mockToken.mint(nonOwner.address, parseEther("5"));

  const rewardsEscrow = (await (
    await (await ethers.getContractFactory("RewardsEscrow")).deploy(mockPop.address)
  ).deployed()) as RewardsEscrow;

  const staking = (await (
    await (await ethers.getContractFactory("PopLocker")).deploy(mockPop.address, rewardsEscrow.address)
  ).deployed()) as PopLocker;
  await staking.setApprovals();

  await rewardsEscrow.addAuthorizedContract(staking.address);
  await rewardsEscrow.addAuthorizedContract(owner.address);

  await mockPop.transfer(staking.address, STAKING_FUND);
  await mockPop.connect(owner).approve(staking.address, parseEther("100000"));
  await mockPop.connect(owner).approve(rewardsEscrow.address, parseEther("1000000"));

  await staking.addReward(mockPop.address, owner.address, false);

  await staking.notifyRewardAmount(mockPop.address, STAKING_FUND);
  await staking.connect(owner).lock(staker.address, parseEther("1"), 0);

  return { mockPop, mockToken, staking, rewardsEscrow };
}

describe("RewardsEscrow", function () {
  beforeEach(async function () {
    [owner, nonOwner, staker, staker2, staking1, staking2] = await ethers.getSigners();
    contracts = await deployContracts();
  });

  describe("constructor", function () {
    it("stores POP token address", async function () {
      expectValue(await contracts.rewardsEscrow.POP(), contracts.mockPop.address);
    });
  });

  describe("isClaimable", function () {
    it("escrow is not claimable if start is zero", async function () {
      expectValue(await contracts.rewardsEscrow.isClaimable(NONEXISTENT_ESCROW_ID), false);
    });

    it("escrow is not claimable if balance is zero", async function () {
      await timeTravel(1 * REWARDS_EPOCH);
      await contracts.staking.connect(staker).getReward(staker.address);
      const [escrowId] = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
      await timeTravel(365 * DAYS);
      await contracts.rewardsEscrow.connect(staker).claimReward(escrowId);
      expectValue(await contracts.rewardsEscrow.isClaimable(escrowId), false);
    });
  });

  describe("getClaimableAmount", function () {
    it("returns zero for nonexistent escrow", async function () {
      await contracts.staking.connect(staker).getReward(owner.address);
      expectValue(await contracts.rewardsEscrow.getClaimableAmount(NONEXISTENT_ESCROW_ID), 0);
    });

    it("returns zero for new escrow", async function () {
      await contracts.staking.connect(staker).getReward(staker.address);
      const [escrowId] = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
      expectValue(await contracts.rewardsEscrow.getClaimableAmount(escrowId), 0);
    });

    it("returns claimable amount for escrow", async function () {
      await timeTravel(0.5 * REWARDS_EPOCH);
      await contracts.staking.connect(staker).getReward(staker.address);
      const [escrowId] = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
      await timeTravel(365 * DAYS);
      await expectBigNumberCloseTo(
        await contracts.rewardsEscrow.getClaimableAmount(escrowId),
        LOCKED_AMOUNT,
        parseEther("0.00015")
      );
    });
    it("calculates getClaimableAmount correctly and updates it after claim", async () => {
      const getExpectedClaimable = async (escrow, tx) => {
        const block = await waffle.provider.getBlock(tx.blockNumber);
        return escrow.balance
          .mul(BigNumber.from(block.timestamp).sub(escrow.lastUpdateTime))
          .div(escrow.end.sub(escrow.lastUpdateTime));
      };
      const lockTx = await contracts.rewardsEscrow.connect(owner).lock(staker.address, parseEther("100"), 100);
      const escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
      const escrowId = escrowIds[0];
      let escrow = await contracts.rewardsEscrow.escrows(escrowId);
      await timeTravel(10);
      let claimableTx = await contracts.rewardsEscrow.getClaimableAmount(escrowId);
      expectValue(await claimableTx, await getExpectedClaimable(escrow, claimableTx));

      let claimTx = await contracts.rewardsEscrow.connect(staker).claimReward(escrowId);
      escrow = await contracts.rewardsEscrow.escrows(escrowId);
      await expectBigNumberCloseTo(escrow.balance, parseEther("89"), parseEther("1"));
      await timeTravel(10);
      claimableTx = await contracts.rewardsEscrow.getClaimableAmount(escrowId);
      expectValue(await claimableTx, await getExpectedClaimable(escrow, claimableTx));
      claimTx = await contracts.rewardsEscrow.connect(staker).claimReward(escrowId);
      escrow = await contracts.rewardsEscrow.escrows(escrowId);
      await expectBigNumberCloseTo(escrow.balance, parseEther("78"), parseEther("1"));
    });
  });

  describe("getEscrowIdsByUser", function () {
    it("returns no escrow IDs when none exist", async function () {
      await expectDeepValue(await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address), []);
    });

    it("returns escrow IDs when they exist", async function () {
      await contracts.staking.connect(staker).getReward(staker.address);
      expectValue((await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address)).length, 1);
    });

    it("returns escrow IDs for specified user", async function () {
      await contracts.staking.connect(staker).getReward(staker.address);
      await expectDeepValue(await contracts.rewardsEscrow.getEscrowIdsByUser(owner.address), []);
    });
  });

  describe("getEscrows", function () {
    it("returns array of Escrows for provided ids", async function () {
      await contracts.staking.connect(staker).getReward(staker.address);
      await contracts.staking.connect(staker).getReward(staker.address);
      await contracts.staking.connect(staker).getReward(staker.address);
      let escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
      let escrows = await contracts.rewardsEscrow.getEscrows(escrowIds);
      expectValue(escrows.length, 3);
    });

    it("returns empty array for no escrows", async function () {
      let escrows = await contracts.rewardsEscrow.getEscrows([]);
      expectValue(escrows.length, 0);
    });

    it("returns empty escrow if escrow does not exist", async function () {
      await contracts.staking.connect(staker).getReward(staker.address);
      await contracts.staking.connect(staker).getReward(staker.address);
      let escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
      let escrows = await contracts.rewardsEscrow.getEscrows([NONEXISTENT_ESCROW_ID, ...escrowIds]);
      const [escrow1, _escrow2, _escrow3] = escrows;
      expectValue(escrows.length, 3);
      expectValue(escrow1.lastUpdateTime, 0);
      expectValue(escrow1.end, 0);
      expectValue(escrow1.initialBalance, 0);
      expectValue(escrow1.balance, 0);
    });
  });

  describe("lock", function () {
    beforeEach(async function () {
      await timeTravel(0.5 * REWARDS_EPOCH);
    });

    describe("require statements", () => {
      it("Reverts on unset staking address", async function () {
        await contracts.rewardsEscrow.connect(owner).addAuthorizedContract(owner.address);
        await contracts.rewardsEscrow.connect(owner).removeAuthorizedContract(owner.address);
        await expectRevert(
          contracts.rewardsEscrow.connect(owner).lock(staker.address, parseEther("1"), 365 * DAYS),
          "unauthorized"
        );
      });

      it("Reverts on unauthorized caller address", async function () {
        await expectRevert(
          contracts.rewardsEscrow.connect(nonOwner).lock(staker.address, parseEther("1"), 365 * DAYS),
          "unauthorized"
        );
      });

      it("Reverts on zero amount", async function () {
        await contracts.rewardsEscrow.connect(owner).addAuthorizedContract(owner.address);
        await expectRevert(
          contracts.rewardsEscrow.connect(owner).lock(staker.address, 0, 365 * DAYS),
          "amount must be greater than 0"
        );
      });

      it("Reverts on insufficient balance from caller", async function () {
        await contracts.rewardsEscrow.connect(owner).addAuthorizedContract(owner.address);
        await expectRevert(
          contracts.rewardsEscrow.connect(owner).lock(staker.address, parseEther("1000000000"), 365 * DAYS),
          "insufficient balance"
        );
      });
    });

    describe("Escrows", () => {
      let escrow: Escrow;
      let currentBlock: Block | BlockWithTransactions;

      beforeEach(async function () {
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        currentBlock = await ethers.provider._getBlock(currentBlockNumber);
        await contracts.staking.connect(staker).getReward(staker.address);

        const escrowId = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
        escrow = await contracts.rewardsEscrow.escrows(escrowId[0]);
      });

      it("stores escrow start", async function () {
        expectValue(escrow.lastUpdateTime, currentBlock.timestamp + 1);
      });

      it("stores escrow end", async function () {
        expectValue(escrow.end, escrow.lastUpdateTime.add(365 * DAYS));
      });

      it("stores escrow initial balance", async function () {
        await expectBigNumberCloseTo(escrow.initialBalance, LOCKED_AMOUNT, parseEther("0.00015"));
      });

      it("stores escrow balance", async function () {
        await expectBigNumberCloseTo(escrow.balance, LOCKED_AMOUNT, parseEther("0.00015"));
      });

      it("stores escrow account", async function () {
        expectValue(escrow.account, staker.address);
      });
    });

    it("transfers funds on lock", async function () {
      expect(await contracts.mockPop.balanceOf(contracts.rewardsEscrow.address)).to.equal(0);
      expect(await contracts.mockPop.balanceOf(contracts.staking.address)).to.equal(parseEther("21"));

      await contracts.staking.connect(staker).getReward(staker.address);

      await expectBigNumberCloseTo(
        await contracts.mockPop.balanceOf(contracts.rewardsEscrow.address),
        LOCKED_AMOUNT,
        parseEther("0.00015")
      );
      await expectBigNumberCloseTo(
        await contracts.mockPop.balanceOf(contracts.staking.address),
        parseEther("15.999983465608627210"),
        parseEther("0.00015")
      );
    });

    it("emits event on lock", async function () {
      const result = await contracts.staking.connect(staker).getReward(staker.address);
      expect(result).to.emit(contracts.rewardsEscrow, "Locked");
    });

    it("creates new Escrow when locking again", async function () {
      await contracts.staking.connect(staker).getReward(staker.address);
      await timeTravel(0.5 * REWARDS_EPOCH);
      await contracts.staking.connect(staker).getReward(staker.address);

      const escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);

      expect(escrowIds.length).to.equal(2);

      const escrow1 = await contracts.rewardsEscrow.escrows(escrowIds[0]);
      const escrow2 = await contracts.rewardsEscrow.escrows(escrowIds[1]);
      await expectBigNumberCloseTo(escrow1.balance, LOCKED_AMOUNT, parseEther("0.00015"));
      await expectBigNumberCloseTo(escrow2.balance, parseEther("4.499970238095092649"), parseEther("0.00015"));
    });
  });

  describe("claim rewards", function () {
    context("claim single escrow", function () {
      let escrow: Escrow;
      let escrowIds: string[];

      it("reverts on nonexistent escrow ID", async function () {
        await expectRevert(contracts.rewardsEscrow.connect(staker).claimReward(NONEXISTENT_ESCROW_ID), "unauthorized");
      });

      beforeEach(async function () {
        await timeTravel(304800);
        await contracts.staking.connect(staker).getReward(staker.address);
        escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
        escrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);
      });

      it("claims full rewards successfully", async function () {
        await timeTravel(366 * DAY);
        const oldBalance = await contracts.mockPop.balanceOf(staker.address);

        await expect(contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]))
          .to.emit(contracts.rewardsEscrow, "RewardsClaimed")
          .withArgs(staker.address, escrow.balance);

        const newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(oldBalance.add(escrow.balance));
      });

      it("deducts full amount from escrow balance", async function () {
        await timeTravel(366 * DAY);
        await contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]);
        const updatedEscrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);

        expectValue(updatedEscrow.balance, 0);
      });

      it("cannot claim escrow twice", async function () {
        await timeTravel(366 * DAY);
        await contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]);
        await expectRevert(contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]), "no rewards");
      });

      it("claims partial rewards successfully during the vesting period", async function () {
        await timeTravel(183 * DAY);

        const oldBalance = await contracts.mockPop.balanceOf(staker.address);
        const currentBlock = await waffle.provider.getBlock("latest");
        const result = await contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]);

        const expectedReward = escrow.balance
          .mul(BigNumber.from(String(currentBlock.timestamp + 1)).sub(escrow.lastUpdateTime))
          .div(escrow.end.sub(escrow.lastUpdateTime));

        expect(result).to.emit(contracts.rewardsEscrow, "RewardsClaimed").withArgs(staker.address, expectedReward);

        const newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(oldBalance.add(expectedReward));

        //Check if the escrowId got deleted
        expect((await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address)).length).to.equal(1);
      });

      it("deducts partial amount from escrow balance", async function () {
        await timeTravel(183 * DAY);

        const currentBlock = await waffle.provider.getBlock("latest");
        await contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]);

        const expectedReward = escrow.balance
          .mul(BigNumber.from(String(currentBlock.timestamp + 1)).sub(escrow.lastUpdateTime))
          .div(escrow.end.sub(escrow.lastUpdateTime));

        const updatedEscrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);

        expectValue(updatedEscrow.balance, escrow.balance.sub(expectedReward));
      });

      it("updates lastUpdateTime on escrow", async function () {
        await timeTravel(183 * DAY);

        const claimTx = await contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]);
        const claimTxBlock = await waffle.provider.getBlock(claimTx.blockNumber);

        const updatedEscrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);

        expectValue(updatedEscrow.lastUpdateTime, claimTxBlock.timestamp);
      });

      it("single escrow, multiple partial claims", async function () {
        await timeTravel(30 * DAY);

        let initialBalance = await contracts.mockPop.balanceOf(staker.address);
        let claimRewardTx = await contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]);
        let claimRewardBlock = await waffle.provider.getBlock(claimRewardTx.blockNumber);

        let expectedReward = escrow.balance
          .mul(BigNumber.from(claimRewardBlock.timestamp).sub(escrow.lastUpdateTime))
          .div(escrow.end.sub(escrow.lastUpdateTime));

        expect(claimRewardTx)
          .to.emit(contracts.rewardsEscrow, "RewardsClaimed")
          .withArgs(staker.address, expectedReward);

        let newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(initialBalance.add(expectedReward));

        await timeTravel(30 * DAY);
        escrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);
        initialBalance = await contracts.mockPop.balanceOf(staker.address);
        claimRewardTx = await contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]);
        claimRewardBlock = await waffle.provider.getBlock(claimRewardTx.blockNumber);

        expectedReward = escrow.balance
          .mul(BigNumber.from(claimRewardBlock.timestamp).sub(escrow.lastUpdateTime))
          .div(escrow.end.sub(escrow.lastUpdateTime));

        expect(claimRewardTx)
          .to.emit(contracts.rewardsEscrow, "RewardsClaimed")
          .withArgs(staker.address, expectedReward);

        newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(initialBalance.add(expectedReward));

        await timeTravel(30 * DAY);
        escrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);
        initialBalance = await contracts.mockPop.balanceOf(staker.address);
        claimRewardTx = await contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]);
        claimRewardBlock = await waffle.provider.getBlock(claimRewardTx.blockNumber);

        expectedReward = escrow.balance
          .mul(BigNumber.from(claimRewardBlock.timestamp).sub(escrow.lastUpdateTime))
          .div(escrow.end.sub(escrow.lastUpdateTime));

        expect(claimRewardTx)
          .to.emit(contracts.rewardsEscrow, "RewardsClaimed")
          .withArgs(staker.address, expectedReward);

        newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(initialBalance.add(expectedReward));
      });

      it("reverts if caller is not escrow account", async function () {
        await expectRevert(contracts.rewardsEscrow.connect(nonOwner).claimReward(escrowIds[0]), "unauthorized");
      });

      it("claims successfully when multiple escrows are added", async function () {
        await bluebird.map(
          new Array(50).fill(0),
          async (_x, _i) => {
            await contracts.staking.connect(staker).getReward(staker.address);
          },
          { concurrency: 1 }
        );
        await timeTravel(366 * DAY);
        escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);

        escrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);
        const oldBalance = await contracts.mockPop.balanceOf(staker.address);

        await expect(contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]))
          .to.emit(contracts.rewardsEscrow, "RewardsClaimed")
          .withArgs(staker.address, escrow.balance);

        const newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(oldBalance.add(escrow.balance));
      });
    });

    context("claim multiple escrows", function () {
      beforeEach(async function () {
        await timeTravel(304800);
      });

      it("reverts on nonexistent escrow ID", async function () {
        await expectRevert(
          contracts.rewardsEscrow.connect(staker).claimRewards([NONEXISTENT_ESCROW_ID]),
          "unauthorized"
        );
      });

      it("cannot claim escrows twice", async function () {
        await bluebird.map(
          new Array(30).fill(0),
          async (_x, _i) => {
            await contracts.staking.connect(staker).getReward(staker.address);
          },
          { concurrency: 1 }
        );
        await timeTravel(366 * DAY);
        const escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
        await contracts.rewardsEscrow.connect(staker).claimRewards(escrowIds.slice(0, 20));

        await expectRevert(contracts.rewardsEscrow.connect(staker).claimRewards(escrowIds.slice(0, 20)), "no rewards");
      });

      it("reverts if caller is not escrow account for any included escrow", async function () {
        await contracts.staking.connect(staker).getReward(staker.address);
        const escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
        await expectRevert(contracts.rewardsEscrow.connect(nonOwner).claimRewards(escrowIds), "unauthorized");
      });

      it("claims full rewards successfully after vesting period", async function () {
        await contracts.staking.connect(staker).getReward(staker.address);
        const escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
        const escrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);
        await timeTravel(366 * DAY);
        const oldBalance = await contracts.mockPop.balanceOf(staker.address);

        await expect(contracts.rewardsEscrow.connect(staker).claimRewards([escrowIds[0]]))
          .to.emit(contracts.rewardsEscrow, "RewardsClaimed")
          .withArgs(staker.address, escrow.balance);

        const newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(oldBalance.add(escrow.balance));
      });

      it("claims partial rewards successfully during the vesting period", async function () {
        await contracts.staking.connect(staker).getReward(staker.address);
        const escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
        const escrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);

        await timeTravel(183 * DAY);

        const oldBalance = await contracts.mockPop.balanceOf(staker.address);
        const currentBlock = await waffle.provider.getBlock("latest");
        const result = await contracts.rewardsEscrow.connect(staker).claimRewards([escrowIds[0]]);

        const expectedReward = escrow.balance
          .mul(BigNumber.from(String(currentBlock.timestamp + 1)).sub(escrow.lastUpdateTime))
          .div(escrow.end.sub(escrow.lastUpdateTime));

        expect(result).to.emit(contracts.rewardsEscrow, "RewardsClaimed").withArgs(staker.address, expectedReward);

        const newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(oldBalance.add(expectedReward));
      });

      it("claims successfully when multiple escrows are added", async function () {
        await bluebird.map(
          new Array(50).fill(0),
          async (x, i) => {
            await contracts.staking.connect(staker).getReward(staker.address);
          },
          { concurrency: 1 }
        );
        await timeTravel(366 * DAY);
        const escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
        const escrow = await contracts.rewardsEscrow.escrows(escrowIds[0]);
        const oldBalance = await contracts.mockPop.balanceOf(staker.address);

        await expect(contracts.rewardsEscrow.connect(staker).claimReward(escrowIds[0]))
          .to.emit(contracts.rewardsEscrow, "RewardsClaimed")
          .withArgs(staker.address, escrow.balance);

        const newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(oldBalance.add(escrow.balance));
      });

      it("should allow to claim one escrow balance fully while claiming another one partially", async function () {
        await contracts.staking.connect(staker).getReward(staker.address);
        await timeTravel(1 * DAY);
        await contracts.staking.connect(staker).getReward(staker.address);
        const escrowIds = await contracts.rewardsEscrow.getEscrowIdsByUser(staker.address);
        const escrow1 = await contracts.rewardsEscrow.escrows(escrowIds[0]);
        const escrow2 = await contracts.rewardsEscrow.escrows(escrowIds[1]);
        const timestamp = (await waffle.provider.getBlock("latest")).timestamp;
        await timeTravel(escrow1.end.toNumber() - timestamp);
        const oldBalance = await contracts.mockPop.balanceOf(staker.address);
        const currentBlock = await waffle.provider.getBlock("latest");
        const result = await contracts.rewardsEscrow.connect(staker).claimRewards([escrowIds[0], escrowIds[1]]);

        const escrow2ExpectedReward = escrow2.balance
          .mul(BigNumber.from(String(currentBlock.timestamp + 1)).sub(escrow2.lastUpdateTime))
          .div(escrow2.end.sub(escrow2.lastUpdateTime));
        const expectedReward = escrow2ExpectedReward.add(escrow1.balance);

        expectValue((await contracts.rewardsEscrow.escrows(escrowIds[0])).balance, 0);
        expectValue(
          (await contracts.rewardsEscrow.escrows(escrowIds[1])).balance,
          escrow2.balance.sub(escrow2ExpectedReward)
        );

        expect(result).to.emit(contracts.rewardsEscrow, "RewardsClaimed").withArgs(staker.address, expectedReward);

        const newBalance = await contracts.mockPop.balanceOf(staker.address);
        expect(newBalance).to.equal(oldBalance.add(expectedReward));
      });
    });
  });

  describe("restricted functions", function () {
    it("adds a authorized staking contract address", async function () {
      expectValue(await contracts.rewardsEscrow.authorized(staking1.address), false);
      await contracts.rewardsEscrow.connect(owner).addAuthorizedContract(staking1.address);
      expectValue(await contracts.rewardsEscrow.authorized(staking1.address), true);
    });

    it("emits AddAuthorizedContract when authorized staking address is added", async function () {
      expect(contracts.rewardsEscrow.connect(owner).addAuthorizedContract(staking1.address))
        .to.emit(contracts.rewardsEscrow, "AddAuthorizedContract")
        .withArgs(staking1.address);
    });

    it("removes staking contract address", async function () {
      expectValue(await contracts.rewardsEscrow.authorized(staking1.address), false);
      await contracts.rewardsEscrow.connect(owner).addAuthorizedContract(staking1.address);
      expectValue(await contracts.rewardsEscrow.authorized(staking1.address), true);
      await contracts.rewardsEscrow.connect(owner).removeAuthorizedContract(staking1.address);
      expectValue(await contracts.rewardsEscrow.authorized(staking1.address), false);
    });

    it("emits RemoveAuthorizedContract when authorized staking address is removed", async function () {
      expect(contracts.rewardsEscrow.connect(owner).removeAuthorizedContract(staking1.address))
        .to.emit(contracts.rewardsEscrow, "RemoveAuthorizedContract")
        .withArgs(staking1.address);
    });

    it("should revert addAuthorizedContract if not owner", async function () {
      await expectRevert(
        contracts.rewardsEscrow.connect(nonOwner).addAuthorizedContract(nonOwner.address),
        "Ownable: caller is not the owner"
      );
    });
  });
});
