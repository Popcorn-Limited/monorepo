import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { KEEPER_INCENTIVE, POP_LOCKER, POP_TOKEN } from "../lib/acl/names";
import { DAO_ROLE, INCENTIVE_MANAGER_ROLE } from "../lib/acl/roles";
import { expectValue } from "../lib/utils/expectValue";
import { DAYS, timeTravel } from "../lib/utils/test";
import { getKeeperClaimableTokenBalance } from "../lib/adapters/KeeperIncentives/getKeeperBalances";
import {
  ACLRegistry,
  ContractRegistry,
  KeeperIncentiveV2,
  KeeperIncentivizedHelper,
  MockERC20,
  PopLocker,
  RewardsEscrow,
} from "../typechain";
import { getIncentiveAccountId } from "../lib/adapters/KeeperIncentives/getIncentiveAccountId";

const INCENTIVE_AMOUNT = parseEther("10");
const INCENTIVE_BURN_RATE = parseEther("0.25");
const REQUIRED_KEEPER_STAKE = parseEther("2000");
const INCENTIVE_ID = ethers.utils.id("1");

interface Contracts {
  aclRegistry: ACLRegistry;
  contractRegistry: ContractRegistry;
  mockPop: MockERC20;
  rewardsEscrow: RewardsEscrow;
  keeperIncentivizedHelper: KeeperIncentivizedHelper;
  popLocker: PopLocker;
  keeperIncentive: KeeperIncentiveV2;
}

let keeper: SignerWithAddress, owner: SignerWithAddress, contracts: Contracts;

async function deployContracts(): Promise<Contracts> {
  [owner, keeper] = await ethers.getSigners();

  const aclRegistry = (await (await ethers.getContractFactory("ACLRegistry")).deploy()) as ACLRegistry;
  await aclRegistry.deployed();

  const contractRegistry = (await (
    await ethers.getContractFactory("ContractRegistry")
  ).deploy(aclRegistry.address)) as ContractRegistry;
  await aclRegistry.deployed();

  const mockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockPop = (await (await mockERC20Factory.deploy("TestPOP", "TPOP", 18)).deployed()) as MockERC20;

  const rewardsEscrow = (await (
    await (await ethers.getContractFactory("RewardsEscrow")).deploy(mockPop.address)
  ).deployed()) as RewardsEscrow;

  const keeperIncentivizedHelper = (await (
    await ethers.getContractFactory("KeeperIncentivizedHelper")
  ).deploy(contractRegistry.address)) as KeeperIncentivizedHelper;
  await keeperIncentivizedHelper.deployed();

  const popLockerFactory = await ethers.getContractFactory("PopLocker");
  const popLocker = (await popLockerFactory.deploy(mockPop.address, rewardsEscrow.address)) as PopLocker;
  await popLocker.deployed();

  const keeperIncentive = (await (
    await ethers.getContractFactory("KeeperIncentiveV2")
  ).deploy(contractRegistry.address, INCENTIVE_BURN_RATE, REQUIRED_KEEPER_STAKE)) as KeeperIncentiveV2;
  await keeperIncentive.deployed();

  // Mint POP to owner to fund keeper incentives
  await mockPop.mint(owner.address, INCENTIVE_AMOUNT);
  await mockPop.connect(owner).approve(keeperIncentive.address, INCENTIVE_AMOUNT);

  // Grant owner DAO role
  await aclRegistry.connect(owner).grantRole(DAO_ROLE, owner.address);

  // Grant owner INCENTIVE MANAGER ROLE
  await aclRegistry.connect(owner).grantRole(INCENTIVE_MANAGER_ROLE, owner.address);

  // Register contract addresses
  await contractRegistry.connect(owner).addContract(KEEPER_INCENTIVE, keeperIncentive.address, INCENTIVE_ID);
  await contractRegistry.connect(owner).addContract(POP_TOKEN, mockPop.address, INCENTIVE_ID);
  await contractRegistry.connect(owner).addContract(POP_LOCKER, popLocker.address, INCENTIVE_ID);

  // Create and fund keeper incentive
  await keeperIncentive
    .connect(owner)
    .createIncentive(keeperIncentivizedHelper.address, INCENTIVE_AMOUNT, true, true, mockPop.address, 1, 0);
  await keeperIncentive.connect(owner).fundIncentive(keeperIncentivizedHelper.address, 0, INCENTIVE_AMOUNT);

  return {
    aclRegistry,
    contractRegistry,
    mockPop,
    rewardsEscrow,
    keeperIncentivizedHelper,
    popLocker,
    keeperIncentive,
  };
}

