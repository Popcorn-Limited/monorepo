import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { ACLRegistry, ContractRegistry, GovStaking, MockERC20, StakingDefendedHelper } from "../../typechain";
import { RewardsEscrow } from "../../typechain/RewardsEscrow";

let stakingFund: BigNumber;

let owner: SignerWithAddress, rewarder: SignerWithAddress, nonOwner: SignerWithAddress;

let mockERC20Factory;
let mockPop: MockERC20;
let staking: GovStaking;
let defendedHelper: StakingDefendedHelper;
let aclRegistry: ACLRegistry;
let contractRegistry: ContractRegistry;
let rewardsEscrow: RewardsEscrow;
const DAY = 86400;

describe.skip("Staking", function () {
  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();
    mockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockPop = (await mockERC20Factory.deploy("TestPOP", "TPOP", 18)) as MockERC20;
    await mockPop.mint(owner.address, parseEther("1000000"));
    await mockPop.mint(nonOwner.address, parseEther("10"));

    aclRegistry = await (await (await ethers.getContractFactory("ACLRegistry")).deploy()).deployed();

    contractRegistry = await (
      await (await ethers.getContractFactory("ContractRegistry")).deploy(aclRegistry.address)
    ).deployed();

    rewardsEscrow = await (await (await ethers.getContractFactory("RewardsEscrow")).deploy(mockPop.address)).deployed();

    const stakingFactory = await ethers.getContractFactory("GovStaking");
    staking = await stakingFactory.deploy(contractRegistry.address);
    await staking.deployed();

    await rewardsEscrow.addAuthorizedContract(staking.address);

    await aclRegistry.connect(owner).grantRole(ethers.utils.id("DAO"), owner.address);
    await aclRegistry.connect(owner).grantRole(ethers.utils.id("ApprovedContract"), owner.address);

    await contractRegistry.connect(owner).addContract(ethers.utils.id("POP"), mockPop.address, ethers.utils.id("1"));
    await contractRegistry
      .connect(owner)
      .addContract(ethers.utils.id("RewardsEscrow"), rewardsEscrow.address, ethers.utils.id("1"));
    await contractRegistry
      .connect(owner)
      .addContract(ethers.utils.id("Staking"), staking.address, ethers.utils.id("1"));
    await contractRegistry
      .connect(owner)
      .addContract(ethers.utils.id("RewardsManager"), rewarder.address, ethers.utils.id("1"));

    stakingFund = parseEther("10");
    await mockPop.transfer(staking.address, stakingFund);
    await mockPop.connect(owner).approve(staking.address, parseEther("100000"));

    const StakingDefendedHelper = await ethers.getContractFactory("StakingDefendedHelper");
    defendedHelper = await (await StakingDefendedHelper.deploy(mockPop.address, staking.address)).deployed();

    await mockPop.mint(defendedHelper.address, parseEther("1000"));
  });

  describe("stake", function () {
    it("should reject zero amount", async function () {
      await expect(staking.stake(0, 7 * DAY)).to.be.revertedWith("amount must be greater than 0");
    });

    it("should lock for at least a week", async function () {
      await expect(staking.stake(1, 7 * DAY - 1)).to.be.revertedWith("must lock tokens for at least 1 week");
    });

    it("should lock at most 4 years", async function () {
      await expect(staking.stake(1, 365 * DAY * 4 + 1)).to.be.revertedWith(
        "must lock tokens for less than/equal to  4 year"
      );
    });

    it("should error on insufficient balance", async function () {
      await expect(staking.stake(parseEther("10000000000"), 7 * DAY)).to.be.revertedWith("insufficient balance");
    });

    it("should not allow non-whitelisted contracts to stake", async function () {
      await expect(defendedHelper.stake(parseEther("1000"))).to.be.revertedWith("Access denied for caller");
    });

    it("should allow whitelisted contracts to stake", async function () {
      await aclRegistry.connect(owner).grantRole(ethers.utils.id("ApprovedContract"), defendedHelper.address);
      await expect(defendedHelper.stake(parseEther("1000")))
        .to.emit(staking, "StakingDeposited")
        .withArgs(defendedHelper.address, parseEther("1000"));
    });

    it("should lock funds successfully", async function () {
      const amount = parseEther("10000");
      const currentBalance = await mockPop.balanceOf(owner.address);
      await expect(staking.connect(owner).stake(amount, 7 * DAY))
        .to.emit(staking, "StakingDeposited")
        .withArgs(owner.address, amount);
      expect(await mockPop.balanceOf(staking.address)).to.equal(stakingFund.add(amount));
      expect(await mockPop.balanceOf(owner.address)).to.equal(currentBalance.sub(amount));
      expect(await staking.getVoiceCredits(owner.address)).to.equal(parseEther("47.945205479452054794"));
    });
    it("should update locked balances when staking", async () => {
      const amount = parseEther("10");
      await mockPop.approve(staking.address, amount);

      await staking.connect(owner).stake(amount, 7 * DAY);
      const lockedBalance = await staking.lockedBalances(owner.address);
      expect(lockedBalance.balance).to.equal(parseEther("10"));
    });
  });

  describe("withdraw", function () {
    it("should reject zero amount", async function () {
      await expect(staking.withdraw(0)).to.be.revertedWith("amount must be greater than 0");
    });

    it("should reject insufficient balance", async function () {
      await expect(staking.withdraw(parseEther("1000"))).to.be.revertedWith("insufficient balance");
    });

    it("should release funds successfully", async function () {
      const amount = parseEther("1");
      await staking.connect(owner).stake(amount, 7 * DAY);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine", []);
      expect(await staking.connect(owner).withdraw(amount))
        .to.emit(staking, "StakingWithdrawn")
        .withArgs(owner.address, amount);
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(0);
      expect(await staking.getVoiceCredits(owner.address)).to.equal(0);
    });

    it("should release funds and rewards successfully when exiting", async function () {
      const amount = parseEther("2");
      await staking.connect(owner).notifyRewardAmount(stakingFund);
      await staking.connect(owner).stake(amount, 7 * DAY);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine", []);
      const amountEarned = await staking.earned(owner.address);
      const payout = amountEarned.div(BigNumber.from("3"));
      expect(await staking.connect(owner).exit())
        .to.emit(staking, "StakingWithdrawn")
        .withArgs(owner.address, amount)
        .to.emit(staking, "RewardPaid")
        .withArgs(owner.address, payout);
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(0);
      expect(await staking.getVoiceCredits(owner.address)).to.equal(0);
      expect(await staking.earned(owner.address)).to.equal(0);
    });
  });

  describe("rewards", function () {
    it("should pay out rewards successfully", async function () {
      const amount = parseEther("1");
      await staking.connect(owner).notifyRewardAmount(stakingFund);
      await staking.connect(owner).stake(amount, 7 * DAY);
      ethers.provider.send("evm_increaseTime", [700000]);
      ethers.provider.send("evm_mine", []);
      const amountEarned = await staking.earned(owner.address);
      const payout = amountEarned.div(BigNumber.from("3"));
      const popBalance = await mockPop.balanceOf(owner.address);
      const result = await staking.connect(owner).getReward();
      expect(result).to.emit(staking, "RewardPaid").withArgs(owner.address, payout);
      expect(await mockPop.balanceOf(owner.address)).to.equal(popBalance.add(payout));
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(parseEther("1"));
      expect(await staking.earned(owner.address)).to.equal(0);
    });

    it("lowers the reward rate when more user stake", async function () {
      const amount = parseEther("1");
      await staking.connect(owner).notifyRewardAmount(stakingFund);
      await staking.connect(owner).stake(amount, 7 * DAY);
      await mockPop.connect(nonOwner).approve(staking.address, amount);
      await staking.connect(nonOwner).stake(amount, 7 * DAY);
      ethers.provider.send("evm_increaseTime", [7 * DAY]);
      ethers.provider.send("evm_mine", []);
      expect(await staking.earned(owner.address)).to.equal(parseEther("5.000008267195605595"));
      expect(await staking.earned(nonOwner.address)).to.equal(parseEther("4.999975198412536813"));
    });
  });

  describe("increaseTimeLock", function () {
    const amount = parseEther("1");
    it("should lock for at least a week", async function () {
      await staking.connect(owner).stake(amount, 7 * DAY);
      await expect(staking.increaseLock(7 * DAY - 1)).to.be.revertedWith("must lock tokens for at least 1 week");
    });

    it("should lock at most 4 years", async function () {
      await staking.connect(owner).stake(amount, 7 * DAY);
      await expect(staking.increaseLock(86400 * (365 * 4) + 1)).to.be.revertedWith(
        "must lock tokens for less than/equal to  4 year"
      );
    });

    it("should not increase lock time if there is no lockedBalance", async function () {
      await expect(staking.increaseLock(7 * DAY)).to.be.revertedWith("no lockedBalance exists");
    });

    it("should not increase lock time if there lockedBalance can be withdrawn", async function () {
      await staking.connect(owner).stake(amount, 7 * DAY);
      ethers.provider.send("evm_increaseTime", [7 * DAY]);
      ethers.provider.send("evm_mine", []);
      await expect(staking.increaseLock(7 * DAY)).to.be.revertedWith("withdraw balance first");
    });

    it("should increase locktime", async function () {
      await staking.connect(owner).stake(amount, 7 * DAY);
      ethers.provider.send("evm_increaseTime", [302400]);
      ethers.provider.send("evm_mine", []);
      await staking.connect(owner).increaseLock(7 * DAY);
      ethers.provider.send("evm_increaseTime", [302400]);
      ethers.provider.send("evm_mine", []);
      await expect(staking.getVoiceCredits(owner.address)).to.not.equal(0);
      ethers.provider.send("evm_increaseTime", [7 * DAY]);
      ethers.provider.send("evm_mine", []);
      const voice = await staking.getVoiceCredits(owner.address);
      await expect(voice).to.equal("0");
    });
  });

  describe("increaseStake", function () {
    let userVoiceCreditsBefore;
    let totalVoiceCreditsBefore;
    beforeEach(async () => {
      userVoiceCreditsBefore = await staking.connect(owner).getVoiceCredits(owner.address);
      totalVoiceCreditsBefore = await staking.totalVoiceCredits();
      await staking.connect(owner).stake(amount, 7 * DAY);
    });

    const amount = parseEther("1");
    it("should reject zero amount", async function () {
      await expect(staking.increaseStake(0)).to.be.revertedWith("amount must be greater than 0");
    });

    it("should error on insufficient balance", async function () {
      await expect(staking.increaseStake(parseEther("1000000000000"))).to.be.revertedWith("insufficient balance");
    });

    it("should error if there is no locked stake", async function () {
      await expect(staking.connect(nonOwner).increaseStake(parseEther("10"))).to.be.revertedWith(
        "no lockedBalance exists"
      );
    });

    it("should error if locked stake can be withdrawn", async function () {
      ethers.provider.send("evm_increaseTime", [7 * DAY]);
      ethers.provider.send("evm_mine", []);
      await expect(staking.increaseStake(parseEther("10"))).to.be.revertedWith("withdraw balance first");
    });

    it("should increase stake", async function () {
      ethers.provider.send("evm_increaseTime", [302400]);
      ethers.provider.send("evm_mine", []);
      await staking.connect(owner).increaseStake(amount);
      ethers.provider.send("evm_increaseTime", [302400]);
      ethers.provider.send("evm_mine", []);
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(amount.add(amount));
    });
    it("should increase user's voice credits after staking", async () => {
      const userVoiceCreditsAfter = await staking.connect(owner).getVoiceCredits(owner.address);
      expect(userVoiceCreditsAfter.gt(userVoiceCreditsBefore)).to.be.true;
    });
    it("should update total voice credits in storage", async () => {
      const afterVoiceCredits = await staking.connect(owner).voiceCredits(owner.address);
      expect(afterVoiceCredits.gt(userVoiceCreditsBefore)).to.be.true;
    });
    it("should update total voice credits", async () => {
      expect((await staking.totalVoiceCredits()).gt(totalVoiceCreditsBefore));
    });
  });

  describe("total voice credits balance", function () {});

  describe("getWithdrawableBalance", function () {
    it("should return total balance", async function () {
      // balance 0 for owner
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(0);
      // owner stakes 1 ether for a week
      await staking.connect(owner).stake(parseEther("1"), 7 * DAY);

      // ~1 week passes
      ethers.provider.send("evm_increaseTime", [600000]);
      ethers.provider.send("evm_mine", []);

      // still balance 0 for owner
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(0);

      // owner stakes 2 ether for 4 weeks
      await staking.connect(owner).increaseStake(parseEther("2"));

      // 1 week passes
      ethers.provider.send("evm_increaseTime", [4800]);
      ethers.provider.send("evm_mine", []);

      // balance of 3 either available for withdraw
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(parseEther("3"));

      // withdraws a partial balance of 0.7 ether
      await staking.connect(owner).withdraw(parseEther("0.7"));
      // balance of 2.3 either available for withdraw
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(parseEther("2.3"));

      // withdraws a partial balance of 2 ether
      await staking.connect(owner).withdraw(parseEther("2"));
      // balance of 0.3 either available for withdraw
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(parseEther("0.3"));

      // withdraws remaining balance of 0.3 ether
      await staking.connect(owner).withdraw(parseEther("0.3"));
      // balance of 0 either available for withdraw
      expect(await staking.getWithdrawableBalance(owner.address)).to.equal(0);
    });
  });

  describe("getVoiceCredits", function () {
    const timeTravel = async (time?: number) => {
      ethers.provider.send("evm_increaseTime", [time || 1 * DAY]);
      ethers.provider.send("evm_mine", []);
    };
    const getExpectedVoiceCredits = async (address) => {
      const timestamp = (await ethers.provider.getBlock(ethers.provider.getBlockNumber())).timestamp;
      const { end, balance } = await staking.lockedBalances(address);
      if (end.eq(0) || end.lt(timestamp) || balance.eq(0)) {
        return BigNumber.from(0);
      }
      const timeTillEnd = end
        .sub(timestamp)
        .div(60 * 60)
        .mul(60 * 60);
      return balance.mul(timeTillEnd).div(4 * 365 * DAY);
    };

    it("should return decayed voice credits", async function () {
      await staking.connect(owner).stake(parseEther("1"), 7 * DAY);

      const voiceCredits0 = await staking.getVoiceCredits(owner.address);
      //1 days passes
      await timeTravel(1 * DAY);
      const voiceCredits1 = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits1.lt(voiceCredits0)).to.be.true;
      expect(voiceCredits1).to.equal(await getExpectedVoiceCredits(owner.address));
      await timeTravel(1 * DAY);
      const voiceCredits2 = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits2.lt(voiceCredits1)).to.be.true;
      expect(voiceCredits2).to.equal(await getExpectedVoiceCredits(owner.address));
      await timeTravel(1 * DAY);
      const voiceCredits3 = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits3.lt(voiceCredits2)).to.be.true;
      expect(voiceCredits3).to.equal(await getExpectedVoiceCredits(owner.address));
      await timeTravel(1 * DAY);
      const voiceCredits4 = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits4.lt(voiceCredits3)).to.be.true;
      expect(voiceCredits4).to.equal(await getExpectedVoiceCredits(owner.address));
    });
    it("decays voice credits linearly on large time scales as well", async function () {
      await staking.connect(owner).stake(parseEther("10"), 7 * DAY * 78);
      const voiceCredits0 = await staking.getVoiceCredits(owner.address);

      await timeTravel(7 * DAY * 39);
      const voiceCredits1 = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits1.lt(voiceCredits0)).to.be.true;
      expect(voiceCredits1.gt(0)).to.be.true;
      expect(voiceCredits1).to.equal(await getExpectedVoiceCredits(owner.address));

      await timeTravel(7 * DAY * 79);
      const voiceCredits2 = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits2.lt(voiceCredits1)).to.be.true;
      expect(voiceCredits2).to.equal(0);
    });
    it("should return 0 voice credits after lockperiod ended", async function () {
      await staking.connect(owner).stake(parseEther("1"), 7 * DAY);
      ethers.provider.send("evm_increaseTime", [7 * DAY]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits.toString()).to.equal("0");
    });
    it("should round voice credit decay by the hour", async function () {
      await staking.connect(owner).stake(parseEther("1"), 7 * DAY);
      ethers.provider.send("evm_increaseTime", [1000]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits0 = await staking.getVoiceCredits(owner.address);
      ethers.provider.send("evm_increaseTime", [1000]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits1 = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits0).to.equal(voiceCredits1);
      ethers.provider.send("evm_increaseTime", [2000]);
      ethers.provider.send("evm_mine", []);
      const voiceCredits2 = await staking.getVoiceCredits(owner.address);
      expect(voiceCredits0 > voiceCredits2).to.equal(true);
    });
  });

  describe("notifyRewardAmount", function () {
    it("should set rewards", async function () {
      expect(await staking.connect(owner).getRewardForDuration()).to.equal(0);
      await staking.notifyRewardAmount(stakingFund);
      expect(await staking.connect(owner).getRewardForDuration()).to.equal(parseEther("9.999999999999676800"));
    });

    it("should revert if not owner", async function () {
      await expect(staking.connect(nonOwner).notifyRewardAmount(stakingFund)).to.be.revertedWith("Not allowed");
    });

    it("should be able to increase rewards", async function () {
      await staking.notifyRewardAmount(parseEther("5"));
      expect(await staking.connect(owner).getRewardForDuration()).to.equal(parseEther("4.999999999999536000"));
      await staking.notifyRewardAmount(parseEther("5"));
      expect(await staking.connect(owner).getRewardForDuration()).to.equal(parseEther("9.999991732803408000"));
    });
  });

  describe("updatePeriodFinish", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("GovStaking");
      staking = await Staking.deploy(contractRegistry.address);
      await staking.deployed();
      stakingFund = parseEther("10");
      await mockPop.approve(staking.address, stakingFund);
      await staking.notifyRewardAmount(stakingFund);
    });
    it("should increase staking period", async function () {
      const periodFinish = await staking.periodFinish();
      await staking.connect(owner).updatePeriodFinish(periodFinish.add(7 * DAY));
      await expect(await staking.periodFinish()).to.equal(periodFinish.add(7 * DAY));
    });
    it("should decrease staking period", async function () {
      const periodFinish = await staking.periodFinish();
      await staking.connect(owner).updatePeriodFinish(periodFinish.sub(300000));
      await expect(await staking.periodFinish()).to.equal(periodFinish.sub(300000));
    });
    it("should not be able to set finish time before now", async function () {
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      const currentBlock = await ethers.provider._getBlock(currentBlockNumber);
      await expect(staking.updatePeriodFinish(currentBlock.timestamp)).to.revertedWith("timestamp cant be in the past");
    });
  });
});
