import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import {
  expectBigNumberCloseTo,
  expectDeepValue,
  expectEvent,
  expectRevert,
  expectValue,
} from "../lib/utils/expectValue";
import { DAYS, WEEKS } from "../lib/utils/test/constants";
import { timeTravel } from "../lib/utils/test/timeTravel";
import { MockERC20, PopLocker } from "../typechain";
import { RewardsEscrow } from "../typechain/RewardsEscrow";

let stakingFund: BigNumber;

let owner: SignerWithAddress,
  nonOwner: SignerWithAddress,
  staker: SignerWithAddress,
  treasury: SignerWithAddress,
  distributor: SignerWithAddress,
  kicker: SignerWithAddress;

let mockERC20Factory;
let mockPop: MockERC20;
let otherToken: MockERC20;
let staking: PopLocker;
let rewardsEscrow: RewardsEscrow;
let rewardsEscrowAddress: SignerWithAddress;

describe("PopLocker", function () {
  beforeEach(async function () {
    [owner, nonOwner, staker, treasury, distributor, kicker, rewardsEscrowAddress] = await ethers.getSigners();
    mockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockPop = (await mockERC20Factory.deploy("TestPOP", "TPOP", 18)) as MockERC20;
    await mockPop.mint(owner.address, parseEther("1000000"));
    await mockPop.mint(nonOwner.address, parseEther("10"));

    otherToken = (await mockERC20Factory.deploy("TestOtherToken", "TOTHER", 18)) as MockERC20;

    rewardsEscrow = (await (
      await (await ethers.getContractFactory("RewardsEscrow")).deploy(mockPop.address)
    ).deployed()) as RewardsEscrow;

    const popLockerFactory = await ethers.getContractFactory("PopLocker");
    staking = (await popLockerFactory.deploy(mockPop.address, rewardsEscrow.address)) as PopLocker;
    await staking.deployed();
    await staking.setApprovals();

    await staking.addReward(mockPop.address, owner.address, true);

    await rewardsEscrow.addAuthorizedContract(staking.address);

    stakingFund = parseEther("10");
    await mockPop.transfer(staking.address, stakingFund);
    await mockPop.connect(owner).approve(staking.address, parseEther("100000"));
  });

  describe("constructor", function () {
    it("stores token passed at construction time", async function () {
      expectValue(await staking.stakingToken(), mockPop.address);
      expectValue(await staking.rewardTokens(0), mockPop.address);
    });

    it("stores rewards escrow address", async function () {
      expectValue(await staking.rewardsEscrow(), rewardsEscrow.address);
    });

    it("adds RewardsDistributor", async function () {
      it("reverts on zero amount", async function () {
        await expect(staking.lock(owner.address, 0, 0)).to.be.revertedWith("Cannot stake 0");
      });
    });
  });

  describe("token attributes", function () {
    it("returns token decimals", async function () {
      expectValue(await staking.decimals(), 18);
    });

    it("returns token name", async function () {
      expectValue(await staking.name(), "Vote Locked POP Token");
    });

    it("returns token symbol", async function () {
      expectValue(await staking.symbol(), "vlPOP");
    });
  });

  describe("addReward", function () {
    it("cannot add same token twice", async function () {
      await expectRevert(staking.connect(owner).addReward(mockPop.address, owner.address, true), "");
    });
  });

  describe("setRewardEscrow", function () {
    it("allows owner to set  rewards escrow address", async () => {
      await staking.connect(owner).setRewardsEscrow(rewardsEscrowAddress.address);
      expectValue(await staking.rewardsEscrow(), rewardsEscrowAddress.address);
    });
    it("disallows non-owner to set rewards escrow address", async () => {
      await expectRevert(staking.connect(staker).setRewardsEscrow(rewardsEscrowAddress.address), "");
    });
  });

  describe("approveRewardDistributor", function () {
    it("reverts on invalid rewards token", async function () {
      await expectRevert(
        staking.connect(owner).approveRewardDistributor(otherToken.address, distributor.address, true),
        "rewards token does not exist"
      );
    });

    it("approves distributor", async function () {
      await staking.connect(owner).approveRewardDistributor(mockPop.address, distributor.address, true);
      expectValue(await staking.rewardDistributors(mockPop.address, distributor.address), true);
    });

    it("denies distributor", async function () {
      await staking.connect(owner).approveRewardDistributor(mockPop.address, distributor.address, true);
      await staking.connect(owner).approveRewardDistributor(mockPop.address, distributor.address, false);
      expectValue(await staking.rewardDistributors(mockPop.address, distributor.address), false);
    });
  });

  describe("approveRewardDistributor", function () {
    it("reverts on invalid rewards token", async function () {
      await expectRevert(
        staking.connect(owner).approveRewardDistributor(otherToken.address, distributor.address, true),
        "rewards token does not exist"
      );
    });

    it("approves distributor", async function () {
      await staking.connect(owner).approveRewardDistributor(mockPop.address, distributor.address, true);
      expectValue(await staking.rewardDistributors(mockPop.address, distributor.address), true);
    });

    it("denies distributor", async function () {
      await staking.connect(owner).approveRewardDistributor(mockPop.address, distributor.address, true);
      await staking.connect(owner).approveRewardDistributor(mockPop.address, distributor.address, false);
      expectValue(await staking.rewardDistributors(mockPop.address, distributor.address), false);
    });
  });

  describe("setEscrowDuration", function () {
    it("updates escrow duration parameter", async () => {
      expectValue(await staking.escrowDuration(), 365 * DAYS);
      await staking.connect(owner).setEscrowDuration(14 * DAYS);
      expectValue(await staking.escrowDuration(), 14 * DAYS);
    });

    it("emits EscrowDurationUpdated", async () => {
      await expectEvent(await staking.setEscrowDuration(14 * DAYS), staking, "EscrowDurationUpdated", [
        365 * DAYS,
        14 * DAYS,
      ]);
    });

    it("can only be called by owner", async () => {
      await expectRevert(staking.connect(nonOwner).setEscrowDuration(14 * DAYS), "Ownable: caller is not the owner");
    });
  });

  describe("setBoost", function () {
    const MAX_PAYMENT = 100;
    const BOOST_RATE = 15000;

    it("sets nextMaximumBoostPayment", async () => {
      await staking.connect(owner).setBoost(MAX_PAYMENT, BOOST_RATE, owner.address);
      expectValue(await staking.nextMaximumBoostPayment(), MAX_PAYMENT);
    });

    it("sets nextBoostRate", async () => {
      await staking.connect(owner).setBoost(MAX_PAYMENT, BOOST_RATE, owner.address);
      expectValue(await staking.nextBoostRate(), BOOST_RATE);
    });
  });

  describe("setBoost", function () {
    const MAX_PAYMENT = 100;
    const BOOST_RATE = 15000;

    it("sets nextMaximumBoostPayment", async () => {
      await staking.connect(owner).setBoost(MAX_PAYMENT, BOOST_RATE, owner.address);
      expectValue(await staking.nextMaximumBoostPayment(), MAX_PAYMENT);
    });

    it("sets nextBoostRate", async () => {
      await staking.connect(owner).setBoost(MAX_PAYMENT, BOOST_RATE, owner.address);
      expectValue(await staking.nextBoostRate(), BOOST_RATE);
    });
  });

  describe("setKickIncentive", function () {
    const KICK_INCENTIVE_RATE = 100; // 1% per epoch
    const KICK_INCENTIVE_DELAY = 4; // 4 epoch grace period

    it("updates kickRewardPerEpoch", async () => {
      await staking.connect(owner).setKickIncentive(KICK_INCENTIVE_RATE, KICK_INCENTIVE_DELAY);
      expectValue(await staking.kickRewardPerEpoch(), KICK_INCENTIVE_RATE);
    });

    it("updates kickRewardEpochDelay", async () => {
      await staking.connect(owner).setKickIncentive(KICK_INCENTIVE_RATE, KICK_INCENTIVE_DELAY);
      expectValue(await staking.kickRewardEpochDelay(), KICK_INCENTIVE_DELAY);
    });

    it("reverts on rate >5%", async () => {
      await expectRevert(
        staking.connect(nonOwner).setKickIncentive(501, KICK_INCENTIVE_DELAY),
        "Ownable: caller is not the owner"
      );
    });

    it("reverts on delay < 2 epochs", async () => {
      await expectRevert(
        staking.connect(nonOwner).setKickIncentive(KICK_INCENTIVE_RATE, 1),
        "Ownable: caller is not the owner"
      );
    });

    it("can only be called by owner", async () => {
      await expectRevert(
        staking.connect(nonOwner).setKickIncentive(KICK_INCENTIVE_RATE, KICK_INCENTIVE_DELAY),
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("lastTimeRewardApplicable", function () {
    it("returns periodFinish for specified token", async function () {
      let addRewardTx = await staking.connect(owner).addReward(otherToken.address, owner.address, true);
      const addRewardTxBlock = await ethers.provider.getBlock(addRewardTx.blockNumber);
      expectValue(await staking.lastTimeRewardApplicable(otherToken.address), addRewardTxBlock.timestamp);
    });
  });

  describe("rewardPerToken", function () {
    it("returns rewards per token for specified token", async function () {
      await staking.connect(owner).notifyRewardAmount(mockPop.address, parseEther("10000"));
      await staking.lock(staker.address, parseEther("1"), 0);
      await timeTravel(7 * DAYS);
      await staking.lock(staker.address, parseEther("1"), 0);
      await expectBigNumberCloseTo(
        await staking.rewardPerToken(mockPop.address),
        parseEther("10000"),
        parseEther("0.0175")
      );
    });
  });

  describe("rewardWeightOf", function () {
    it("returns account's boosted balance", async function () {
      const boostedBalance = parseEther("10000");
      await staking.lock(staker.address, boostedBalance, 0);
      expectValue(await staking.rewardWeightOf(staker.address), boostedBalance);
    });
  });

  describe("balanceAtEpochOf", function () {
    it("returns locked balance of account at specified epoch", async function () {
      await staking.lock(staker.address, parseEther("5000"), 0);
      await timeTravel(7 * DAYS);
      await staking.lock(staker.address, parseEther("7000"), 0);
      await timeTravel(7 * DAYS);

      expectValue(await staking.balanceAtEpochOf(0, staker.address), parseEther("5000"));
      expectValue(await staking.balanceAtEpochOf(1, staker.address), parseEther("12000"));
    });
  });

  describe("epochCount", function () {
    it("returns total number of epochs", async function () {
      expectValue(await staking.epochCount(), 1);
      await timeTravel(7 * DAYS);
      await staking.checkpointEpoch();
      expectValue(await staking.epochCount(), 2);
      await timeTravel(7 * DAYS);
      await staking.checkpointEpoch();
      expectValue(await staking.epochCount(), 3);
    });
  });

  describe("findEpochId", function () {
    it("returns epoch ID for a timestamp", async function () {
      const epochCountTx = await staking.checkpointEpoch();
      const epochCountTxBlock = await ethers.provider.getBlock(epochCountTx.blockNumber);
      const timestamp = epochCountTxBlock.timestamp;
      expectValue(await staking.findEpochId(timestamp), 0);
      await timeTravel(7 * DAYS);
      await staking.checkpointEpoch();
      expectValue(await staking.findEpochId(timestamp + 7 * DAYS), 1);
      await timeTravel(7 * DAYS);
      await staking.checkpointEpoch();
      expectValue(await staking.findEpochId(timestamp + 14 * DAYS), 2);
    });
  });

  describe("totalSupply", function () {
    it("returns sum of all locked balances, excluding current epoch", async function () {
      const boostedBalance = parseEther("10000");
      await staking.lock(staker.address, boostedBalance, 0);
      expectValue(await staking.totalSupply(), 0);
      await timeTravel(8 * DAYS);
      expectValue(await staking.totalSupply(), boostedBalance);
    });
  });

  describe("totalSupplyAtEpoch", function () {
    it("returns total supply at a specific epoch", async function () {
      await staking.lock(staker.address, parseEther("5000"), 0);
      expectValue(await staking.totalSupply(), 0);
      await timeTravel(7 * DAYS);
      await staking.lock(staker.address, parseEther("5000"), 0);
      await timeTravel(7 * DAYS);
      expectValue(await staking.totalSupplyAtEpoch(0), parseEther("5000"));
      expectValue(await staking.totalSupplyAtEpoch(1), parseEther("10000"));
    });
  });

  describe("stake", function () {
    it("reverts on zero amount", async function () {
      await expect(staking.lock(owner.address, 0, 0)).to.be.revertedWith("Cannot stake 0");
    });

    it("reverts if spend ratio is too high", async function () {
      await expect(staking.lock(owner.address, parseEther("1"), BigNumber.from("1600"))).to.be.revertedWith(
        "over max spend"
      );
    });

    it("reverts if contract is shut down", async function () {
      await staking.shutdown();
      await expect(staking.lock(owner.address, parseEther("1"), 0)).to.be.revertedWith("shutdown");
    });

    it("reverts on insufficient caller balance", async function () {
      await mockPop.approve(staking.address, parseEther("10000000000"));
      await expect(staking.lock(owner.address, parseEther("10000000000"), 0)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      );
    });

    it("transfers tokens on lock", async function () {
      const amount = parseEther("10000");
      const currentBalance = await mockPop.balanceOf(owner.address);
      await staking.connect(owner).lock(owner.address, amount, 0);
      expect(await mockPop.balanceOf(staking.address)).to.equal(stakingFund.add(amount));
      expect(await mockPop.balanceOf(owner.address)).to.equal(currentBalance.sub(amount));
    });

    it("should lock funds successfully", async function () {
      const amount = parseEther("10000");
      const currentBalance = await mockPop.balanceOf(owner.address);
      await expect(staking.connect(owner).lock(owner.address, amount, 0))
        .to.emit(staking, "Staked")
        .withArgs(owner.address, amount, amount, amount);
      expect(await mockPop.balanceOf(staking.address)).to.equal(stakingFund.add(amount));
      expect(await mockPop.balanceOf(owner.address)).to.equal(currentBalance.sub(amount));
      expect(await staking.lockedBalanceOf(owner.address)).to.equal(parseEther("10000"));
    });

    it("balanceOf updates on next epoch", async function () {
      const amount = parseEther("10000");
      const currentBalance = await mockPop.balanceOf(owner.address);
      await staking.connect(owner).lock(owner.address, amount, 0);
      await timeTravel(7 * DAYS);
      expect(await staking.balanceOf(owner.address)).to.equal(parseEther("10000"));
    });

    it("balanceOf will not update in same epoch when locking tokens", async function () {
      await staking.connect(owner).lock(owner.address, parseEther("10000"), 0);
      expect(await staking.balanceOf(owner.address)).to.equal(parseEther("0"));
    });

    it("should update locked balances when staking", async () => {
      const amount = parseEther("10");
      await mockPop.approve(staking.address, amount);

      await staking.connect(owner).lock(owner.address, amount, 0);
      const lockedBalance = await staking.lockedBalanceOf(owner.address);
      expect(lockedBalance).to.equal(parseEther("10"));
    });
  });

  describe("stakeFor", function () {
    it("emits a Staked event", async function () {
      const amount = parseEther("10000");
      const currentBalance = await mockPop.balanceOf(owner.address);
      await expect(staking.lock(staker.address, amount, 0))
        .to.emit(staking, "Staked")
        .withArgs(staker.address, amount, amount, amount);
    });

    it("should lock funds successfully", async function () {
      const amount = parseEther("10000");
      const currentBalance = await mockPop.balanceOf(owner.address);
      await staking.lock(staker.address, amount, 0);
      await timeTravel(7 * DAYS);
      await staking.checkpointEpoch();
      expectValue(await mockPop.balanceOf(staking.address), stakingFund.add(amount));
      expectValue(await mockPop.balanceOf(owner.address), currentBalance.sub(amount));
      expectValue(await staking.balanceOf(staker.address), parseEther("10000"));
    });

    it("should update locked balances when staking", async () => {
      const amount = parseEther("10");
      await mockPop.connect(staker).approve(staking.address, amount);

      await staking.lock(staker.address, amount, 0);
      const lockedBalance = await staking.lockedBalanceOf(staker.address);
      expect(lockedBalance).to.equal(parseEther("10"));
    });
  });

  describe("rewards escrow integration", async () => {
    let earnedRewards: BigNumber;
    beforeEach(async () => {
      const amount = parseEther("10");
      await staking.connect(owner).notifyRewardAmount(mockPop.address, stakingFund);
      await staking.connect(owner).lock(owner.address, amount, 0);

      await timeTravel(7 * DAYS);
      const [, amountEarned] = (await staking.claimableRewards(owner.address))[0];
      earnedRewards = amountEarned;
      await staking.connect(owner).getReward(owner.address);
    });
    it("should set duration to 365 days when rewards are added to escrow", async () => {
      const [escrowId] = await rewardsEscrow.getEscrowIdsByUser(owner.address);
      const escrow = await rewardsEscrow.escrows(escrowId);
      expect(escrow.end).to.equal(escrow.lastUpdateTime.add(365 * DAYS));
    });

    it("should add 90% of claimable to escrow", async () => {
      const [escrowId] = await rewardsEscrow.getEscrowIdsByUser(owner.address);
      const escrow = await rewardsEscrow.escrows(escrowId);
      expect(escrow.balance).to.equal(earnedRewards.div(10).mul(9));
    });
  });

  describe("withdraw", function () {
    it("should release funds successfully after lock period has expired", async function () {
      const amount = parseEther("100");
      await staking.connect(owner).lock(owner.address, amount, 0);
      await timeTravel(7 * 13 * DAYS);
      expect(await staking["processExpiredLocks(bool)"](false))
        .to.emit(staking, "Withdrawn")
        .withArgs(owner.address, amount);
      expect(await staking.lockedBalanceOf(owner.address)).to.equal(0);
      expect(await staking.balanceOf(owner.address)).to.equal(0);
    });
    it("should not release funds successfully after lock period has expired", async function () {
      const amount = parseEther("100");
      await staking.connect(owner).lock(owner.address, amount, 0);
      await timeTravel(7 * DAYS);
      await expect(staking["processExpiredLocks(bool)"](false)).to.be.revertedWith("no exp locks");
      expect(await staking.lockedBalanceOf(owner.address)).to.equal(amount);
      expect(await staking.balanceOf(owner.address)).to.equal(amount);
    });
  });

  describe("rewards", function () {
    it("should emit a RewardPaid event when rewards are paid out", async function () {
      const amount = parseEther("10");
      await staking.connect(owner).notifyRewardAmount(mockPop.address, stakingFund);
      await staking.connect(owner).lock(owner.address, amount, 0);
      await timeTravel(7 * DAYS);
      const [, amountEarned] = (await staking.claimableRewards(owner.address))[0];

      const result = await staking.connect(owner).getReward(owner.address);
      expect(result).to.emit(staking, "RewardPaid");
    });
    it("should pay out rewards successfully", async function () {
      const amount = parseEther("10");
      await staking.connect(owner).notifyRewardAmount(mockPop.address, stakingFund);
      await staking.connect(owner).lock(owner.address, amount, 0);

      await timeTravel(7 * DAYS);

      const [, amountEarned] = (await staking.claimableRewards(owner.address))[0];

      const payout = amountEarned.div(10);
      const popBalance = await mockPop.balanceOf(owner.address);
      await staking.connect(owner).getReward(owner.address);

      expect(await mockPop.balanceOf(owner.address)).to.equal(popBalance.add(payout));

      expect(await staking.lockedBalanceOf(owner.address)).to.equal(parseEther("10"));
      expect((await staking.claimableRewards(owner.address))[0].amount).to.equal(0);
    });

    it("should send 90% of earned rewards to escrow when claimed", async function () {
      const amount = parseEther("10");
      await staking.connect(owner).notifyRewardAmount(mockPop.address, stakingFund);
      await staking.connect(owner).lock(owner.address, amount, 0);

      await timeTravel(7 * DAYS);

      const [, amountEarned] = (await staking.claimableRewards(owner.address))[0];

      const payout = amountEarned.div(10);
      const popBalance = await mockPop.balanceOf(rewardsEscrow.address);
      await staking.connect(owner).getReward(owner.address);

      expect(await mockPop.balanceOf(rewardsEscrow.address)).to.equal(popBalance.add(payout.mul(9)));
    });

    it("lowers the reward rate when more user stake", async function () {
      const amount = parseEther("1");
      await staking.connect(owner).notifyRewardAmount(mockPop.address, stakingFund);
      await staking.connect(owner).lock(owner.address, amount, 0);
      await mockPop.connect(nonOwner).approve(staking.address, amount);
      await staking.connect(nonOwner).lock(nonOwner.address, amount, 0);
      await timeTravel(7 * DAYS);
      expect((await staking.claimableRewards(owner.address))[0].amount).to.equal(parseEther("5.000008267195605595"));
      expect((await staking.claimableRewards(nonOwner.address))[0].amount).to.equal(parseEther("4.999975198412536813"));
    });
  });

  describe("balanceOf", function () {
    it("should return 0 balance after lockperiod ended", async function () {
      await staking.connect(owner).lock(owner.address, parseEther("1"), 0);
      await timeTravel(13 * 7 * DAYS);
      await staking.checkpointEpoch();
      const voiceCredits = await staking.balanceOf(owner.address);
      expect(voiceCredits.toString()).to.equal("0");
    });
  });

  describe("processExpiredLocks", function () {
    const stakeAmount = parseEther("10000");
    it("withdraws after lockDuration has passed", async function () {
      const initialBalance = await mockPop.balanceOf(owner.address);
      await staking.connect(owner).lock(owner.address, stakeAmount, 0);
      expectValue(await mockPop.balanceOf(owner.address), initialBalance.sub(stakeAmount));
      await timeTravel(12 * WEEKS);
      await staking.connect(owner)["processExpiredLocks(bool,uint256,address)"](false, 0, owner.address);
      expectValue(await mockPop.balanceOf(owner.address), initialBalance);
    });
  });

  describe("lockedBalances", function () {
    const stakeAmount = parseEther("10000");

    it("returns the locked balance data for the user", async function () {
      await staking.connect(owner).lock(owner.address, stakeAmount, 0);
      await timeTravel(6 * WEEKS);

      await staking.connect(owner).lock(owner.address, stakeAmount, 0);
      await timeTravel(6 * WEEKS);

      const lockedBalances = await staking.lockedBalances(owner.address);
      const lock1 = await staking.userLocks(owner.address, 0);
      const lock2 = await staking.userLocks(owner.address, 1);

      expectValue(lockedBalances.total, stakeAmount.mul(2));
      expectValue(lockedBalances.unlockable, stakeAmount);
      expectValue(lockedBalances.locked, stakeAmount);
      await expectDeepValue(lockedBalances.lockData, [lock2]);
    });
  });

  describe("kickExpiredLocks", function () {
    const stakeAmount = parseEther("10000");

    it("pays kicker a 1% incentive to kick expired locks", async function () {
      await staking.connect(owner).lock(owner.address, parseEther("10000"), 0);
      await timeTravel(16 * WEEKS);
      await staking.connect(kicker).kickExpiredLocks(owner.address);
      expectValue(await mockPop.balanceOf(kicker.address), parseEther("100"));
    });
  });

  describe("notifyRewardAmount", function () {
    it("should set rewards", async function () {
      expect(await staking.connect(owner).getRewardForDuration(mockPop.address)).to.equal(0);
      await staking.connect(owner).notifyRewardAmount(mockPop.address, stakingFund);
      expect(await staking.connect(owner).getRewardForDuration(mockPop.address)).to.equal(
        parseEther("9.999999999999676800")
      );
    });

    it("should revert if not owner", async function () {
      await expect(staking.connect(nonOwner).notifyRewardAmount(mockPop.address, stakingFund)).to.be.revertedWith(
        "not authorized"
      );
    });

    it("should be able to increase rewards", async function () {
      await staking.notifyRewardAmount(mockPop.address, parseEther("5"));
      expect(await staking.connect(owner).getRewardForDuration(mockPop.address)).to.equal(
        parseEther("4.999999999999536000")
      );
      await staking.notifyRewardAmount(mockPop.address, parseEther("5"));
      expect(await staking.connect(owner).getRewardForDuration(mockPop.address)).to.equal(
        parseEther("9.999991732803408000")
      );
    });

    it("should transfer rewards via notifyRewardAmount", async function () {
      const stakingPopBalance = await mockPop.balanceOf(staking.address);
      await staking.notifyRewardAmount(mockPop.address, parseEther("11"));
      expect(await mockPop.balanceOf(staking.address)).to.equal(stakingPopBalance.add(parseEther("11")));
    });
  });

  describe("recoverERC20", function () {
    const OTHER_TOKEN_AMOUNT = parseEther("1000");

    beforeEach(async function () {
      await otherToken.mint(staking.address, OTHER_TOKEN_AMOUNT);
    });

    it("transfers recovered token to owner", async () => {
      expectValue(await otherToken.balanceOf(owner.address), 0);
      await staking.connect(owner).recoverERC20(otherToken.address, OTHER_TOKEN_AMOUNT);
      expectValue(await otherToken.balanceOf(owner.address), OTHER_TOKEN_AMOUNT);
    });

    it("emits Recovered", async () => {
      await expectEvent(
        await staking.connect(owner).recoverERC20(otherToken.address, OTHER_TOKEN_AMOUNT),
        staking,
        "Recovered",
        [otherToken.address, OTHER_TOKEN_AMOUNT]
      );
    });

    it("cannot withdraw staking token", async () => {
      await expectRevert(
        staking.connect(owner).recoverERC20(mockPop.address, OTHER_TOKEN_AMOUNT),
        "Cannot withdraw staking token"
      );
    });

    it("non-owner cannot withdraw", async () => {
      await expectRevert(
        staking.connect(nonOwner).recoverERC20(mockPop.address, OTHER_TOKEN_AMOUNT),
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("claiming unearned rewards", () => {
    it("doesn't allow a user to claim unearned rewards by calling process expired locks with a different _withdrawTo address", async () => {
      const amount = parseEther("100");
      await staking.connect(owner).notifyRewardAmount(mockPop.address, amount);
      await staking.connect(owner).lock(owner.address, parseEther("100"), 0);
      await timeTravel(13 * WEEKS);
      await staking.connect(owner)["processExpiredLocks(bool,uint256,address)"](true, 0, nonOwner.address);
      const earnedRewards = await staking.claimableRewards(owner.address);
      expect(earnedRewards[0].amount).to.equal(parseEther("99.999834656084448000"));
      const unEarnedRewards = await staking.claimableRewards(nonOwner.address);
      expect(unEarnedRewards[0].amount).to.equal(0);
    });
  });
});
