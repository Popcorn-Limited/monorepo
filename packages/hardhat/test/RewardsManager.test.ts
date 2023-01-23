import { MockContract } from "@ethereum-waffle/mock-contract";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { utils } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers, waffle } from "hardhat";
import IUniswapV2Factory from "../lib/external/uniswap-v2/UniswapV2Factory.json";
import IUniswapV2Router02 from "../lib/external/uniswap-v2/UniswapV2Router.json";
import { getKeeperClaimableTokenBalance } from "../lib/adapters/KeeperIncentives/getKeeperBalances";
import {
  ACLRegistry,
  BeneficiaryVaults,
  ContractRegistry,
  GovStaking,
  KeeperIncentiveV2,
  MockERC20,
  Region,
  RewardsManager,
} from "../typechain";

interface Contracts {
  pop: MockERC20;
  mockAlt: MockERC20;
  insurance: MockContract;
  treasury: MockContract;
  beneficiaryVaults: BeneficiaryVaults;
  staking: GovStaking;
  mockUniswapV2Router: MockContract;
  rewardsManager: RewardsManager;
  region: Region;
  keeperIncentive: KeeperIncentiveV2;
  aclRegistry: ACLRegistry;
  contractRegistry: ContractRegistry;
}

const RewardSplits = {
  Staking: parseEther("32"),
  Treasury: parseEther("32"),
  Insurance: parseEther("2"),
  BeneficiaryVaults: parseEther("34"),
};
const OwnerInitial = parseEther("10");
const RewarderInitial = parseEther("5");

let owner: SignerWithAddress, rewarder: SignerWithAddress, nonOwner: SignerWithAddress;

let contracts: Contracts;

async function deployContracts(): Promise<Contracts> {
  const mockERC20Factory = await ethers.getContractFactory("MockERC20");
  const pop = await mockERC20Factory.deploy("Testpop", "Tpop", 18);

  const mockAlt = await mockERC20Factory.deploy("TestALT", "TALT", 18);

  const treasuryFactory = await ethers.getContractFactory("MockTreasury");
  const treasury = await waffle.deployMockContract(owner, treasuryFactory.interface.format() as any[]);

  const insuranceFactory = await ethers.getContractFactory("MockInsurance");
  const insurance = await waffle.deployMockContract(owner, insuranceFactory.interface.format() as any[]);

  const aclRegistry = await (await (await ethers.getContractFactory("ACLRegistry")).deploy()).deployed();

  const contractRegistry = await (
    await (await ethers.getContractFactory("ContractRegistry")).deploy(aclRegistry.address)
  ).deployed();

  const rewardsEscrow = await (
    await (await ethers.getContractFactory("RewardsEscrow")).deploy(contractRegistry.address)
  ).deployed();

  const staking = await (
    await (await ethers.getContractFactory("GovStaking")).deploy(contractRegistry.address)
  ).deployed();
  const popLocker = await (
    await (await ethers.getContractFactory("GovStaking")).deploy(contractRegistry.address)
  ).deployed();

  const mockBeneficiaryRegistryFactory = await ethers.getContractFactory("BeneficiaryRegistry");
  const mockBeneficiaryRegistry = await waffle.deployMockContract(
    owner,
    mockBeneficiaryRegistryFactory.interface.format() as any[]
  );

  const beneficiaryVaultsFactory = await ethers.getContractFactory("BeneficiaryVaults");
  const beneficiaryVaults = await (await beneficiaryVaultsFactory.deploy(contractRegistry.address)).deployed();

  const region = await (
    await (await ethers.getContractFactory("Region")).deploy(beneficiaryVaults.address, contractRegistry.address)
  ).deployed();

  const keeperIncentive = await (
    await (await ethers.getContractFactory("KeeperIncentiveV2")).deploy(contractRegistry.address, 0, 0)
  ).deployed();

  const mockUniswapV2Factory = await waffle.deployMockContract(owner, IUniswapV2Factory.abi);
  const mockUniswapV2Router = await waffle.deployMockContract(owner, IUniswapV2Router02.abi);
  await mockUniswapV2Router.mock.factory.returns(mockUniswapV2Factory.address);

  const rewardsManagerFactory = await ethers.getContractFactory("RewardsManager");
  const rewardsManager = await rewardsManagerFactory.deploy(contractRegistry.address, mockUniswapV2Router.address);
  await rewardsManager.deployed();

  await aclRegistry.connect(owner).grantRole(ethers.utils.id("DAO"), owner.address);
  await aclRegistry.connect(owner).grantRole(ethers.utils.id("Keeper"), owner.address);
  await aclRegistry.connect(owner).grantRole(ethers.utils.id("INCENTIVE_MANAGER_ROLE"), owner.address);

  await contractRegistry.connect(owner).addContract(ethers.utils.id("POP"), pop.address, ethers.utils.id("1"));
  await contractRegistry.connect(owner).addContract(ethers.utils.id("Region"), region.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("Insurance"), insurance.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("Treasury"), treasury.address, ethers.utils.id("1"));
  await contractRegistry.connect(owner).addContract(ethers.utils.id("Staking"), staking.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("PopLocker"), popLocker.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("RewardsEscrow"), rewardsEscrow.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("RewardsManager"), rewardsManager.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("KeeperIncentive"), keeperIncentive.address, ethers.utils.id("1"));

  await keeperIncentive
    .connect(owner)
    .createIncentive(rewardsManager.address, parseEther("5"), true, false, pop.address, 1, 0);

  await keeperIncentive
    .connect(owner)
    .createIncentive(rewardsManager.address, parseEther("5"), true, false, pop.address, 1, 0);

  await pop.mint(owner.address, OwnerInitial);
  await pop.mint(rewarder.address, RewarderInitial);
  await mockAlt.mint(owner.address, OwnerInitial);

  return {
    pop,
    mockAlt,
    insurance,
    treasury,
    staking,
    beneficiaryVaults,
    mockUniswapV2Router,
    rewardsManager,
    region,
    keeperIncentive,
    aclRegistry,
    contractRegistry,
  };
}