describe("KeeperIncentivized", () => {
  beforeEach(async () => {
    contracts = await deployContracts();
    await contracts.mockPop.mint(keeper.address, parseEther("2100"));
    await contracts.mockPop.connect(keeper).approve(contracts.popLocker.address, parseEther("100000"));
    await contracts.popLocker.connect(keeper).lock(keeper.address, parseEther("2000"), 0);
    await timeTravel(7 * DAYS);
  });

  it("calling _handleKeeperIncentive directly processes keeper incentive", async function () {
    const popBalanceBeforeIncentive = await getKeeperClaimableTokenBalance(
      contracts.keeperIncentive,
      keeper.address,
      contracts.mockPop.address
    );
    await contracts.keeperIncentivizedHelper.connect(keeper).handleKeeperIncentiveDirectCall();

    const expectedIncentivePaid = INCENTIVE_AMOUNT.sub(INCENTIVE_AMOUNT.mul(INCENTIVE_BURN_RATE).div(parseEther("1")));
    const expectedPopBalanceAfterIncentive = popBalanceBeforeIncentive.add(expectedIncentivePaid);
    const popBalanceAfterIncentive = await getKeeperClaimableTokenBalance(
      contracts.keeperIncentive,
      keeper.address,
      contracts.mockPop.address
    );

    expectValue(popBalanceAfterIncentive, expectedPopBalanceAfterIncentive);
  });

  it("calling a function with the keeperIncentive modifier applied processes keeper incentive", async function () {
    const balanceBefore = await getKeeperClaimableTokenBalance(
      contracts.keeperIncentive,
      keeper.address,
      contracts.mockPop.address
    );

    await contracts.keeperIncentivizedHelper.connect(keeper).handleKeeperIncentiveModifierCall();

    const expectedIncentivePaid = INCENTIVE_AMOUNT.sub(INCENTIVE_AMOUNT.mul(INCENTIVE_BURN_RATE).div(parseEther("1")));
    const expectedPopBalanceAfterIncentive = balanceBefore.add(expectedIncentivePaid);
    const balanceAfter = await getKeeperClaimableTokenBalance(
      contracts.keeperIncentive,
      keeper.address,
      contracts.mockPop.address
    );
    expectValue(balanceAfter, expectedPopBalanceAfterIncentive);
  });

  it("should tip an incentive", async function () {
    const tipAmount = parseEther("15");
    await contracts.mockPop.mint(owner.address, tipAmount);
    await contracts.mockPop.connect(owner).approve(contracts.keeperIncentivizedHelper.address, tipAmount);

    let hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
    expectValue(hasClaimableBalance, false);

    await contracts.keeperIncentivizedHelper
      .connect(owner)
      .tipIncentiveDirectCall(contracts.mockPop.address, keeper.address, 0, tipAmount);

    hasClaimableBalance = await contracts.keeperIncentive.hasClaimableBalance(keeper.address);
    expectValue(hasClaimableBalance, true);

    const keeperAccount = await contracts.keeperIncentive.accounts(
      getIncentiveAccountId(contracts.keeperIncentivizedHelper.address, 0, contracts.mockPop.address),
      keeper.address
    );

    expectValue(keeperAccount.balance, tipAmount);
  });
});
