import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";
import { DAO_ROLE, KEEPER_ROLE, INCENTIVE_MANAGER_ROLE } from "../lib/acl/roles";
import { expectRevert, expectValue, expectEvent, expectStruct } from "../lib/utils/expectValue";
import { DAYS, timeTravel } from "../lib/utils/test";
import { getIncentiveAccountId } from "../lib/adapters/KeeperIncentives/getIncentiveAccountId";
import {
  getBalances,
  getKeeperClaimableBalances,
  getKeeperClaimableTokenBalance,
} from "../lib/adapters/KeeperIncentives/getKeeperBalances";
import {
  ContractRegistry,
  KeeperIncentiveV2,
  KeeperIncentiveHelper,
  MockERC20,
  PopLocker,
  RewardsEscrow,
  ACLRegistry,
} from "../typechain";

import { BigNumber } from "ethers";

interface Contracts {
  mockPop: MockERC20;
  rewardToken: MockERC20;
  contractRegistry: ContractRegistry;
  aclRegistry: ACLRegistry;
  keeperIncentive: KeeperIncentiveV2;
  keeperIncentiveHelper: KeeperIncentiveHelper;
  rewardsEscrow: RewardsEscrow;
  staking: PopLocker;
}

let deployTimestamp: number, keeper: SignerWithAddress, manager: SignerWithAddress, contracts: Contracts;

const incentive = parseEther("10");