describe("RewardsManager", function () {
  beforeEach(async function () {
    [owner, rewarder, nonOwner] = await ethers.getSigners();
    contracts = await deployContracts();
  });

  it("should be constructed with correct addresses", async function () {
    expect(await contracts.rewardsManager.contractRegistry()).to.equal(contracts.contractRegistry.address);
    expect(await contracts.rewardsManager.uniswapV2Router()).to.equal(contracts.mockUniswapV2Router.address);
  });

  it("should be initialized with correct splits", async function () {
    expect(await contracts.rewardsManager.rewardSplits(0)).to.equal(parseEther("32"));
    expect(await contracts.rewardsManager.rewardSplits(1)).to.equal(parseEther("32"));
    expect(await contracts.rewardsManager.rewardSplits(2)).to.equal(parseEther("2"));
    expect(await contracts.rewardsManager.rewardSplits(3)).to.equal(parseEther("34"));
  });

  it("reverts when setting reward splits as non-owner", async function () {
    await expect(contracts.rewardsManager.connect(nonOwner).setRewardSplits([20, 18, 2, 60])).to.be.revertedWith(
      "you dont have the right role"
    );
  });

  it("reverts when setting invalid reward splits", async function () {
    await expect(contracts.rewardsManager.setRewardSplits([19, 19, 2, 60])).to.be.revertedWith("Invalid split");
  });

  it("reverts when setting invalid total reward splits", async function () {
    await expect(
      contracts.rewardsManager.setRewardSplits([
        parseEther("20.000000001"),
        parseEther("18"),
        parseEther("2"),
        parseEther("60"),
      ])
    ).to.be.revertedWith("Invalid split total");
  });

  it("reverts when setting out of bounds reward splits", async function () {
    await expect(
      contracts.rewardsManager.setRewardSplits([parseEther("9"), parseEther("9"), parseEther("2"), parseEther("80")])
    ).to.be.revertedWith("Invalid split");
  });

  describe("reward splits are set", function () {
    const newRewardSplits = [parseEther("20"), parseEther("18"), parseEther("2"), parseEther("60")];
    let result;
    beforeEach(async function () {
      result = await contracts.rewardsManager.setRewardSplits([
        parseEther("20"),
        parseEther("18"),
        parseEther("2"),
        parseEther("60"),
      ]);
    });

    it("should emit RewardSplitsUpdated event", async function () {
      expect(result).to.emit(contracts.rewardsManager, "RewardSplitsUpdated").withArgs(newRewardSplits);
    });

    it("should have updated correct splits", async function () {
      expect(await contracts.rewardsManager.rewardSplits(0)).to.equal(parseEther("20"));
      expect(await contracts.rewardsManager.rewardSplits(1)).to.equal(parseEther("18"));
      expect(await contracts.rewardsManager.rewardSplits(2)).to.equal(parseEther("2"));
      expect(await contracts.rewardsManager.rewardSplits(3)).to.equal(parseEther("60"));
    });
  });

  describe("send rewards", function () {
    const firstReward = parseEther("0.1");
    const stakingReward = firstReward.mul(RewardSplits.Staking).div(parseEther("100"));
    const treasuryReward = firstReward.mul(RewardSplits.Treasury).div(parseEther("100"));
    const insuranceReward = firstReward.mul(RewardSplits.Insurance).div(parseEther("100"));
    const beneficiaryVaultsReward = firstReward.mul(RewardSplits.BeneficiaryVaults).div(parseEther("100"));
    let result;

    beforeEach(async function () {
      await contracts.pop.connect(rewarder).transfer(contracts.rewardsManager.address, firstReward);
    });

    it("contract has expected balance", async function () {
      expect(await contracts.pop.balanceOf(contracts.rewardsManager.address)).to.equal(firstReward);
    });

    describe("rewards are distributed", function () {
      beforeEach(async function () {
        result = await contracts.rewardsManager.distributeRewards();
      });

      it("emits expected events", async function () {
        expect(result)
          .to.emit(contracts.rewardsManager, "StakingDeposited")
          .withArgs(contracts.staking.address, stakingReward);
        expect(result)
          .to.emit(contracts.rewardsManager, "TreasuryDeposited")
          .withArgs(contracts.treasury.address, treasuryReward);
        expect(result)
          .to.emit(contracts.rewardsManager, "InsuranceDeposited")
          .withArgs(contracts.insurance.address, insuranceReward);
        expect(result)
          .to.emit(contracts.rewardsManager, "BeneficiaryVaultsDeposited")
          .withArgs(beneficiaryVaultsReward);
        expect(result).to.emit(contracts.rewardsManager, "RewardsDistributed").withArgs(firstReward);
      });

      it("has expected contract balance", async function () {
        expect(await contracts.pop.balanceOf(contracts.rewardsManager.address)).to.equal(0);
      });

      it("Staking has expected balance", async function () {
        expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(stakingReward);
      });

      it("Treasury has expected balance", async function () {
        expect(await contracts.pop.balanceOf(contracts.treasury.address)).to.equal(treasuryReward);
      });

      it("Insurance has expected balance", async function () {
        expect(await contracts.pop.balanceOf(contracts.insurance.address)).to.equal(insuranceReward);
      });

      it("BeneficiaryVaults has expected balance", async function () {
        expect(await contracts.pop.balanceOf(contracts.beneficiaryVaults.address)).to.equal(beneficiaryVaultsReward);
      });

      describe("send more rewards", function () {
        const secondReward = parseEther("0.05");
        beforeEach(async function () {
          await contracts.pop.connect(rewarder).transfer(contracts.rewardsManager.address, secondReward);
        });

        it("has expected contract balance", async function () {
          expect(await contracts.pop.balanceOf(contracts.rewardsManager.address)).to.equal(secondReward);
        });

        describe("new rewards are distributed", function () {
          const stakingSecondReward = secondReward.mul(RewardSplits.Staking).div(parseEther("100"));
          const treasurySecondReward = secondReward.mul(RewardSplits.Treasury).div(parseEther("100"));
          const insuranceSecondReward = secondReward.mul(RewardSplits.Insurance).div(parseEther("100"));
          const beneficiaryVaultsSecondReward = secondReward.mul(RewardSplits.BeneficiaryVaults).div(parseEther("100"));
          beforeEach(async function () {
            result = await contracts.rewardsManager.distributeRewards();
          });

          it("emits expected events", async function () {
            expect(result)
              .to.emit(contracts.rewardsManager, "StakingDeposited")
              .withArgs(contracts.staking.address, stakingSecondReward);
            expect(result)
              .to.emit(contracts.rewardsManager, "TreasuryDeposited")
              .withArgs(contracts.treasury.address, treasurySecondReward);
            expect(result)
              .to.emit(contracts.rewardsManager, "InsuranceDeposited")
              .withArgs(contracts.insurance.address, insuranceSecondReward);
            expect(result)
              .to.emit(contracts.rewardsManager, "BeneficiaryVaultsDeposited")
              .withArgs(beneficiaryVaultsSecondReward);
            expect(result).to.emit(contracts.rewardsManager, "RewardsDistributed").withArgs(secondReward);
          });

          it("has expected contract balance", async function () {
            expect(await contracts.pop.balanceOf(contracts.rewardsManager.address)).to.equal(0);
          });

          it("Staking has expected balance", async function () {
            expect(await contracts.pop.balanceOf(contracts.staking.address)).to.equal(
              stakingReward.add(stakingSecondReward)
            );
          });

          it("Treasury has expected balance", async function () {
            expect(await contracts.pop.balanceOf(contracts.treasury.address)).to.equal(
              treasuryReward.add(treasurySecondReward)
            );
          });

          it("Insurance has expected balance", async function () {
            expect(await contracts.pop.balanceOf(contracts.insurance.address)).to.equal(
              insuranceReward.add(insuranceSecondReward)
            );
          });

          it("BeneficiaryVaults has expected balance", async function () {
            expect(await contracts.pop.balanceOf(contracts.beneficiaryVaults.address)).to.equal(
              beneficiaryVaultsReward.add(beneficiaryVaultsSecondReward)
            );
          });
        });
      });
    });

    describe("send alt token for reward swap", function () {
      const altAmount = parseEther("1");
      beforeEach(async function () {
        await contracts.mockAlt.transfer(contracts.rewardsManager.address, altAmount);
      });

      it("has expected contract balance", async function () {
        expect(await contracts.mockAlt.balanceOf(contracts.rewardsManager.address)).to.equal(altAmount);
      });

      it("reverts with short path", async function () {
        await expect(contracts.rewardsManager.swapTokenForRewards([contracts.mockAlt.address], 100)).to.be.revertedWith(
          "Invalid swap path"
        );
      });

      it("reverts with invalid amount", async function () {
        await expect(
          contracts.rewardsManager.swapTokenForRewards([contracts.mockAlt.address, contracts.pop.address], 0)
        ).to.be.revertedWith("Invalid amount");
      });

      it("reverts with invalid path", async function () {
        await expect(
          contracts.rewardsManager.swapTokenForRewards([contracts.mockAlt.address, contracts.mockAlt.address], 100)
        ).to.be.revertedWith("POP must be last in path");
      });

      describe("execute token swap for pop rewards", function () {
        const swapReward = parseEther("0.24");
        beforeEach(async function () {
          await contracts.mockUniswapV2Router.mock.swapExactTokensForTokens.returns([altAmount, swapReward]);
          await contracts.pop.transfer(contracts.rewardsManager.address, swapReward); //simulate swap
          result = await contracts.rewardsManager.swapTokenForRewards(
            [contracts.mockAlt.address, contracts.pop.address],
            swapReward
          );
        });

        it("emits expected events", async function () {
          expect(result)
            .to.emit(contracts.rewardsManager, "TokenSwapped")
            .withArgs(contracts.mockAlt.address, altAmount, swapReward);
        });

        it("has expected contract balance", async function () {
          expect(await contracts.pop.balanceOf(contracts.rewardsManager.address)).to.equal(firstReward.add(swapReward));
        });
      });
    });
  });
  describe("Keeper Incentives", function () {
    it("pays out keeper incentives", async function () {
      //Test preparation
      await contracts.pop.mint(owner.address, parseEther("20.24"));
      await contracts.pop.connect(owner).approve(contracts.rewardsManager.address, parseEther("20"));
      await contracts.pop.connect(owner).approve(contracts.keeperIncentive.address, parseEther("100000"));

      await contracts.keeperIncentive
        .connect(owner)
        .fundIncentive(contracts.rewardsManager.address, 0, parseEther("10"));
      await contracts.keeperIncentive
        .connect(owner)
        .fundIncentive(contracts.rewardsManager.address, 1, parseEther("10"));

      const swapReward = parseEther("0.24");
      const altAmount = parseEther("1");

      await contracts.mockAlt.transfer(contracts.rewardsManager.address, altAmount);
      await contracts.pop.transfer(contracts.rewardsManager.address, swapReward);

      await contracts.mockUniswapV2Router.mock.swapExactTokensForTokens.returns([altAmount, swapReward]);

      //Actual test
      await contracts.rewardsManager
        .connect(owner)
        .swapTokenForRewards([contracts.mockAlt.address, contracts.pop.address], swapReward);

      await contracts.rewardsManager.connect(owner).distributeRewards();

      const balanceAfter = await getKeeperClaimableTokenBalance(
        contracts.keeperIncentive,
        owner.address,
        contracts.pop.address
      );

      expect(balanceAfter).to.equal(parseEther("10"));
    });
  });
});
