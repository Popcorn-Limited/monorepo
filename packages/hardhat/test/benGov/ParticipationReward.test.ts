import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import ParticipationRewardsAdapter from "../../lib/adapters/ParticipationRewardsAdapter";
import { ACLRegistry, MockERC20, ParticipationReward, ParticipationRewardHelper } from "../../typechain";

interface Contracts {
  mockPop: MockERC20;
  aclRegistry: ACLRegistry;
  participationReward: ParticipationReward;
  participationRewardHelper: ParticipationRewardHelper;
}

let owner: SignerWithAddress, voter: SignerWithAddress, governance: SignerWithAddress;
let contracts: Contracts;
let now: number;
let end: number;
let vaultId: string;
const rewardBudget = parseEther("10");

async function initVaultAndAddShares(index: number): Promise<string> {
  const currentTime = (await ethers.provider.getBlock("latest")).timestamp;
  const ending = currentTime + 1000;
  const id = ethers.utils.solidityKeccak256(["uint8", "uint256"], [index, currentTime]);
  await contracts.participationRewardHelper.initializeVault(id, ending);
  await contracts.participationRewardHelper.addShares(id, owner.address, 1000);
  return id;
}

async function openVaultAndClaim(id: string, index: number, cutOff = 50): Promise<void> {
  await contracts.participationRewardHelper.openVault(id);
  if (index >= cutOff) {
    await contracts.participationReward.connect(owner).claimReward(index);
  }
}

async function deployContracts(): Promise<Contracts> {
  const mockPop = await (await (await ethers.getContractFactory("MockERC20")).deploy("TestPOP", "TPOP", 18)).deployed();
  await mockPop.mint(owner.address, parseEther("50"));

  const aclRegistry = await (await (await ethers.getContractFactory("ACLRegistry")).deploy()).deployed();

  const contractRegistry = await (
    await (await ethers.getContractFactory("ContractRegistry")).deploy(aclRegistry.address)
  ).deployed();

  const participationReward = await (
    await (await ethers.getContractFactory("ParticipationReward")).deploy(contractRegistry.address)
  ).deployed();

  const participationRewardHelper = await (
    await (await ethers.getContractFactory("ParticipationRewardHelper")).deploy(participationReward.address)
  ).deployed();

  await aclRegistry.connect(owner).grantRole(ethers.utils.id("DAO"), governance.address);

  await contractRegistry.connect(governance).addContract(ethers.utils.id("POP"), mockPop.address, ethers.utils.id("1"));

  await mockPop.connect(owner).approve(participationReward.address, parseEther("1000000"));

  await participationReward.connect(owner).contributeReward(parseEther("10"));
  await participationReward
    .connect(governance)
    .addControllerContract(utils.formatBytes32String("ParticipationRewardHelper"), participationRewardHelper.address);

  return {
    mockPop,
    aclRegistry,
    participationReward,
    participationRewardHelper,
  };
}