async function deployContracts(): Promise<Contracts> {
  const mockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockPop = (await (
    await mockERC20Factory.connect(manager).deploy("TestPOP", "TPOP", 18)
  ).deployed()) as MockERC20;
  const rewardToken = (await (
    await mockERC20Factory.connect(manager).deploy("RewardToken", "RT", 18)
  ).deployed()) as MockERC20;
  await mockPop.mint(keeper.address, parseEther("2100"));
  await mockPop.mint(manager.address, parseEther("100"));
  await rewardToken.mint(keeper.address, parseEther("2100"));
  await rewardToken.mint(manager.address, parseEther("100"));
  const popLockerFactory = await ethers.getContractFactory("PopLocker");
  const rewardsEscrow = (await (
    await (await ethers.getContractFactory("RewardsEscrow")).deploy(mockPop.address)
  ).deployed()) as RewardsEscrow;

  const aclRegistry = await (
    await (await ethers.getContractFactory("ACLRegistry")).connect(manager).deploy()
  ).deployed();

  const contractRegistry = await (
    await (await ethers.getContractFactory("ContractRegistry")).connect(manager).deploy(aclRegistry.address)
  ).deployed();

  const keeperIncentive = await (
    await (await ethers.getContractFactory("KeeperIncentiveV2"))
      .connect(manager)
      .deploy(contractRegistry.address, parseEther("0.25"), parseEther("2000"))
  ).deployed();

  const staking = (await popLockerFactory.connect(manager).deploy(mockPop.address, rewardsEscrow.address)) as PopLocker;
  await staking.deployed();

  deployTimestamp = (await waffle.provider.getBlock("latest")).timestamp + 1;
  const keeperIncentiveHelper = await (
    await (await ethers.getContractFactory("KeeperIncentiveHelper")).deploy(keeperIncentive.address)
  ).deployed();
  await aclRegistry.connect(manager).grantRole(DAO_ROLE, manager.address);
  await aclRegistry.connect(manager).grantRole(INCENTIVE_MANAGER_ROLE, manager.address);
  await aclRegistry.connect(manager).grantRole(KEEPER_ROLE, keeper.address);

  await contractRegistry.connect(manager).addContract(ethers.utils.id("POP"), mockPop.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(manager)
    .addContract(ethers.utils.id("PopLocker"), staking.address, ethers.utils.id("1"));

  // incentive 0 created with 10 Eth reward
  await keeperIncentive
    .connect(manager)
    .createIncentive(keeperIncentiveHelper.address, incentive, true, false, mockPop.address, 1, 0);

  await mockPop.connect(manager).approve(keeperIncentive.address, parseEther("100000"));
  await mockPop.connect(manager).approve(keeperIncentiveHelper.address, parseEther("100000"));
  await mockPop.connect(keeper).approve(staking.address, parseEther("100000"));
  await rewardToken.connect(manager).approve(keeperIncentive.address, parseEther("100000"));
  await rewardToken.connect(manager).approve(keeperIncentiveHelper.address, parseEther("100000"));
  await staking.connect(keeper).lock(keeper.address, parseEther("2000"), 0);
  await timeTravel(7 * DAYS);

  return {
    mockPop,
    rewardToken,
    contractRegistry,
    aclRegistry,
    keeperIncentive,
    keeperIncentiveHelper,
    rewardsEscrow,
    staking,
  };
}

describe("Keeper incentives", function () {
  beforeEach(async function () {
    [keeper, manager] = await ethers.getSigners();
    contracts = await deployContracts();
  });

  const createIncentive = async (rewardAmount: BigNumber, cooldown?: number) => {
    return contracts.keeperIncentive
      .connect(manager)
      .createIncentive(
        contracts.keeperIncentiveHelper.address,
        rewardAmount,
        true,
        false,
        contracts.mockPop.address,
        cooldown || 1,
        0
      );
  };

  const fundIncentive = async (i: number, amount: BigNumber) => {
    await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, amount);
    await contracts.keeperIncentive.connect(manager).fundIncentive(contracts.keeperIncentiveHelper.address, i, amount);
  };

  const runJob = async (incentiveIndex: number) => {
    return contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(incentiveIndex);
  };

  describe("views", async function () {
    beforeEach(async function () {
      const smallIncentive = parseEther("5");
      await createIncentive(smallIncentive);
      await createIncentive(smallIncentive);
      await createIncentive(smallIncentive);
      await createIncentive(smallIncentive.sub(1));
      await createIncentive(smallIncentive);
      await fundIncentive(0, parseEther("10"));
      await fundIncentive(1, parseEther("10"));
      await fundIncentive(2, parseEther("10"));
      await fundIncentive(3, parseEther("10"));
      await fundIncentive(4, parseEther("10"));
      await fundIncentive(5, parseEther("5"));
      await runJob(0);
      await runJob(1);
      await runJob(2);
      await runJob(3);
      await runJob(4);
      await runJob(5);
    });

    it("returns keeper incentives account balances", async () => {
      const balances = await getBalances(contracts.keeperIncentive, keeper.address, contracts.mockPop.address);

      await expectValue(balances[0].rewardToken, contracts.mockPop.address);
      await expectValue(balances[1].rewardToken, contracts.mockPop.address);
      await expectValue(balances[2].rewardToken, contracts.mockPop.address);
      await expectValue(balances[3].rewardToken, contracts.mockPop.address);
      await expectValue(balances[4].rewardToken, contracts.mockPop.address);
      await expectValue(balances[5].rewardToken, contracts.mockPop.address);

      await expectValue(balances[0].amount, parseEther("7.5"));
      await expectValue(balances[1].amount, parseEther("3.75"));
      await expectValue(balances[2].amount, parseEther("3.75"));
      await expectValue(balances[3].amount, parseEther("3.75"));
      await expectValue(balances[4].amount, parseEther("3.75"));
      await expectValue(balances[5].amount, parseEther("3.75"));

      await expectValue(
        balances[0].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address)
      );
      await expectValue(
        balances[1].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address)
      );
      await expectValue(
        balances[2].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 2, contracts.mockPop.address)
      );
      await expectValue(
        balances[3].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 3, contracts.mockPop.address)
      );
      await expectValue(
        balances[4].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 4, contracts.mockPop.address)
      );
      await expectValue(
        balances[5].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 5, contracts.mockPop.address)
      );
    });

    it("returns keeper accounts", async () => {
      const keeperAccountsCount = (await contracts.keeperIncentive.getAccounts(keeper.address)).length;
      const accounts = [];
      for (let i = 0; i < keeperAccountsCount; i++) {
        accounts.push(await contracts.keeperIncentive.keeperAccounts(keeper.address, i));
      }
      await expectStruct(accounts, [
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address),
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 2, contracts.mockPop.address),
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 3, contracts.mockPop.address),
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 4, contracts.mockPop.address),
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 5, contracts.mockPop.address),
      ]);
    });

    it("returns incentive account balances", async () => {
      const balances = await getBalances(
        contracts.keeperIncentive,
        contracts.keeperIncentive.address,
        contracts.mockPop.address
      );

      await expectValue(balances[0].rewardToken, contracts.mockPop.address);
      await expectValue(balances[1].rewardToken, contracts.mockPop.address);
      await expectValue(balances[2].rewardToken, contracts.mockPop.address);
      await expectValue(balances[3].rewardToken, contracts.mockPop.address);
      await expectValue(balances[4].rewardToken, contracts.mockPop.address);
      await expectValue(balances[5].rewardToken, contracts.mockPop.address);

      await expectValue(balances[0].amount, parseEther("0"));
      await expectValue(balances[1].amount, parseEther("5"));
      await expectValue(balances[2].amount, parseEther("5"));
      await expectValue(balances[3].amount, parseEther("5"));
      await expectValue(balances[4].amount, parseEther("5.000000000000000001"));
      await expectValue(balances[5].amount, parseEther("0"));

      await expectValue(
        balances[0].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address)
      );
      await expectValue(
        balances[1].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address)
      );
      await expectValue(
        balances[2].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 2, contracts.mockPop.address)
      );
      await expectValue(
        balances[3].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 3, contracts.mockPop.address)
      );
      await expectValue(
        balances[4].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 4, contracts.mockPop.address)
      );
      await expectValue(
        balances[5].account,
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 5, contracts.mockPop.address)
      );
    });

    it("returns claimable keeper balance", async () => {
      const [account0, account1, account2, account3, account4, account5] = await getKeeperClaimableBalances(
        contracts.keeperIncentive,
        keeper.address
      );

      await expectStruct(account0, {
        rewardToken: contracts.mockPop.address,
        amount: parseEther("7.5"),
        account: getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address),
      });
      await expectStruct(account1, {
        rewardToken: contracts.mockPop.address,
        amount: parseEther("3.75"),
        account: getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
      });
      await expectStruct(account2, {
        rewardToken: contracts.mockPop.address,
        amount: parseEther("3.75"),
        account: getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 2, contracts.mockPop.address),
      });
      await expectStruct(account3, {
        rewardToken: contracts.mockPop.address,
        amount: parseEther("3.75"),
        account: getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 3, contracts.mockPop.address),
      });
      await expectStruct(account4, {
        rewardToken: contracts.mockPop.address,
        amount: parseEther("3.75"),
        account: getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 4, contracts.mockPop.address),
      });
      await expectStruct(account5, {
        rewardToken: contracts.mockPop.address,
        amount: parseEther("3.75"),
        account: getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 5, contracts.mockPop.address),
      });
    });

    it("returns keeper account balances", async () => {
      const keeperAccountBalances = await getKeeperClaimableBalances(contracts.keeperIncentive, keeper.address);

      for (let i = 0; i < keeperAccountBalances.length; i++) {
        await expectValue(keeperAccountBalances[i].rewardToken, contracts.mockPop.address);
        await expectValue(
          keeperAccountBalances[i].account,
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, i, contracts.mockPop.address)
        );
      }
      await expectValue(keeperAccountBalances[0].amount, parseEther("7.5"));
      await expectValue(keeperAccountBalances[1].amount, parseEther("3.75"));
      await expectValue(keeperAccountBalances[2].amount, parseEther("3.75"));
      await expectValue(keeperAccountBalances[3].amount, parseEther("3.75"));
      await expectValue(keeperAccountBalances[4].amount, parseEther("3.75"));
      await expectValue(keeperAccountBalances[5].amount, parseEther("3.75"));
    });
  });

  it("functions should only be available for Governance", async function () {
    await expectRevert(
      contracts.keeperIncentive
        .connect(keeper)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          incentive,
          true,
          false,
          contracts.mockPop.address,
          1,
          0
        ),
      "you dont have the right role"
    );
    await expectRevert(
      contracts.keeperIncentive
        .connect(keeper)
        .updateIncentive(
          contracts.keeperIncentiveHelper.address,
          0,
          incentive,
          true,
          false,
          contracts.mockPop.address,
          1,
          0
        ),
      "you dont have the right role"
    );
    await expectRevert(
      contracts.keeperIncentive.connect(keeper).toggleApproval(contracts.keeperIncentiveHelper.address, 0),
      "you dont have the right role"
    );
    await expectRevert(
      contracts.keeperIncentive.connect(keeper).toggleIncentive(contracts.keeperIncentiveHelper.address, 0),
      "you dont have the right role"
    );
  });

  it("should revert if burn percentage too high", async function () {
    const defaultBurnPercentageBefore = await contracts.keeperIncentive.defaultBurnPercentage();
    await expectRevert(
      contracts.keeperIncentive.connect(manager).updateBurnPercentage(parseEther("2")),
      "burn percentage too high"
    );
    await expectValue(await contracts.keeperIncentive.defaultBurnPercentage(), defaultBurnPercentageBefore);
  });

  it("should adjust the burn percentage", async function () {
    await expectEvent(
      await contracts.keeperIncentive.connect(manager).updateBurnPercentage(parseEther("0.1")),
      contracts.keeperIncentive,
      "BurnPercentageChanged",
      [parseEther("0.25"), parseEther("0.1")]
    );
    await expectValue(await contracts.keeperIncentive.defaultBurnPercentage(), parseEther("0.1"));
  });

  it("should adjust the required keeper stake", async function () {
    await expectEvent(
      await contracts.keeperIncentive.connect(manager).updateRequiredKeeperStake(parseEther("100")),
      contracts.keeperIncentive,
      "RequiredKeeperStakeChanged",
      [parseEther("2000"), parseEther("100")]
    );
    await expectValue(await contracts.keeperIncentive.requiredKeeperStake(), parseEther("100"));
  });

  it("should create an incentive", async () => {
    await expectEvent(
      await contracts.keeperIncentive
        .connect(manager)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          incentive,
          true,
          false,
          contracts.mockPop.address,
          1,
          0
        ),
      contracts.keeperIncentive,
      "IncentiveCreated",
      [contracts.keeperIncentiveHelper.address, incentive, false, 1]
    );
    const incentiveStruct = await contracts.keeperIncentive.incentivesByController(
      contracts.keeperIncentiveHelper.address,
      1
    );
    await expectValue(incentiveStruct[0], incentive);
    await expectValue(incentiveStruct[1], true);
    await expectValue(incentiveStruct[2], false);
    const controllerContractList = await contracts.keeperIncentive.getControllerContracts();
    await expectValue(controllerContractList.length, 2);
    await expectValue(controllerContractList[1], contracts.keeperIncentiveHelper.address);
  });

  it("should revert if cooldown not set", async () => {
    await expectRevert(
      contracts.keeperIncentive
        .connect(manager)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          incentive,
          true,
          false,
          contracts.mockPop.address,
          0,
          0
        ),
      "must set cooldown"
    );
    await expectRevert(
      contracts.keeperIncentive.incentivesByController(contracts.keeperIncentiveHelper.address, 1),
      ""
    );
  });

  it("should revert if cooldown not set", async () => {
    await expectRevert(
      contracts.keeperIncentive
        .connect(manager)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          incentive,
          true,
          false,
          ethers.constants.AddressZero,
          1,
          0
        ),
      "must set reward token"
    );
    await expectRevert(
      contracts.keeperIncentive.incentivesByController(contracts.keeperIncentiveHelper.address, 1),
      ""
    );
  });

  it("should revert if burnPercentage set too high", async () => {
    await expectRevert(
      contracts.keeperIncentive
        .connect(manager)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          incentive,
          true,
          false,
          contracts.mockPop.address,
          1,
          parseEther("2")
        ),
      "burn percentage too high"
    );
    await expectRevert(
      contracts.keeperIncentive.incentivesByController(contracts.keeperIncentiveHelper.address, 1),
      ""
    );
  });

  describe("cooldown period", async () => {
    it("should not allow to execute an incentive if the cooldown period is not over", async () => {
      await createIncentive(parseEther("1"), 2 * DAYS);
      await fundIncentive(1, parseEther("5"));
      await runJob(1);
      await timeTravel(1 * DAYS);

      await expectRevert(runJob(1), "wait for cooldown period");
    });

    it("should not allow one to drain a contract with cooldown", async () => {
      await contracts.keeperIncentive.connect(manager).updateBurnPercentage(0);
      await createIncentive(parseEther("1"), 2 * DAYS);
      await fundIncentive(1, parseEther("5"));
      await runJob(1);
      await timeTravel(1 * DAYS);

      await expectRevert(runJob(1), "wait for cooldown period");
      await expectValue(
        await getKeeperClaimableTokenBalance(contracts.keeperIncentive, keeper.address, contracts.mockPop.address),
        parseEther("1")
      );
    });
  });

  describe("change incentives", function () {
    it("should change the whole incentive", async function () {
      await expectEvent(
        await contracts.keeperIncentive
          .connect(manager)
          .updateIncentive(
            contracts.keeperIncentiveHelper.address,
            0,
            parseEther("100"),
            false,
            true,
            contracts.mockPop.address,
            1,
            0
          ),
        contracts.keeperIncentive,
        "IncentiveChanged",
        [
          contracts.keeperIncentiveHelper.address,
          incentive,
          parseEther("100"),
          false,
          true,
          contracts.mockPop.address,
          contracts.mockPop.address,
          1,
          1,
          parseEther(".25"),
          parseEther(".25"),
          0,
        ]
      );
      const incentiveStruct = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectValue(incentiveStruct.reward, parseEther("100"));
      await expectValue(incentiveStruct.openToEveryone, true);
      await expectValue(incentiveStruct.enabled, false);
    });

    it("should revert if no cooldown", async function () {
      const incentiveStructBefore = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectRevert(
        contracts.keeperIncentive
          .connect(manager)
          .updateIncentive(
            contracts.keeperIncentiveHelper.address,
            0,
            parseEther("100"),
            false,
            true,
            contracts.mockPop.address,
            0,
            0
          ),
        "must set cooldown"
      );
      const incentiveStruct = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectValue(incentiveStruct.cooldown, incentiveStructBefore.cooldown);
    });

    it("should revert if no rewardToken", async function () {
      const incentiveStructBefore = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectRevert(
        contracts.keeperIncentive
          .connect(manager)
          .updateIncentive(
            contracts.keeperIncentiveHelper.address,
            0,
            parseEther("100"),
            false,
            true,
            ethers.constants.AddressZero,
            1,
            0
          ),
        "must set reward token"
      );
      const incentiveStruct = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectValue(incentiveStruct.rewardToken, incentiveStructBefore.rewardToken);
    });

    it("should revert if burn percentage too high", async function () {
      const incentiveStructBefore = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectRevert(
        contracts.keeperIncentive
          .connect(manager)
          .updateIncentive(
            contracts.keeperIncentiveHelper.address,
            0,
            parseEther("100"),
            false,
            true,
            contracts.mockPop.address,
            1,
            parseEther("2")
          ),
        "burn percentage too high"
      );
      const incentiveStruct = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectValue(incentiveStruct.burnPercentage, incentiveStructBefore.burnPercentage);
    });

    it("should toggle if the incentive is enabled", async function () {
      await expectEvent(
        await contracts.keeperIncentive.connect(manager).toggleIncentive(contracts.keeperIncentiveHelper.address, 0),
        contracts.keeperIncentive,
        "IncentiveToggled",
        [contracts.keeperIncentiveHelper.address, false]
      );
      let incentiveStruct = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectValue(incentiveStruct[0], incentive);
      await expectValue(incentiveStruct[1], false);
      await expectValue(incentiveStruct[2], false);

      await expectEvent(
        await contracts.keeperIncentive.connect(manager).toggleIncentive(contracts.keeperIncentiveHelper.address, 0),
        contracts.keeperIncentive,
        "IncentiveToggled",
        [contracts.keeperIncentiveHelper.address, true]
      );
      incentiveStruct = await contracts.keeperIncentive.incentivesByController(
        contracts.keeperIncentiveHelper.address,
        0
      );
      await expectValue(incentiveStruct[0], incentive);
      await expectValue(incentiveStruct[1], true);
      await expectValue(incentiveStruct[2], false);
    });

    it("should fund incentives", async function () {
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, incentive);
      await expectEvent(
        await contracts.keeperIncentive
          .connect(manager)
          .fundIncentive(contracts.keeperIncentiveHelper.address, 0, incentive),
        contracts.keeperIncentive,
        "IncentiveFunded",
        [incentive, contracts.mockPop.address, incentive]
      );

      await expectValue(await contracts.mockPop.balanceOf(contracts.keeperIncentive.address), incentive);
      const account = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address),
        contracts.keeperIncentive.address
      );
      await expectValue(account.balance, incentive);
    });

    it("should revert funding if incentive does not exist", async function () {
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, incentive);
      await expectRevert(
        contracts.keeperIncentive.connect(manager).fundIncentive(contracts.keeperIncentiveHelper.address, 1, incentive),
        "incentive does not exist"
      );
    });

    it("should revert funding if no amount sent", async function () {
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, incentive);
      await expectRevert(
        contracts.keeperIncentive.connect(manager).fundIncentive(contracts.keeperIncentiveHelper.address, 1, 0),
        "must send amount"
      );
    });

    context("approval", function () {
      it("should toggle approval", async function () {
        await expectEvent(
          await contracts.keeperIncentive.connect(manager).toggleApproval(contracts.keeperIncentiveHelper.address, 0),
          contracts.keeperIncentive,
          "ApprovalToggled",
          [contracts.keeperIncentiveHelper.address, true]
        );
        let incentiveStruct = await contracts.keeperIncentive.incentivesByController(
          contracts.keeperIncentiveHelper.address,
          0
        );
        await expectValue(incentiveStruct[0], incentive);
        await expectValue(incentiveStruct[1], true);
        await expectValue(incentiveStruct[2], true);

        await expectEvent(
          await contracts.keeperIncentive.connect(manager).toggleApproval(contracts.keeperIncentiveHelper.address, 0),
          contracts.keeperIncentive,
          "ApprovalToggled",
          [contracts.keeperIncentiveHelper.address, false]
        );
        incentiveStruct = await contracts.keeperIncentive.incentivesByController(
          contracts.keeperIncentiveHelper.address,
          0
        );
        await expectValue(incentiveStruct[0], incentive);
        await expectValue(incentiveStruct[1], true);
        await expectValue(incentiveStruct[2], false);
      });
    });
  });

  describe("call incentivized functions", function () {
    it("should pay out keeper incentive rewards", async function () {
      const fundAmount = parseEther("100");
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);
      await contracts.keeperIncentive
        .connect(manager)
        .fundIncentive(contracts.keeperIncentiveHelper.address, 0, fundAmount);

      let hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, false);

      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );
      hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, true);

      const keeperAccount = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address),
        keeper.address
      );

      await expectValue(keeperAccount.balance, parseEther("10").mul(3).div(4));
    });

    it("should pay out keeper incentive tips", async function () {
      const tipAmount = parseEther("15");
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentiveHelper.address, tipAmount);

      let hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, false);

      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );
      await expectEvent(
        await contracts.keeperIncentiveHelper
          .connect(manager)
          .tipIncentive(contracts.mockPop.address, keeper.address, 0, tipAmount),
        contracts.keeperIncentiveHelper,
        "Tipped",
        [manager.address]
      );
      hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, true);

      const keeperAccount = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address),
        keeper.address
      );

      await expectValue(keeperAccount.balance, tipAmount);
    });

    it("should revert tip if not controller contract", async function () {
      const tipAmount = parseEther("10");
      const [, , random] = await ethers.getSigners();
      await contracts.mockPop.connect(random).approve(contracts.keeperIncentive.address, tipAmount);
      await expectRevert(
        contracts.keeperIncentive.connect(random).tip(contracts.mockPop.address, keeper.address, 0, tipAmount),
        "must be controller contract"
      );
    });

    it("should revert tip if no amount sent", async function () {
      const tipAmount = parseEther("10");
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, tipAmount);
      await expectRevert(
        contracts.keeperIncentive.connect(manager).tip(contracts.mockPop.address, keeper.address, 0, 0),
        "must send amount"
      );
    });

    it("should pay out keeper incentive rewards and tips", async function () {
      const fundAmount = parseEther("100");
      const tipAmount = parseEther("15");
      const rewardAmount = parseEther("10");
      await contracts.mockPop.mint(manager.address, fundAmount.add(tipAmount));
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, fundAmount.add(tipAmount));
      await contracts.keeperIncentive.connect(manager).updateBurnPercentage(0);
      await contracts.keeperIncentive
        .connect(manager)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          rewardAmount,
          true,
          false,
          contracts.mockPop.address,
          1,
          0
        );
      await contracts.keeperIncentive
        .connect(manager)
        .fundIncentive(contracts.keeperIncentiveHelper.address, 1, fundAmount);

      let hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, false);

      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(1),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );
      await expectEvent(
        await contracts.keeperIncentiveHelper
          .connect(manager)
          .tipIncentive(contracts.mockPop.address, keeper.address, 1, tipAmount),
        contracts.keeperIncentiveHelper,
        "Tipped",
        [manager.address]
      );
      hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, true);

      const keeperAccount = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
        keeper.address
      );

      await expectValue(keeperAccount.balance, rewardAmount.add(tipAmount));
    });

    it("should pay out keeper incentive rewards and tips in different tokens", async function () {
      const fundAmount = parseEther("100");
      const tipAmount = parseEther("15");
      const rewardAmount = parseEther("10");
      await contracts.keeperIncentive.connect(manager).updateBurnPercentage(0);
      await contracts.keeperIncentive
        .connect(manager)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          rewardAmount,
          true,
          false,
          contracts.mockPop.address,
          1,
          0
        );
      await contracts.keeperIncentive
        .connect(manager)
        .fundIncentive(contracts.keeperIncentiveHelper.address, 1, fundAmount);

      let hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, false);

      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(1),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );
      await expectEvent(
        await contracts.keeperIncentiveHelper
          .connect(manager)
          .tipIncentive(contracts.rewardToken.address, keeper.address, 1, tipAmount),
        contracts.keeperIncentiveHelper,
        "Tipped",
        [manager.address]
      );
      hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, true);

      const keeperAccountPop = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
        keeper.address
      );

      const keeperAccountRewardToken = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.rewardToken.address),
        keeper.address
      );

      await expectValue(keeperAccountPop.balance, rewardAmount);
      await expectValue(keeperAccountRewardToken.balance, tipAmount);
    });

    it("should emit an IncentiveTipped event", async function () {
      const tipAmount = parseEther("15");
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentiveHelper.address, tipAmount);
      await expectEvent(
        await contracts.keeperIncentiveHelper
          .connect(manager)
          .tipIncentive(contracts.mockPop.address, keeper.address, 0, tipAmount),
        contracts.keeperIncentive,
        "IncentiveTipped",
        [tipAmount, contracts.mockPop.address]
      );
    });

    it("should pay out keeper incentive rewards for multiple reward tokens", async function () {
      const fundAmount = parseEther("100");
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);

      await contracts.keeperIncentive
        .connect(manager)
        .fundIncentive(contracts.keeperIncentiveHelper.address, 0, fundAmount);

      let hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, false);

      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );
      hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, true);

      const keeperAccount = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address),
        keeper.address
      );

      await expectValue(keeperAccount.balance, parseEther("10").mul(3).div(4));

      // create and fund incentive with different reward token
      await contracts.keeperIncentive
        .connect(manager)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          parseEther("10"),
          true,
          false,
          contracts.rewardToken.address,
          1,
          0
        );
      await contracts.rewardToken.connect(manager).approve(contracts.keeperIncentiveHelper.address, fundAmount);
      await contracts.keeperIncentive
        .connect(manager)
        .fundIncentive(contracts.keeperIncentiveHelper.address, 1, fundAmount);

      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(1),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );
      hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, true);

      const rewardTokenKeeperAccount = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.rewardToken.address),
        keeper.address
      );

      await expectValue(rewardTokenKeeperAccount.balance, parseEther("10"));
    });

    it("should work with legacy function interface", async function () {
      const fundAmount = parseEther("100");
      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);
      await contracts.keeperIncentive
        .connect(manager)
        .fundIncentive(contracts.keeperIncentiveHelper.address, 0, fundAmount);

      let hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, false);

      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunctionLegacy(),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );
      hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
      await expectValue(hasClaimableBalance, true);

      const keeperAccount = await contracts.keeperIncentive.accounts(
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address),
        keeper.address
      );

      await expectValue(keeperAccount.balance, parseEther("10").mul(3).div(4));
    });

    describe("claimableBalances", async () => {
      it("should return a claimable balance", async function () {
        const fundAmount = parseEther("100");
        await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);
        await contracts.keeperIncentive
          .connect(manager)
          .fundIncentive(contracts.keeperIncentiveHelper.address, 0, fundAmount);

        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0);

        const keeperBalances = await getKeeperClaimableBalances(contracts.keeperIncentive, keeper.address);
        await expectValue(keeperBalances.length, 1);

        await expectValue(keeperBalances[0].rewardToken, contracts.mockPop.address);
        await expectValue(keeperBalances[0].amount, parseEther("10").mul(3).div(4));
        await expectValue(
          keeperBalances[0].account,
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address)
        );
      });

      it("should return a claimable balance for multiple reward tokens", async function () {
        const fundAmount = parseEther("100");
        await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);
        await contracts.keeperIncentive
          .connect(manager)
          .fundIncentive(contracts.keeperIncentiveHelper.address, 0, fundAmount);

        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0);
        // create and fund incentive with different reward token
        await contracts.rewardToken.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);
        contracts.keeperIncentive
          .connect(manager)
          .createIncentive(
            contracts.keeperIncentiveHelper.address,
            parseEther("10"),
            true,
            false,
            contracts.rewardToken.address,
            1,
            0
          );
        await contracts.keeperIncentive
          .connect(manager)
          .fundIncentive(contracts.keeperIncentiveHelper.address, 1, fundAmount);

        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(1);

        const keeperBalances = await getKeeperClaimableBalances(contracts.keeperIncentive, keeper.address);
        await expectValue(keeperBalances.length, 2);

        await expectValue(keeperBalances[0].rewardToken, contracts.mockPop.address);
        await expectValue(keeperBalances[0].amount, parseEther("10").mul(3).div(4));
        await expectValue(
          keeperBalances[0].account,
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address)
        );
        await expectValue(keeperBalances[1].rewardToken, contracts.rewardToken.address);
        await expectValue(keeperBalances[1].amount, parseEther("10"));
        await expectValue(
          keeperBalances[1].account,
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.rewardToken.address)
        );
      });

      it("should return all claimable balances for different incentives", async function () {
        const fundAmount = parseEther("50");
        const rewardAmount = parseEther("5");

        await createIncentive(rewardAmount);
        await fundIncentive(1, fundAmount);

        await createIncentive(rewardAmount);
        await fundIncentive(2, fundAmount);

        await runJob(1);
        await runJob(2);

        const keeperBalances = await getKeeperClaimableBalances(contracts.keeperIncentive, keeper.address);
        await expectValue(keeperBalances.length, 2);

        for (let i = 0; i < keeperBalances.length; i++) {
          await expectValue(keeperBalances[i].rewardToken, contracts.mockPop.address);
          await expectValue(keeperBalances[i].amount, rewardAmount.mul(3).div(4));
          await expectValue(
            keeperBalances[i].account,
            getIncentiveAccountId(contracts.keeperIncentiveHelper.address, i + 1, contracts.mockPop.address)
          );
        }
      });
    });
  });

  describe("claimableBalances", async () => {
    it("should add earned balances to unclaimed accounts", async function () {
      const fundAmount = parseEther("10");
      const rewardAmount = parseEther("1");
      await contracts.keeperIncentive.updateBurnPercentage(0);

      await createIncentive(rewardAmount);
      await fundIncentive(1, fundAmount);

      const keeperBalancesBefore = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesBefore, parseEther("0"));
      await runJob(1);
      await runJob(1);
      await runJob(1);
      await runJob(1);

      const keeperBalancesAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesAfter, parseEther("4"));

      await contracts.keeperIncentive
        .connect(keeper)
      ["claim(bytes32[])"]([
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
      ]);

      const keeperBalancesafter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );

      await expectValue(keeperBalancesafter, parseEther("0"));
    });

    it("should revert if nothing to claim", async function () {
      const fundAmount = parseEther("10");
      const rewardAmount = parseEther("1");
      await contracts.keeperIncentive.updateBurnPercentage(0);

      await createIncentive(rewardAmount);
      await fundIncentive(1, fundAmount);

      const keeperBalancesBefore = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesBefore, parseEther("0"));
      await runJob(1);

      const keeperBalancesAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesAfter, parseEther("1"));

      await contracts.keeperIncentive
        .connect(keeper)
      ["claim(bytes32[])"]([
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
      ]);

      const keeperBalancesafter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );

      await expectValue(keeperBalancesafter, parseEther("0"));

      await expectRevert(
        contracts.keeperIncentive
          .connect(keeper)
        ["claim(bytes32[])"]([
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
        ]),
        "nothing to claim"
      );
    });

    it("should add earned balances to unclaimed accounts for multiple reward tokens", async function () {
      const fundAmount = parseEther("10");
      const rewardAmount = parseEther("1");
      await contracts.keeperIncentive.updateBurnPercentage(0);

      await createIncentive(rewardAmount);
      await fundIncentive(1, fundAmount);

      const keeperBalancesBefore = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesBefore, parseEther("0"));
      await runJob(1);
      await runJob(1);
      await runJob(1);
      await runJob(1);

      const keeperBalancesAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesAfter, parseEther("4"));

      await contracts.keeperIncentive
        .connect(keeper)
      ["claim(bytes32[])"]([
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
      ]);

      const keeperBalancesAfterClaim = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );

      await expectValue(keeperBalancesAfterClaim, parseEther("0"));

      // create and fund incentive with different reward token
      await contracts.rewardToken.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);
      contracts.keeperIncentive
        .connect(manager)
        .createIncentive(
          contracts.keeperIncentiveHelper.address,
          rewardAmount,
          true,
          false,
          contracts.rewardToken.address,
          1,
          0
        );
      await fundIncentive(2, fundAmount);

      const rewardTokenKeeperBalancesBefore = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.rewardToken.address
      );
      await expectValue(rewardTokenKeeperBalancesBefore, parseEther("0"));
      await runJob(2);
      await runJob(2);
      await runJob(2);
      await runJob(2);

      const rewardTokenKeeperBalancesAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.rewardToken.address
      );
      await expectValue(rewardTokenKeeperBalancesAfter, parseEther("4"));

      await contracts.keeperIncentive
        .connect(keeper)
      ["claim(bytes32[])"]([
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 2, contracts.rewardToken.address),
      ]);

      const rewardTokenkeeperBalancesAfterClaim = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );

      await expectValue(rewardTokenkeeperBalancesAfterClaim, parseEther("0"));
    });

    it("should payout reward with new token after incentive is updated with new token", async function () {
      const fundAmount = parseEther("10");
      const rewardAmount = parseEther("1");
      await contracts.keeperIncentive.updateBurnPercentage(0);

      await createIncentive(rewardAmount);
      await fundIncentive(1, fundAmount);

      const keeperBalancesBefore = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesBefore, parseEther("0"));
      await runJob(1);
      await runJob(1);
      await runJob(1);
      await runJob(1);

      const keeperBalancesAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesAfter, parseEther("4"));

      await contracts.keeperIncentive
        .connect(keeper)
      ["claim(bytes32[])"]([
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
      ]);

      const keeperBalancesAfterClaim = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );

      await expectValue(keeperBalancesAfterClaim, parseEther("0"));

      // update incentive with new rewardToken
      await contracts.rewardToken.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);
      await contracts.keeperIncentive
        .connect(manager)
        .updateIncentive(
          contracts.keeperIncentiveHelper.address,
          1,
          rewardAmount,
          true,
          true,
          contracts.rewardToken.address,
          1,
          0
        );
      await fundIncentive(1, fundAmount);

      const rewardTokenkeeperBalancesBefore = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.rewardToken.address
      );
      await expectValue(rewardTokenkeeperBalancesBefore, parseEther("0"));
      await runJob(1);
      await runJob(1);
      await runJob(1);
      await runJob(1);

      const rewardTokenkeeperBalancesAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.rewardToken.address
      );
      await expectValue(rewardTokenkeeperBalancesAfter, parseEther("4"));

      // call claim for incentive 1 with new rewardToken
      await contracts.keeperIncentive
        .connect(keeper)
      ["claim(bytes32[])"]([
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.rewardToken.address),
      ]);

      const rewardTokenkeeperBalancesAfterClaim = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.rewardToken.address
      );

      await expectValue(rewardTokenkeeperBalancesAfterClaim, parseEther("0"));
    });

    it("should burn tokens", async function () {
      const fundAmount = parseEther("10");
      const rewardAmount = parseEther("1");
      const burnPercentage = parseEther("0.25");
      const amountBurned = rewardAmount.mul(burnPercentage).div(parseEther("1"));

      await createIncentive(rewardAmount);
      await fundIncentive(1, fundAmount);

      const keeperBalancesBefore = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesBefore, parseEther("0"));
      await runJob(1);

      const keeperBalancesAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(keeperBalancesAfter, rewardAmount.sub(amountBurned));

      await contracts.keeperIncentive
        .connect(keeper)
      ["claim(bytes32[])"]([
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address),
      ]);

      const keeperBalancesAfterClaim = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );

      await expectValue(keeperBalancesAfterClaim, parseEther("0"));

      const burnBalanceBefore = await contracts.keeperIncentive.burnBalancesByToken(contracts.mockPop.address);
      await expectValue(burnBalanceBefore, amountBurned);
      await contracts.keeperIncentive.burn(contracts.mockPop.address);

      const burnBalanceAfter = await contracts.keeperIncentive.burnBalancesByToken(contracts.mockPop.address);
      await expectValue(burnBalanceAfter, 0);

      // should not allow reentrance
      await expectRevert(contracts.keeperIncentive.burn(contracts.mockPop.address), "no burn balance");
    });

    it("should not return empty claimable balances after a claim is made", async function () {
      const fundAmount = parseEther("10");
      const rewardAmount = parseEther("5");

      await createIncentive(rewardAmount);
      await fundIncentive(1, fundAmount);

      await createIncentive(rewardAmount);
      await fundIncentive(2, fundAmount);

      await createIncentive(rewardAmount);
      await fundIncentive(3, fundAmount);

      await runJob(1);
      await runJob(2);
      await runJob(3);

      const keeperBalancesBefore = await getKeeperClaimableBalances(contracts.keeperIncentive, keeper.address);
      await expectValue(keeperBalancesBefore.length, 3);

      await contracts.keeperIncentive
        .connect(keeper)
      ["claim(bytes32[])"]([
        getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 2, contracts.mockPop.address),
      ]);

      const keeperBalances = await getKeeperClaimableBalances(contracts.keeperIncentive, keeper.address);

      await expectValue(keeperBalances.length, 3);
      await expectValue(keeperBalances[0].amount, keeperBalancesBefore[0].amount);
      await expectValue(keeperBalances[1].amount, 0);
      await expectValue(keeperBalances[2].amount, keeperBalancesBefore[2].amount);
    });

    describe("getKeeperClaimableBalances", async () => {
      it("should return balance subtracted amount after a claim is made", async function () {
        const fundAmount = parseEther("10");
        const rewardAmount = parseEther("5");

        await createIncentive(rewardAmount);
        await fundIncentive(1, fundAmount);

        await createIncentive(rewardAmount);
        await fundIncentive(2, fundAmount);

        await createIncentive(rewardAmount);
        await fundIncentive(3, fundAmount);

        await runJob(1);
        await runJob(2);
        await runJob(3);

        const keeperBalancesBefore = await getKeeperClaimableBalances(contracts.keeperIncentive, keeper.address);
        await expectValue(keeperBalancesBefore.length, 3);

        await contracts.keeperIncentive
          .connect(keeper)
        ["claim(bytes32[])"]([
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 2, contracts.mockPop.address),
        ]);

        const keeperBalances = await getKeeperClaimableBalances(contracts.keeperIncentive, keeper.address);
        await expectValue(keeperBalances.length, 3);

        await expectValue(keeperBalances[0].rewardToken, contracts.mockPop.address);
        await expectValue(keeperBalances[1].rewardToken, contracts.mockPop.address);
        await expectValue(keeperBalances[2].rewardToken, contracts.mockPop.address);

        await expectValue(keeperBalances[0].amount, keeperBalancesBefore[0].amount);
        await expectValue(keeperBalances[1].amount, 0);
        await expectValue(keeperBalances[2].amount, keeperBalancesBefore[2].amount);

        await expectValue(
          keeperBalances[0].account,
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 1, contracts.mockPop.address)
        );
        await expectValue(
          keeperBalances[1].account,
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 2, contracts.mockPop.address)
        );
        await expectValue(
          keeperBalances[2].account,
          getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 3, contracts.mockPop.address)
        );
      });
    });
  });

  it("should deduct the incentive reward from the incentive balance", async function () {
    const fundAmount = parseEther("100");
    await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, fundAmount);
    await contracts.keeperIncentive
      .connect(manager)
      .fundIncentive(contracts.keeperIncentiveHelper.address, 0, fundAmount);

    await expectEvent(
      await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0),
      contracts.keeperIncentiveHelper,
      "FunctionCalled",
      [keeper.address]
    );
    const incentiveAccount = await contracts.keeperIncentive.accounts(
      getIncentiveAccountId(contracts.keeperIncentiveHelper.address, 0, contracts.mockPop.address),
      contracts.keeperIncentive.address
    );

    await expectValue(incentiveAccount.balance, fundAmount.sub(incentive));
  });

  it("should not pay out rewards if the incentive budget is not high enough", async function () {
    const oldBalance = await getKeeperClaimableTokenBalance(
      contracts.keeperIncentive,
      keeper.address,
      contracts.mockPop.address
    );
    await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0);
    const newBalance = await getKeeperClaimableTokenBalance(
      contracts.keeperIncentive,
      keeper.address,
      contracts.mockPop.address
    );
    await expectValue(newBalance, oldBalance);
  });

  it("should revert if the keeper didnt stake enough pop", async function () {
    await contracts.keeperIncentive.connect(manager).updateRequiredKeeperStake(parseEther("3000"));
    await expectRevert(
      contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0),
      "not enough pop staked"
    );
  });

  context("approval", function () {
    it("should not be callable for non approved addresses", async function () {
      await contracts.mockPop.connect(manager).mint(keeper.address, parseEther("1990"));
      await contracts.mockPop.connect(keeper).approve(contracts.staking.address, parseEther("2000"));
      await contracts.staking.connect(keeper).lock(manager.address, parseEther("2000"), 0);
      await timeTravel(7 * DAYS);
      await expectRevert(
        contracts.keeperIncentiveHelper.connect(manager).incentivisedFunction(0),
        "you dont have the right role"
      );
    });

    it("should be callable for non approved addresses if the incentive is open to everyone", async function () {
      let nonPrivileged = manager;
      await contracts.mockPop.connect(manager).mint(nonPrivileged.address, parseEther("1990"));
      await contracts.mockPop.connect(nonPrivileged).approve(contracts.staking.address, parseEther("2000"));
      await contracts.staking.connect(nonPrivileged).lock(nonPrivileged.address, parseEther("2000"), 0);
      await timeTravel(7 * DAYS);
      await contracts.keeperIncentive.connect(manager).toggleApproval(contracts.keeperIncentiveHelper.address, 0);
      await fundIncentive(0, parseEther("11"));

      const oldBalance = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        nonPrivileged.address,
        contracts.mockPop.address
      );

      await contracts.keeperIncentiveHelper.connect(nonPrivileged).incentivisedFunction(0);

      const newBalance = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        nonPrivileged.address,
        contracts.mockPop.address
      );
      await expectValue(newBalance, oldBalance.add(incentive.mul(3).div(4)));
    });

    it("should not do anything if the incentive for this function wasnt set yet", async function () {
      contracts.keeperIncentive = await (
        await (
          await ethers.getContractFactory("KeeperIncentiveV2")
        ).deploy(contracts.contractRegistry.address, parseEther("0.25"), parseEther("2000"))
      ).deployed();

      contracts.keeperIncentiveHelper = await (
        await (await ethers.getContractFactory("KeeperIncentiveHelper")).deploy(contracts.keeperIncentive.address)
      ).deployed();

      await contracts.mockPop.connect(manager).approve(contracts.keeperIncentive.address, incentive);

      const balanceBefore = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(0),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );

      await expectEvent(
        await contracts.keeperIncentiveHelper.connect(keeper).incentivisedFunction(1),
        contracts.keeperIncentiveHelper,
        "FunctionCalled",
        [keeper.address]
      );

      const balanceAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        keeper.address,
        contracts.mockPop.address
      );
      await expectValue(balanceAfter, balanceBefore);
    });
  });
});