describe("RewardParticipation", function () {
  beforeEach(async function () {
    [owner, voter, governance] = await ethers.getSigners();
    contracts = await deployContracts();
    now = (await ethers.provider.getBlock("latest")).timestamp;
    end = now + 604800;
    vaultId = ethers.utils.solidityKeccak256(["uint8", "uint256"], [1, now]);
  });
  describe("initialize a vault", function () {
    it("vault must not already exist", async function () {
      await contracts.participationRewardHelper.initializeVault(vaultId, end);
      await expect(contracts.participationRewardHelper.initializeVault(vaultId, end)).to.be.revertedWith(
        "Vault must not exist"
      );
    });
    it("endTime must be in the future", async function () {
      await expect(contracts.participationRewardHelper.initializeVault(vaultId, now)).to.be.revertedWith(
        "end must be in the future"
      );
    });
    it("should initialize a vault successfully", async function () {
      await contracts.participationReward
        .connect(governance)
        .setRewardsBudget(utils.formatBytes32String("ParticipationRewardHelper"), rewardBudget);
      await contracts.mockPop.connect(owner).transfer(contracts.participationReward.address, rewardBudget);
      const result = await contracts.participationRewardHelper.initializeVault(vaultId, end);
      expect("0x" + result.data.slice(10, 74)).to.equal(vaultId);
      expect(result).to.emit(contracts.participationReward, "VaultInitialized").withArgs(vaultId);

      const vault = await contracts.participationReward.vaults(vaultId);
      expect(vault.status).to.equal(0);
      expect(vault.endTime).to.equal(end);
      expect(vault.tokenBalance).to.equal(rewardBudget);
    });
    it("should not create a vault if the budget for it is not sufficient", async function () {
      await contracts.participationReward
        .connect(governance)
        .setRewardsBudget(utils.formatBytes32String("ParticipationRewardHelper"), rewardBudget.add(parseEther("1")));

      const result = await contracts.participationRewardHelper.initializeVault(vaultId, end);
      expect(result).to.not.emit(contracts.participationReward, "VaultInitialized");
    });
  });
  describe("open a vault", function () {
    it("vault must exist", async function () {
      await expect(contracts.participationRewardHelper.openVault(vaultId)).to.be.revertedWith(
        "Uninitialized vault slot"
      );
    });
    it("vault must not be open", async function () {
      await contracts.participationRewardHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      await contracts.participationRewardHelper.openVault(vaultId);
      await expect(contracts.participationRewardHelper.openVault(vaultId)).to.be.revertedWith(
        "Vault must be initialized"
      );
    });
    it("vault must be opened after endTime", async function () {
      await contracts.participationRewardHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604600]);
      ethers.provider.send("evm_mine", []);
      await expect(contracts.participationRewardHelper.openVault(vaultId)).to.be.revertedWith(
        "wait till endTime is over"
      );
    });
    it("should open vaults successfully", async function () {
      await contracts.participationRewardHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      await expect(contracts.participationRewardHelper.openVault(vaultId))
        .to.emit(contracts.participationReward, "VaultOpened")
        .withArgs(vaultId);
    });
  });
  describe("add shares", function () {
    it("vault must exist", async function () {
      await expect(contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000)).to.be.revertedWith(
        "Uninitialized vault slot"
      );
    });
    it("vault must not be open", async function () {
      await contracts.participationRewardHelper.initializeVault(vaultId, end);
      ethers.provider.send("evm_increaseTime", [604800]);
      ethers.provider.send("evm_mine", []);
      await contracts.participationRewardHelper.openVault(vaultId);
      await expect(contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000)).to.be.revertedWith(
        "Vault must be initialized"
      );
    });
    it("should add shares successfully", async function () {
      await contracts.participationRewardHelper.initializeVault(vaultId, end);
      await expect(contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000))
        .to.emit(contracts.participationReward, "SharesAdded")
        .withArgs(vaultId, owner.address, 1000);
    });
  });
  describe("claim rewards", function () {
    context("claim single vault", function () {
      beforeEach(async function () {
        await contracts.participationReward
          .connect(governance)
          .setRewardsBudget(utils.formatBytes32String("ParticipationRewardHelper"), parseEther("10"));
      });
      it("reverts if the vault is not open", async function () {
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000);
        await expect(contracts.participationReward.connect(owner).claimReward(0)).to.be.revertedWith(
          "vault is not open"
        );
      });
      it("reverts if there are no rewards to claim", async function () {
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 0);
        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);
        await contracts.participationRewardHelper.openVault(vaultId);
        await expect(contracts.participationReward.connect(owner).claimReward(0)).to.be.revertedWith("no rewards");
      });
      it("doesnt allow to claim the same reward twice", async function () {
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000);
        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);
        await contracts.participationRewardHelper.openVault(vaultId);
        await contracts.participationReward.connect(owner).claimReward(0);
        await expect(contracts.participationReward.connect(owner).claimReward(0)).to.be.revertedWith(
          "vault is not open"
        );
      });
      it("claims rewards successfully", async function () {
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000);
        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);
        await contracts.participationRewardHelper.openVault(vaultId);
        const oldBalance = await contracts.mockPop.balanceOf(owner.address);

        await expect(contracts.participationReward.connect(owner).claimReward(0))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("10"));

        const newBalance = await contracts.mockPop.balanceOf(owner.address);
        expect(newBalance).to.equal(oldBalance.add(parseEther("10")));
      });
      it("adds rewardedVaults to user address when voting and deletes them after claiming rewards", async function () {
        await contracts.participationReward.connect(owner).contributeReward(parseEther("20"));
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000);
        expect((await contracts.participationReward.getUserVaults(owner.address)).length).to.equal(1);

        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);

        await contracts.participationRewardHelper.openVault(vaultId);
        await contracts.participationReward.connect(owner).claimReward(0);

        //Array is empty with 0 as the first element
        expect((await contracts.participationReward.getUserVaults(owner.address))[0]).to.equal(
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

        now = (await ethers.provider.getBlock("latest")).timestamp;
        end = now + 604800;
        const vaultId2 = ethers.utils.solidityKeccak256(["uint8", "uint256"], [2, now]);
        await contracts.participationRewardHelper.initializeVault(vaultId2, end);
        await contracts.participationRewardHelper.addShares(vaultId2, owner.address, 1000);
        now = (await ethers.provider.getBlock("latest")).timestamp;
        end = now + 604800;
        const vaultId3 = ethers.utils.solidityKeccak256(["uint8", "uint256"], [3, now]);
        await contracts.participationRewardHelper.initializeVault(vaultId3, end);
        await contracts.participationRewardHelper.addShares(vaultId3, owner.address, 1000);

        expect((await contracts.participationReward.getUserVaults(owner.address)).length).to.equal(3);

        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);

        await contracts.participationRewardHelper.openVault(vaultId2);
        await contracts.participationRewardHelper.openVault(vaultId3);

        await expect(contracts.participationReward.connect(owner).claimRewards([1, 2]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("20"));
        expect(await contracts.participationReward.getUserVaults(owner.address)).to.deep.equal([
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ]);
      });
      it("still claims after a high amount of vaults", async function () {
        //Preparation
        await contracts.participationReward
          .connect(governance)
          .setRewardsBudget(utils.formatBytes32String("ParticipationRewardHelper"), parseEther("1"));
        await contracts.mockPop.mint(owner.address, parseEther("100"));
        await contracts.mockPop.approve(contracts.participationRewardHelper.address, parseEther("100"));
        await contracts.participationReward.connect(owner).contributeReward(parseEther("100"));

        const vaultIds = await Promise.all(new Array(100).fill(0).map(async (x, i) => await initVaultAndAddShares(i)));
        ethers.provider.send("evm_increaseTime", [1000]);
        ethers.provider.send("evm_mine", []);
        await Promise.all(
          vaultIds.map(async (id, i) => {
            await openVaultAndClaim(id, i);
          })
        );

        //Actual test
        await expect(contracts.participationReward.connect(owner).claimRewards([0, 1, 2]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("3"));
        expect((await contracts.participationReward.getUserVaults(owner.address)).slice(0, 3)).to.deep.equal([
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ]);

        await expect(contracts.participationReward.connect(owner).claimReward(3))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("1"));
        expect((await contracts.participationReward.getUserVaults(owner.address))[3]).to.equal(
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

        await expect(contracts.participationReward.connect(owner).claimRewards([40, 41, 42, 45]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("4"));

        await expect(contracts.participationReward.connect(owner).claimReward(49))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("1"));
      });
    });
    context("claim multiple vaults", function () {
      beforeEach(async function () {
        await contracts.participationReward
          .connect(governance)
          .setRewardsBudget(utils.formatBytes32String("ParticipationRewardHelper"), parseEther("10"));
      });
      it("reverts if the vault is not open", async function () {
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000);
        await expect(contracts.participationReward.connect(owner).claimRewards([0])).to.be.revertedWith("no rewards");
      });
      it("reverts if there are no rewards to claim", async function () {
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 0);
        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);
        await contracts.participationRewardHelper.openVault(vaultId);
        await expect(contracts.participationReward.connect(owner).claimRewards([0])).to.be.revertedWith("no rewards");
      });
      it("doesnt allow to claim the same reward twice", async function () {
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000);
        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);
        await contracts.participationRewardHelper.openVault(vaultId);
        await contracts.participationReward.connect(owner).claimRewards([0]);
        await expect(contracts.participationReward.connect(owner).claimRewards([0])).to.be.revertedWith("no rewards");
      });
      it("claims rewards successfully", async function () {
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000);
        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);
        await contracts.participationRewardHelper.openVault(vaultId);
        const oldBalance = await contracts.mockPop.balanceOf(owner.address);

        await expect(contracts.participationReward.connect(owner).claimRewards([0]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("10"));

        const newBalance = await contracts.mockPop.balanceOf(owner.address);
        expect(newBalance).to.equal(oldBalance.add(parseEther("10")));
      });
      it("adds rewardedVaults to user address when voting and deletes them after claiming rewards", async function () {
        await contracts.participationReward.connect(owner).contributeReward(parseEther("20"));
        await contracts.participationRewardHelper.initializeVault(vaultId, end);
        await contracts.participationRewardHelper.addShares(vaultId, owner.address, 1000);
        expect((await contracts.participationReward.getUserVaults(owner.address)).length).to.equal(1);

        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);

        await contracts.participationRewardHelper.openVault(vaultId);
        await contracts.participationReward.connect(owner).claimRewards([0]);

        //Array is empty with 0 as the first element
        expect((await contracts.participationReward.getUserVaults(owner.address))[0]).to.equal(
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

        now = (await ethers.provider.getBlock("latest")).timestamp;
        end = now + 604800;
        const vaultId2 = ethers.utils.solidityKeccak256(["uint8", "uint256"], [2, now]);
        await contracts.participationRewardHelper.initializeVault(vaultId2, end);
        await contracts.participationRewardHelper.addShares(vaultId2, owner.address, 1000);
        now = (await ethers.provider.getBlock("latest")).timestamp;
        end = now + 604800;
        const vaultId3 = ethers.utils.solidityKeccak256(["uint8", "uint256"], [3, now]);
        await contracts.participationRewardHelper.initializeVault(vaultId3, end);
        await contracts.participationRewardHelper.addShares(vaultId3, owner.address, 1000);

        expect((await contracts.participationReward.getUserVaults(owner.address)).length).to.equal(3);

        ethers.provider.send("evm_increaseTime", [604800]);
        ethers.provider.send("evm_mine", []);

        await contracts.participationRewardHelper.openVault(vaultId2);
        await contracts.participationRewardHelper.openVault(vaultId3);

        await expect(contracts.participationReward.connect(owner).claimRewards([1, 2]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("20"));
        expect(await contracts.participationReward.getUserVaults(owner.address)).to.deep.equal([
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ]);
      });
      it("still claims after a high amount of vaults", async function () {
        //Preparation
        await contracts.participationReward
          .connect(governance)
          .setRewardsBudget(utils.formatBytes32String("ParticipationRewardHelper"), parseEther("1"));
        await contracts.mockPop.mint(owner.address, parseEther("100"));
        await contracts.mockPop.approve(contracts.participationRewardHelper.address, parseEther("100"));
        await contracts.participationReward.connect(owner).contributeReward(parseEther("100"));

        const vaultIds = await Promise.all(new Array(100).fill(0).map(async (x, i) => await initVaultAndAddShares(i)));
        ethers.provider.send("evm_increaseTime", [1000]);
        ethers.provider.send("evm_mine", []);
        await Promise.all(
          vaultIds.map(async (id, i) => {
            await openVaultAndClaim(id, i);
          })
        );

        //Actual test
        await expect(contracts.participationReward.connect(owner).claimRewards([0, 1, 2]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("3"));
        expect((await contracts.participationReward.getUserVaults(owner.address)).slice(0, 3)).to.deep.equal([
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ]);

        await expect(contracts.participationReward.connect(owner).claimRewards([3]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("1"));
        expect((await contracts.participationReward.getUserVaults(owner.address))[3]).to.equal(
          "0x0000000000000000000000000000000000000000000000000000000000000000"
        );

        await expect(contracts.participationReward.connect(owner).claimRewards([40, 41, 42, 45]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("4"));

        await expect(contracts.participationReward.connect(owner).claimRewards([49]))
          .to.emit(contracts.participationReward, "RewardsClaimed")
          .withArgs(owner.address, parseEther("1"));
      });
    });
  });
  describe("ParticipationRewardsAdapter", function () {
    it("returns only claimable vaults", async function () {
      await contracts.participationReward
        .connect(governance)
        .setRewardsBudget(utils.formatBytes32String("ParticipationRewardHelper"), parseEther("1"));
      await contracts.participationReward.connect(owner).contributeReward(parseEther("11"));

      const vaultIds = await Promise.all(new Array(10).fill(0).map(async (x, i) => initVaultAndAddShares(i)));
      ethers.provider.send("evm_increaseTime", [1000]);
      ethers.provider.send("evm_mine", []);
      await Promise.all(
        vaultIds.map(async (id, i) => {
          await openVaultAndClaim(id, i, 5);
        })
      );
      await initVaultAndAddShares(11);
      expect(
        await ParticipationRewardsAdapter(contracts.participationReward).claimableVaultIds(owner.address)
      ).to.deep.equal(vaultIds.slice(0, 5));
    });
  });
});
