import { parseEther } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import BasicIssuanceModule from "@setprotocol/set-protocol-v2/artifacts/contracts/protocol/modules/BasicIssuanceModule.sol/BasicIssuanceModule.json";
import SetToken from "@setprotocol/set-protocol-v2/artifacts/contracts/protocol/SetToken.sol/SetToken.json";
import SetTokenCreator from "@setprotocol/set-protocol-v2/artifacts/contracts/protocol/SetTokenCreator.sol/SetTokenCreator.json";
import { expect } from "chai";
import { BigNumber, utils } from "ethers";
import { Signer } from "ethers/lib/ethers";
import { ethers, network, waffle } from "hardhat";
import { ADDRESS_ZERO } from "../../lib/external/SetToken/utils/constants";
import { expectBigNumberCloseTo, expectEvent, expectRevert, expectValue } from "../../lib/utils/expectValue";
import { impersonateSigner } from "../../lib/utils/test/impersonateSigner";
import { sendEth } from "../../lib/utils/test/sendEth";
import { ThreeXBatchVault } from "../../typechain/ThreeXBatchVault";
import {
  ERC20,
  ThreeXBatchProcessing,
  MockERC20,
  Staking,
  CurveMetapool,
  CurveMetapool__factory,
  RewardsEscrow,
  MockYearnV2Vault,
  MockYearnV2Vault__factory,
  ContractRegistry,
} from "../../typechain";
import ThreeXBatchAdapter from "../../lib/adapters/ThreeXBatchAdapter";
import { BatchType } from "../../../utils/src/types";
import { parseUnits } from "ethers/lib/utils";

const provider = waffle.provider;

const SET_TOKEN_CREATOR_ADDRESS = "0xeF72D3278dC3Eba6Dc2614965308d1435FFd748a";
const SET_BASIC_ISSUANCE_MODULE_ADDRESS = "0xd8EF3cACe8b4907117a45B0b125c68560532F94D";

const THREE_X_ADDRESS = "0x8b97ADE5843c9BE7a1e8c95F32EC192E31A46cf3";

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const USDC_WHALE_ADDRESS = "0xcffad3200574698b78f32232aa9d63eabd290703";

const Y_SUSD_ADDRESS = "0x5a770DbD3Ee6bAF2802D29a901Ef11501C44797A";
const Y_3EUR_ADDRESS = "0x5AB64C599FcC59f0f2726A300b03166A395578Da";

const SUSD_WITHDRAWAL_POOL_ADDRESS = "0xFCBa3E75865d2d561BE8D220616520c171F12851";
const CRV_SUSD_ADDRESS = "0xC25a3A3b969415c80451098fa907EC722572917F";
const SUSD_METAPOOL_ADDRESS = "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD";
const THREE_EUR_METAPOOL_ADDRESS = "0xb9446c4Ef5EBE66268dA6700D26f96273DE3d571";
const EURS_METAPOOL_ADDRESS = "0x98a7F18d4E56Cfe84E3D081B40001B3d5bD3eB8B";

const ANGLE_ROUTER_ADDRESS = "0xBB755240596530be0c1DE5DFD77ec6398471561d";
const ANGLE_EUR_ORACLE_ADDRESS = "0xc9Cb5703C109D4Fe46d2F29b0454c434e42A6947";
const AG_EUR_ADDRESS = "0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8";

interface Token {
  usdc: ERC20;
  pop: MockERC20;
  setToken: ERC20;
}
interface Contracts {
  token: Token;
  yearnVaultSusd: MockYearnV2Vault;
  yearnVault3EUR: MockYearnV2Vault;
  curveMetapoolSusd: CurveMetapool;
  curveMetapool3EUR: CurveMetapool;
  threeXBatchProcessing: ThreeXBatchProcessing;
  staking: Staking;
  threeXStorage: ThreeXBatchVault;
  contractRegistry: ContractRegistry;
}

let contracts: Contracts;

let owner: SignerWithAddress,
  depositor: SignerWithAddress,
  depositor1: SignerWithAddress,
  depositor2: SignerWithAddress;
let usdcWhale: Signer;

async function deployToken(): Promise<Token> {
  const MockERC20 = await ethers.getContractFactory("MockERC20");

  const pop = await (await MockERC20.deploy("POP", "POP", 18)).deployed();

  const usdc = (await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    USDC_ADDRESS
  )) as ERC20;

  const setToken = (await ethers.getContractAt(SetToken.abi, THREE_X_ADDRESS)) as ERC20;

  return {
    pop,
    usdc,
    setToken,
  };
}

async function deployContracts(): Promise<Contracts> {
  const token = await deployToken();

  const curveMetapoolSusd = CurveMetapool__factory.connect(SUSD_METAPOOL_ADDRESS, owner);
  const curveMetapool3EUR = CurveMetapool__factory.connect(THREE_EUR_METAPOOL_ADDRESS, owner);

  const yearnVaultSusd = MockYearnV2Vault__factory.connect(Y_SUSD_ADDRESS, owner);
  const yearnVault3EUR = MockYearnV2Vault__factory.connect(Y_3EUR_ADDRESS, owner);

  const aclRegistry = await (await (await ethers.getContractFactory("ACLRegistry")).deploy()).deployed();

  const contractRegistry = await (
    await (await ethers.getContractFactory("ContractRegistry")).deploy(aclRegistry.address)
  ).deployed();

  const keeperIncentive = await (
    await (await ethers.getContractFactory("KeeperIncentiveV2")).deploy(contractRegistry.address, 0, 0)
  ).deployed();

  const popStaking = await (
    await (await ethers.getContractFactory("PopLocker")).deploy(token.pop.address, token.pop.address)
  ).deployed();

  const rewardsEscrow = (await (
    await (await ethers.getContractFactory("RewardsEscrow")).deploy(token.pop.address)
  ).deployed()) as RewardsEscrow;

  const staking = await (
    await (
      await ethers.getContractFactory("Staking")
    ).deploy(token.pop.address, token.setToken.address, rewardsEscrow.address)
  ).deployed();

  const threeXBatchProcessing = await (
    await (
      await ethers.getContractFactory("ThreeXBatchProcessing")
    ).deploy(
      contractRegistry.address,
      staking.address,
      { sourceToken: token.usdc.address, targetToken: token.setToken.address }, // mint batch
      { sourceToken: token.setToken.address, targetToken: token.usdc.address }, // redeem batch
      SET_BASIC_ISSUANCE_MODULE_ADDRESS,
      [yearnVaultSusd.address, yearnVault3EUR.address],
      [
        {
          lpToken: CRV_SUSD_ADDRESS,
          utilityPool: SUSD_WITHDRAWAL_POOL_ADDRESS,
          oracle: ethers.constants.AddressZero,
          curveMetaPool: SUSD_METAPOOL_ADDRESS,
          angleRouter: ethers.constants.AddressZero,
        },
        {
          lpToken: THREE_EUR_METAPOOL_ADDRESS,
          utilityPool: ethers.constants.AddressZero,
          oracle: ANGLE_EUR_ORACLE_ADDRESS,
          curveMetaPool: THREE_EUR_METAPOOL_ADDRESS,
          angleRouter: ANGLE_ROUTER_ADDRESS,
        },
      ],
      AG_EUR_ADDRESS,
      {
        batchCooldown: 1800,
        mintThreshold: parseEther("20000"),
        redeemThreshold: parseEther("200"),
      }
    )
  ).deployed();

  const batchStorage = await (
    await (
      await ethers.getContractFactory("ThreeXBatchVault")
    ).deploy(contractRegistry.address, threeXBatchProcessing.address)
  ).deployed();

  await aclRegistry.grantRole(ethers.utils.id("DAO"), owner.address);
  await aclRegistry.grantRole(ethers.utils.id("Keeper"), owner.address);

  await threeXBatchProcessing.setBatchStorage(batchStorage.address);
  await threeXBatchProcessing.setApprovals();

  await contractRegistry.connect(owner).addContract(ethers.utils.id("POP"), token.pop.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("KeeperIncentive"), keeperIncentive.address, ethers.utils.id("1"));
  await contractRegistry
    .connect(owner)
    .addContract(ethers.utils.id("PopLocker"), popStaking.address, ethers.utils.id("1"));

  await keeperIncentive
    .connect(owner)
    .createIncentive(threeXBatchProcessing.address, 0, true, false, token.pop.address, 1, 0);

  await keeperIncentive
    .connect(owner)
    .createIncentive(threeXBatchProcessing.address, 0, true, false, token.pop.address, 1, 0);

  await threeXBatchProcessing.connect(owner).setSlippage(100, 100);

  const threeXStorage = (await ethers.getContractAt(
    "ThreeXBatchVault",
    await threeXBatchProcessing.batchStorage()
  )) as ThreeXBatchVault;

  return {
    token,
    yearnVaultSusd,
    yearnVault3EUR,
    curveMetapoolSusd,
    curveMetapool3EUR,
    threeXBatchProcessing,
    staking,
    threeXStorage,
    contractRegistry,
  };
}

const timeTravel = async (time: number) => {
  await provider.send("evm_increaseTime", [time]);
  await provider.send("evm_mine", []);
};

async function sendERC20(erc20: ERC20, whale: Signer, recipient: string, amount: BigNumber): Promise<void> {
  await erc20.connect(whale).transfer(recipient, amount);
}

async function mintAndClaim(user: SignerWithAddress = depositor): Promise<void> {
  await contracts.token.usdc.connect(user).approve(contracts.threeXBatchProcessing.address, parseEther("10000"));
  await contracts.threeXBatchProcessing.connect(user).depositForMint(BigNumber.from(11000_000_000), user.address);
  const mintId = await contracts.threeXBatchProcessing.currentMintBatchId();
  await timeTravel(1800);
  await contracts.threeXBatchProcessing.connect(owner).batchMint();
  await contracts.threeXBatchProcessing.connect(user).claim(mintId, user.address);
}

const mintDeposit = async (amount?: number, user: SignerWithAddress = depositor) => {
  const bigNumberAmount = BigNumber.from(amount ? amount.toString() : "10000000");
  await sendERC20(contracts.token.usdc, usdcWhale, user.address, bigNumberAmount);
  await contracts.token.usdc.connect(user).approve(contracts.threeXBatchProcessing.address, bigNumberAmount);
  await contracts.threeXBatchProcessing.connect(user).depositForMint(bigNumberAmount, user.address);
};

const mintSubject = async (batchId) => {
  const adapter = new ThreeXBatchAdapter(contracts.threeXBatchProcessing);
  const batch = await adapter.getBatch(batchId);
  return batch;
};

const redeemDeposit = async (amount?: number, user: SignerWithAddress = depositor) => {
  const bigNumberAmount = parseEther(amount ? amount.toString() : "1");
  await contracts.token.setToken.connect(user).approve(contracts.threeXBatchProcessing.address, bigNumberAmount);
  await contracts.threeXBatchProcessing.connect(user).depositForRedeem(bigNumberAmount);
};

const redeemSubject = async (batchId) => {
  const adapter = new ThreeXBatchAdapter(contracts.threeXBatchProcessing);
  const batch = await adapter.getBatch(batchId);
  return batch;
};

describe("ThreeXBatchProcessing - Fork", () => {
  beforeEach(async () => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.FORKING_RPC_URL,
            blockNumber: 14996971,
          },
        },
      ],
    });
    [owner, depositor, depositor1, depositor2] = await ethers.getSigners();
    contracts = await deployContracts();
    usdcWhale = await impersonateSigner(USDC_WHALE_ADDRESS);
    await sendEth(USDC_WHALE_ADDRESS, "10");
    await sendERC20(contracts.token.usdc, usdcWhale, depositor.address, BigNumber.from(50_000_000_000));
    await contracts.token.usdc
      .connect(depositor)
      .approve(contracts.threeXBatchProcessing.address, parseEther("100000000"));
    await contracts.threeXBatchProcessing.setSlippage(45, 80);
  });
  it.skip("test slippage", async () => {
    const ySUSD = (await ethers.getContractAt("ERC20", Y_SUSD_ADDRESS)) as ERC20;
    const y3Eur = (await ethers.getContractAt("ERC20", Y_3EUR_ADDRESS)) as ERC20;

    const crvSUSD = (await ethers.getContractAt("ERC20", CRV_SUSD_ADDRESS)) as ERC20;
    const crv3Eur = (await ethers.getContractAt("ERC20", THREE_EUR_METAPOOL_ADDRESS)) as ERC20;

    const mintBatchId = await contracts.threeXBatchProcessing.currentMintBatchId();

    await contracts.threeXBatchProcessing.setFee(
      utils.formatBytes32String("mint"),
      75,
      owner.address,
      "0x8b97ADE5843c9BE7a1e8c95F32EC192E31A46cf3"
    );

    await contracts.threeXBatchProcessing.setSlippage(30, 80);

    await contracts.threeXBatchProcessing
      .connect(depositor)
      .depositForMint(BigNumber.from(20_000_000_000), depositor.address);

    await contracts.threeXBatchProcessing.batchMint();

    const mintBatch = await contracts.threeXBatchProcessing.getBatch(mintBatchId);
    console.log("3x", mintBatch.targetTokenBalance.toString());
    console.log("crvSUSD", await (await crvSUSD.balanceOf(contracts.threeXBatchProcessing.address)).toString());
    console.log("crv3E", await (await crv3Eur.balanceOf(contracts.threeXBatchProcessing.address)).toString());
    console.log("ySUSD", await (await ySUSD.balanceOf(contracts.threeXBatchProcessing.address)).toString());
    console.log("y3E", await (await y3Eur.balanceOf(contracts.threeXBatchProcessing.address)).toString());
  });

  describe("EOA only flash loan defender", () => {
    it("does not allow interaction from unapproved contracts on depositForMint", async () => {
      const defendedContract = await ethers.getContractFactory("ButterBatchProcessingDefendedHelper");
      const deployed = await defendedContract.deploy(contracts.threeXBatchProcessing.address);
      await expectRevert(deployed.connect(depositor).depositMint(), "Access denied for caller");
    });
    it("does not allow interaction from unapproved contracts on depositForRedeem", async () => {
      const defendedContract = await ethers.getContractFactory("ButterBatchProcessingDefendedHelper");
      const deployed = await defendedContract.deploy(contracts.threeXBatchProcessing.address);
      await expectRevert(deployed.connect(depositor).depositRedeem(), "Access denied for caller");
    });
  });
  context("setters and getters", () => {
    describe("set slippage", async () => {
      const SLIPPAGE = 54;
      let result;
      beforeEach(async () => {
        result = await contracts.threeXBatchProcessing.connect(owner).setSlippage(SLIPPAGE, SLIPPAGE);
      });
      it("sets slippage value with correct permissions", async () => {
        const slippage = await contracts.threeXBatchProcessing.slippage();
        expectValue(slippage.mintBps, SLIPPAGE);
        expectValue(slippage.redeemBps, SLIPPAGE);
      });
      it("emits event", async () => {
        await expectEvent(result, contracts.threeXBatchProcessing, "SlippageUpdated", [
          [45, 80],
          [SLIPPAGE, SLIPPAGE],
        ]);
      });
      it("does not allow unauthenticated address to set redeem slippage", async () => {
        await expectRevert(
          contracts.threeXBatchProcessing.connect(depositor).setSlippage(SLIPPAGE, SLIPPAGE),
          "you dont have the right role"
        );
      });
    });

    describe("setUnderlyingTokens", () => {
      const yToken = "0x55559783f812b3af3ABBf7De64C3CD7Cc7d15555";
      const curveMetaPool = "0x1C6a9783F812b3Af3aBbf7de64c3cD7CC7D1af44";
      const lpToken = "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD";
      const oracle = "0x631C43612C498642211110Ba3026a6773b7fb7Fe";
      const utilityPool = "0x890f4e345B1dAED0367A877a1612f86A1f86985f";
      const angleRouter = "0xBB755240596530be0c1DE5DFD77ec6398471561d";
      let result;
      beforeEach(async () => {
        result = await contracts.threeXBatchProcessing
          .connect(owner)
          .setComponents([yToken], [{ lpToken, utilityPool, oracle, curveMetaPool, angleRouter }]);
      });

      it("sets curve pool token pairs", async () => {
        expect(await contracts.threeXBatchProcessing.componentDependencies(yToken)).to.deep.eq([
          lpToken,
          utilityPool,
          oracle,
          curveMetaPool,
          angleRouter,
        ]);
      });
      it("emits an event", async () => {
        await expect(result).to.emit(contracts.threeXBatchProcessing, "ComponentDependenciesUpdated");
      });
      it("should revert if not owner", async function () {
        await expectRevert(
          contracts.threeXBatchProcessing.connect(depositor).setComponents(
            [yToken],
            [
              {
                lpToken,
                utilityPool,
                oracle,
                curveMetaPool,
                angleRouter,
              },
            ]
          ),
          "you dont have the right role"
        );
      });
    });
    describe("setProcessingThreshold", () => {
      const cooldown = 52414;
      const mintThreshold = parseEther("100");
      const redeemThreshold = parseEther("100");
      let result;
      beforeEach(async () => {
        result = await contracts.threeXBatchProcessing.setProcessingThreshold(cooldown, mintThreshold, redeemThreshold);
      });
      it("sets processing threshold", async () => {
        const processingThreshold = await contracts.threeXBatchProcessing.processingThreshold();
        expect(processingThreshold[0]).to.equal(BigNumber.from("52414"));
        expect(processingThreshold[1]).to.equal(mintThreshold);
        expect(processingThreshold[2]).to.equal(redeemThreshold);
      });
      it("emits an event", async () => {
        expectEvent(result, contracts.threeXBatchProcessing, "ProcessingThresholdUpdated", [
          [BigNumber.from("1800"), parseEther("20000"), parseEther("200")],
          [BigNumber.from("52414"), mintThreshold, redeemThreshold],
        ]);
      });
      it("should revert if not owner", async function () {
        await expectRevert(
          contracts.threeXBatchProcessing
            .connect(depositor)
            .setProcessingThreshold(cooldown, mintThreshold, redeemThreshold),
          "you dont have the right role"
        );
      });
    });
  });
  context("set storage", () => {
    it("should set a new storage contract", async () => {
      const newBatchStorage = await (
        await (
          await ethers.getContractFactory("ThreeXBatchVault")
        ).deploy(contracts.contractRegistry.address, contracts.threeXBatchProcessing.address)
      ).deployed();
      await contracts.threeXBatchProcessing.setBatchStorage(newBatchStorage.address);
      await expectValue(await contracts.threeXBatchProcessing.batchStorage(), newBatchStorage.address);
    });
    it("should revert when not called by owner", async () => {
      const newBatchStorage = await (
        await (
          await ethers.getContractFactory("ThreeXBatchVault")
        ).deploy(contracts.contractRegistry.address, contracts.threeXBatchProcessing.address)
      ).deployed();

      await expectRevert(
        contracts.threeXBatchProcessing.connect(depositor).setBatchStorage(newBatchStorage.address),
        "you dont have the right role"
      );
    });
    describe("mint batch generation", () => {
      it("should set a non-zero batchId when initialized", async () => {
        const batchId0 = await contracts.threeXStorage.batchIds(0);
        const adapter = new ThreeXBatchAdapter(contracts.threeXBatchProcessing);
        const batch = await adapter.getBatch(batchId0);
        expect(
          batch.batchId.match(/0x.+[^0x0000000000000000000000000000000000000000000000000000000000000000]/)?.length
        ).equal(1);
      });
      it("should set batch struct properties the first time batchStorage gets set", async () => {
        const batchId0 = await contracts.threeXStorage.batchIds(0);
        const adapter = new ThreeXBatchAdapter(contracts.threeXBatchProcessing);
        const batch = await adapter.getBatch(batchId0);
        expect(batch).to.deep.contain({
          batchType: BatchType.Mint,
          claimable: false,
          claimableTokenAddress: contracts.token.setToken.address,
          suppliedTokenAddress: contracts.token.usdc.address,
        });
        expect(batch.claimableTokenBalance).to.equal(BigNumber.from(0));
        expect(batch.unclaimedShares).to.equal(BigNumber.from(0));
        expect(batch.suppliedTokenBalance).to.equal(BigNumber.from(0));
      });
    });
    describe("redeem batch generation", () => {
      it("should set a non-zero batchId when initialized", async () => {
        const batchId1 = await contracts.threeXStorage.batchIds(1);
        const adapter = new ThreeXBatchAdapter(contracts.threeXBatchProcessing);
        const batch = await adapter.getBatch(batchId1);
        expect(
          batch.batchId.match(/0x.+[^0x0000000000000000000000000000000000000000000000000000000000000000]/)?.length
        ).equal(1);
      });

      it("should set batch struct properties the first time batchStorage gets set", async () => {
        const batchId1 = await contracts.threeXStorage.batchIds(1);
        const adapter = new ThreeXBatchAdapter(contracts.threeXBatchProcessing);
        const batch = await adapter.getBatch(batchId1);
        expect(batch).to.deep.contain({
          batchType: BatchType.Redeem,
          claimable: false,
          claimableTokenAddress: contracts.token.usdc.address,
          suppliedTokenAddress: contracts.token.setToken.address,
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
        it("increments suppliedTokenBalance and unclaimedShares with deposit", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
          await mintDeposit(10);
          const batch = await mintSubject(batchId);
          expect(batch.suppliedTokenBalance).to.equal(BigNumber.from("10"));
          expect(batch.unclaimedShares).to.equal(BigNumber.from("10"));
        });
        it("depositing does not make a batch claimable", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
          await mintDeposit(10);
          expect(await mintSubject(batchId)).to.deep.contain({
            claimable: false,
          });
        });
        it("increments suppliedTokenBalance and unclaimedShares when multiple deposits are made", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
          await mintDeposit(); // 10
          await mintDeposit(); // 10
          await mintDeposit(); // 10
          const batch = await mintSubject(batchId);
          expect(batch.claimableTokenBalance).to.equal(BigNumber.from("0"));
          expect(batch.suppliedTokenBalance).to.equal(BigNumber.from("30000000"));
          expect(batch.unclaimedShares).to.equal(BigNumber.from("30000000"));
        });
        it("increments claimableTokenBalance when batch is minted", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
          await mintDeposit();
          await timeTravel(1800);

          await contracts.threeXBatchProcessing.connect(owner).batchMint();
          const batchButterOwned = await contracts.token.setToken.balanceOf(
            await contracts.threeXBatchProcessing.batchStorage()
          );
          const batch = await mintSubject(batchId);
          expect(batch.claimableTokenBalance).to.equal(batchButterOwned);
          expect(batch.suppliedTokenBalance).to.equal(BigNumber.from("10000000"));
          expect(batch.unclaimedShares).to.equal(BigNumber.from("10000000"));
        });
        it("sets batch to claimable when batch is minted", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
          await mintDeposit();
          await timeTravel(1800);

          await contracts.threeXBatchProcessing.connect(owner).batchMint();
          const batch = await mintSubject(batchId);
          expect(batch.claimable).to.equal(true);
        });
        it("decrements unclaimedShares and claimable when claim is made", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
          await mintDeposit();
          await timeTravel(1800);

          await contracts.threeXBatchProcessing.connect(owner).batchMint();
          await contracts.threeXBatchProcessing.connect(depositor).claim(batchId, depositor.address);
          const batch = await mintSubject(batchId);
          expect(batch.claimable).to.equal(true);
          expect(batch.claimableTokenBalance).to.equal(BigNumber.from("0"));
          expect(batch.unclaimedShares).to.equal(BigNumber.from("0"));
        });
      });
      it("deposits usdc in the current mintBatch", async function () {
        const result = await contracts.threeXBatchProcessing
          .connect(depositor)
          .depositForMint(BigNumber.from("10000000"), depositor.address);
        await expect(result)
          .to.emit(contracts.threeXBatchProcessing, "Deposit")
          .withArgs(depositor.address, BigNumber.from("10000000"));
        expect(await contracts.token.usdc.balanceOf(await contracts.threeXBatchProcessing.batchStorage())).to.equal(
          BigNumber.from("10000000")
        );
        const currentMintBatchId = await contracts.threeXBatchProcessing.currentMintBatchId();
        const currentBatch = await contracts.threeXBatchProcessing.getBatch(currentMintBatchId);
        expect(currentBatch.sourceTokenBalance).to.equal(BigNumber.from("10000000"));
        expect(currentBatch.unclaimedShares).to.equal(BigNumber.from("10000000"));
      });
      it("adds the mintBatch to the users batches", async function () {
        await contracts.token.usdc
          .connect(depositor)
          .approve(contracts.threeXBatchProcessing.address, BigNumber.from("10000000"));
        await contracts.threeXBatchProcessing
          .connect(depositor)
          .depositForMint(BigNumber.from("10000000"), depositor.address);

        const currentMintBatchId = await contracts.threeXBatchProcessing.currentMintBatchId();
        expect(await contracts.threeXStorage.accountBatches(depositor.address, 0)).to.equal(currentMintBatchId);
      });
      it("allows multiple deposits", async function () {
        await sendERC20(contracts.token.usdc, usdcWhale, depositor1.address, BigNumber.from(10_000_000));
        await sendERC20(contracts.token.usdc, usdcWhale, depositor2.address, BigNumber.from(10_000_000));

        await contracts.token.usdc
          .connect(depositor)
          .approve(contracts.threeXBatchProcessing.address, BigNumber.from("10000000"));
        await contracts.threeXBatchProcessing
          .connect(depositor)
          .depositForMint(BigNumber.from("10000000"), depositor.address);

        await contracts.token.usdc
          .connect(depositor1)
          .approve(contracts.threeXBatchProcessing.address, BigNumber.from("10000000"));
        await contracts.threeXBatchProcessing
          .connect(depositor1)
          .depositForMint(BigNumber.from("10000000"), depositor1.address);

        await contracts.token.usdc
          .connect(depositor2)
          .approve(contracts.threeXBatchProcessing.address, BigNumber.from("10000000"));
        await contracts.threeXBatchProcessing
          .connect(depositor2)
          .depositForMint(BigNumber.from("5000000"), depositor2.address);
        await contracts.threeXBatchProcessing
          .connect(depositor2)
          .depositForMint(BigNumber.from("5000000"), depositor2.address);

        const currentMintBatchId = await contracts.threeXBatchProcessing.currentMintBatchId();
        const currentBatch = await contracts.threeXBatchProcessing.getBatch(currentMintBatchId);
        expect(currentBatch.sourceTokenBalance).to.equal(BigNumber.from("30000000"));
        expect(currentBatch.unclaimedShares).to.equal(BigNumber.from("30000000"));
        expect(await contracts.threeXStorage.accountBatches(depositor.address, 0)).to.equal(currentMintBatchId);
        expect(await contracts.threeXStorage.accountBatches(depositor1.address, 0)).to.equal(currentMintBatchId);
        expect(await contracts.threeXStorage.accountBatches(depositor2.address, 0)).to.equal(currentMintBatchId);
      });
    });
    context("claiming", function () {
      let batchId;
      beforeEach(async function () {
        batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      });
      it("reverts when batch is not yet claimable", async function () {
        await mintDeposit();
        await expect(
          contracts.threeXBatchProcessing.connect(depositor).claim(batchId, depositor.address)
        ).to.be.revertedWith("not yet claimable");
      });
      it("claims batch successfully", async function () {
        await mintDeposit();
        await timeTravel(1800);
        await contracts.threeXBatchProcessing.connect(owner).batchMint();
        await expect(
          await contracts.threeXBatchProcessing.connect(depositor).claim(batchId, depositor.address)
        ).to.emit(contracts.threeXBatchProcessing, "Claimed");
        await expectBigNumberCloseTo(
          await contracts.token.setToken.balanceOf(depositor.address),
          parseEther("128.317657310824363389"),
          parseEther("0.00015")
        );
      });
      describe("claim and stake", () => {
        it("claims and stakes batch successully", async function () {
          await mintDeposit();
          await timeTravel(1800);
          await contracts.threeXBatchProcessing.connect(owner).batchMint();
          expect(await contracts.threeXBatchProcessing.connect(depositor).claimAndStake(batchId)).to.emit(
            contracts.threeXBatchProcessing,
            "Claimed"
          );
          expectBigNumberCloseTo(
            await contracts.staking.balanceOf(depositor.address),
            parseEther("128.317171800624366821"),
            parseEther("0.00015")
          );
        });
        it("reverts when batch is not yet claimable", async function () {
          await mintDeposit();
          await expect(contracts.threeXBatchProcessing.connect(depositor).claimAndStake(batchId)).to.be.revertedWith(
            "not yet claimable"
          );
        });
        it("reverts when the batchType is Redeem", async function () {
          //Prepare claimable redeem batch
          await mintAndClaim();
          await contracts.token.setToken
            .connect(depositor)
            .approve(contracts.threeXBatchProcessing.address, parseEther("1"));
          await contracts.threeXBatchProcessing.connect(depositor).depositForRedeem(parseEther("1"));
          await provider.send("evm_increaseTime", [1800]);
          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();

          await contracts.threeXBatchProcessing.connect(owner).batchRedeem();

          //Actual Test
          await expect(contracts.threeXBatchProcessing.connect(depositor).claimAndStake(batchId)).to.be.revertedWith(
            "wrong batch type"
          );
        });
      });
    });
    context("success", function () {
      it("batch mints", async function () {
        await mintDeposit();
        await timeTravel(1800);

        expect(await contracts.threeXBatchProcessing.connect(owner).batchMint()).to.emit(
          contracts.threeXBatchProcessing,
          "BatchMinted"
        );
        expectBigNumberCloseTo(
          await contracts.token.setToken.balanceOf(contracts.threeXBatchProcessing.address),
          parseEther("1283.232294321335542932"),
          parseEther("0.00015")
        );
      });
      it("mints twice", async () => {
        await mintAndClaim();
        await mintAndClaim();
      });
      it("mints early when mintThreshold is met", async function () {
        await contracts.threeXBatchProcessing
          .connect(owner)
          .setProcessingThreshold(1800, 0, BigNumber.from("10000000"));
        await mintDeposit();
        await expect(contracts.threeXBatchProcessing.connect(owner).batchMint()).to.emit(
          contracts.threeXBatchProcessing,
          "BatchMinted"
        );
      });
      it("advances to the next batch", async function () {
        await mintDeposit();

        await timeTravel(1800);

        const previousMintBatchId = await contracts.threeXBatchProcessing.currentMintBatchId();
        await contracts.threeXBatchProcessing.connect(owner).batchMint();

        const previousBatch = await contracts.threeXBatchProcessing.getBatch(previousMintBatchId);
        expect(previousBatch.claimable).to.equal(true);

        const currentMintBatchId = await contracts.threeXBatchProcessing.currentMintBatchId();
        expect(currentMintBatchId).to.not.equal(previousMintBatchId);
      });
    });
    context("reverts", function () {
      it("reverts when minting too early", async function () {
        await mintDeposit();
        await expect(contracts.threeXBatchProcessing.connect(owner).batchMint()).to.be.revertedWith(
          "can not execute batch mint yet"
        );
      });
      it("reverts when called by someone other the keeper", async function () {
        await mintDeposit();

        await provider.send("evm_increaseTime", [1800]);

        await expect(contracts.threeXBatchProcessing.connect(depositor).batchMint()).to.be.revertedWith(
          "you dont have the right role"
        );
      });
      it("reverts when slippage is too high", async () => {
        await contracts.threeXBatchProcessing.connect(owner).setSlippage(0, 0);
        await mintDeposit();
        await timeTravel(1800);

        await expect(contracts.threeXBatchProcessing.connect(owner).batchMint()).to.be.revertedWith(
          "slippage too high"
        );
      });
    });
  });

  describe("redeeming", function () {
    beforeEach(async function () {
      await mintAndClaim();
    });
    context("depositing", function () {
      describe("batch struct", () => {
        it("increments suppliedTokenBalance and unclaimedShares when a redeem deposit is made", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
          await redeemDeposit();
          const batch = await redeemSubject(batchId);
          expect(batch.suppliedTokenBalance).to.equal(parseEther("1"));
          expect(batch.claimable).to.equal(false);
          expect(batch.unclaimedShares).to.equal(parseEther("1"));
        });
        it("increments suppliedTokenBalance and unclaimedShares when multiple deposits are made", async () => {
          await mintAndClaim();
          await mintAndClaim();
          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
          await redeemDeposit(); // 1
          await redeemDeposit(); // 1
          await redeemDeposit(); // 1
          const batch = await redeemSubject(batchId);
          expect(batch.claimableTokenBalance).to.equal(parseEther("0"));
          expect(batch.suppliedTokenBalance).to.equal(parseEther("3"));
          expect(batch.claimable).to.equal(false);
          expect(batch.unclaimedShares).to.equal(parseEther("3"));
        });
        it("updates struct when batch is redeemed", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
          await redeemDeposit(); // 1
          await timeTravel(1800); // wait enough time to redeem batch
          await contracts.threeXBatchProcessing.connect(owner).batchRedeem();

          const batch = await redeemSubject(batchId);
          expect(batch.suppliedTokenBalance).to.equal(parseEther("1"));
          expect(batch.claimable).to.equal(true);
          expect(batch.unclaimedShares).to.equal(parseEther("1"));
        });
        it("decrements unclaimedShares and claimable when claim is made", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
          await redeemDeposit(); // 10
          await timeTravel(1800); // wait enough time to redeem batch
          await contracts.threeXBatchProcessing.batchRedeem();
          await contracts.threeXBatchProcessing.connect(depositor).claim(batchId, depositor.address);

          const batch = await redeemSubject(batchId);
          expect(batch.claimableTokenBalance).to.equal(parseEther("0"));
          expect(batch.claimable).to.equal(true);
          expect(batch.unclaimedShares).to.equal(parseEther("0"));
        });
      });
      it("deposits setToken in the current redeemBatch", async function () {
        await contracts.token.setToken
          .connect(depositor)
          .approve(contracts.threeXBatchProcessing.address, parseEther("1"));
        const result = await contracts.threeXBatchProcessing.connect(depositor).depositForRedeem(parseEther("1"));
        await expect(result)
          .to.emit(contracts.threeXBatchProcessing, "Deposit")
          .withArgs(depositor.address, parseEther("1"));
        expect(await contracts.token.setToken.balanceOf(await contracts.threeXBatchProcessing.batchStorage())).to.equal(
          parseEther("1")
        );
        const currentRedeemBatchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
        const currentBatch = await contracts.threeXBatchProcessing.getBatch(currentRedeemBatchId);
        expect(currentBatch.sourceTokenBalance).to.equal(parseEther("1"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("1"));
      });
      it("adds the redeemBatch to the users batches", async function () {
        await redeemDeposit();

        const currentRedeemBatchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
        expect(await contracts.threeXStorage.accountBatches(depositor.address, 1)).to.equal(currentRedeemBatchId);
      });
      it("allows multiple deposits", async function () {
        await sendERC20(contracts.token.usdc, usdcWhale, depositor1.address, BigNumber.from(11_000_000_000));
        await sendERC20(contracts.token.usdc, usdcWhale, depositor2.address, BigNumber.from(11_000_000_000));
        await mintAndClaim(depositor1);
        await mintAndClaim(depositor2);
        await redeemDeposit();
        await redeemDeposit(1, depositor1);
        await redeemDeposit(0.5, depositor2);
        await redeemDeposit(0.5, depositor2);
        const currentRedeemBatchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
        const currentBatch = await contracts.threeXStorage.getBatch(currentRedeemBatchId);
        expect(currentBatch.sourceTokenBalance).to.equal(parseEther("3"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("3"));
        expect(await contracts.threeXStorage.accountBatches(depositor.address, 1)).to.equal(currentRedeemBatchId);
        expect(await contracts.threeXStorage.accountBatches(depositor1.address, 1)).to.equal(currentRedeemBatchId);
        expect(await contracts.threeXStorage.accountBatches(depositor2.address, 1)).to.equal(currentRedeemBatchId);
      });
    });
    it("batch redeems", async function () {
      await contracts.token.setToken
        .connect(depositor)
        .approve(contracts.threeXBatchProcessing.address, parseEther("100"));
      await contracts.threeXBatchProcessing.connect(depositor).depositForRedeem(parseEther("1"));
      await provider.send("evm_increaseTime", [1800]);

      expect(await contracts.threeXBatchProcessing.connect(owner).batchRedeem()).to.emit(
        contracts.threeXBatchProcessing,
        "BatchRedeemed"
      );
      expectBigNumberCloseTo(
        await contracts.token.usdc.balanceOf(contracts.threeXBatchProcessing.address),
        parseEther("7704.791831148143290671"),
        parseEther("0.00015")
      );
    });
    it("redeems early when redeemThreshold is met", async function () {
      await contracts.threeXBatchProcessing.connect(owner).setProcessingThreshold(1800, BigNumber.from("10000000"), 0);
      await redeemDeposit();
      await expect(contracts.threeXBatchProcessing.connect(owner).batchRedeem()).to.emit(
        contracts.threeXBatchProcessing,
        "BatchRedeemed"
      );
    });
    it("advances to the next batch", async function () {
      await redeemDeposit();
      await timeTravel(1800);

      const previousRedeemBatchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
      await contracts.threeXBatchProcessing.connect(owner).batchRedeem();

      const previousBatch = await contracts.threeXBatchProcessing.getBatch(previousRedeemBatchId);
      expect(previousBatch.claimable).to.equal(true);

      const currentRedeemBatchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
      expect(currentRedeemBatchId).to.not.equal(previousRedeemBatchId);
    });
    context("claiming", function () {
      it("reverts when batch is not yet claimable", async function () {
        await redeemDeposit();
        const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
        await expect(
          contracts.threeXBatchProcessing.connect(depositor).claim(batchId, depositor.address)
        ).to.be.revertedWith("not yet claimable");
      });
      it("claim batch successfully", async function () {
        await redeemDeposit();
        await timeTravel(1800);
        const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
        await contracts.threeXBatchProcessing.connect(owner).batchRedeem();

        await timeTravel(1000);
        expect(await contracts.threeXBatchProcessing.connect(depositor).claim(batchId, depositor.address)).to.emit(
          contracts.threeXBatchProcessing,
          "Claimed"
        );
        expectBigNumberCloseTo(
          await contracts.token.usdc.balanceOf(depositor.address),
          parseEther("7704.746559839569104981"),
          parseEther("0.00015")
        );
      });
    });
  });
  describe("withdrawing from batch", function () {
    let batchId;
    context("mint batch withdrawal", () => {
      beforeEach(async function () {
        await contracts.threeXBatchProcessing
          .connect(depositor)
          .depositForMint(BigNumber.from("1000000000"), depositor.address);
        batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      });
      it("transfers usdc to depositor after withdraw", async function () {
        const balanceBefore = await contracts.token.usdc.balanceOf(depositor.address);
        await contracts.threeXBatchProcessing
          .connect(depositor)
          ["withdrawFromBatch(bytes32,uint256,address)"](batchId, BigNumber.from("1000000000"), depositor.address);
        const balanceAfter = await contracts.token.usdc.balanceOf(depositor.address);
        expect(balanceAfter.sub(balanceBefore)).to.equal(BigNumber.from("1000000000"));
      });
    });
    context("redeem batch withdrawal", () => {
      beforeEach(async function () {
        await mintAndClaim();
        await contracts.token.setToken
          .connect(depositor)
          .approve(contracts.threeXBatchProcessing.address, parseEther("10"));
        await contracts.threeXBatchProcessing.connect(depositor).depositForRedeem(parseEther("1"));
        batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
      });
      it("transfers set token to depositor after withdraw", async function () {
        await contracts.threeXBatchProcessing
          .connect(depositor)
          ["withdrawFromBatch(bytes32,uint256,address)"](batchId, parseEther("1"), depositor.address);
        expectBigNumberCloseTo(
          await contracts.token.setToken.balanceOf(depositor.address),
          parseEther("128.313565895760310099"),
          parseEther("0.00015")
        );
      });
    });
  });

  context("withdrawing from batch", function () {
    describe("batch struct", () => {
      const withdraw = async (batchId: string, amount?: BigNumber) => {
        return contracts.threeXBatchProcessing
          .connect(depositor)
          ["withdrawFromBatch(bytes32,uint256,address)"](
            batchId,
            amount ? amount : parseEther("10"),
            depositor.address
          );
      };
      const subject = async (batchId) => {
        const adapter = new ThreeXBatchAdapter(contracts.threeXBatchProcessing);
        const batch = await adapter.getBatch(batchId);
        return batch;
      };
      context("redeem batch withdrawal", () => {
        beforeEach(async function () {
          await mintAndClaim();
          await redeemDeposit();
        });

        it("prevents stealing funds", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();

          await expectRevert(
            contracts.threeXBatchProcessing
              .connect(depositor)
              ["withdrawFromBatch(bytes32,uint256,address,address)"](
                batchId,
                parseEther("1"),
                depositor.address,
                owner.address
              ),
            "won't send"
          );
        });

        it("decrements suppliedTokenBalance and unclaimedShares when a withdrawal is made", async () => {
          await mintAndClaim();
          await redeemDeposit();

          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
          const batchBefore = await subject(batchId);

          await withdraw(batchId, parseEther("1"));
          const batchAfter = await subject(batchId);
          expect(batchAfter.suppliedTokenBalance.lt(batchBefore.suppliedTokenBalance)).to.be.true;
          expect(batchAfter.unclaimedShares.lt(batchBefore.unclaimedShares)).to.be.true;
        });
        it("decrements suppliedTokenBalance and unclaimedShares when multiple withdrawls are made", async () => {
          await mintAndClaim();
          await redeemDeposit();
          await mintAndClaim();
          await redeemDeposit();
          await mintAndClaim();
          await redeemDeposit();

          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
          const batchBefore = await subject(batchId);
          await withdraw(batchId, parseEther("1"));
          await withdraw(batchId, parseEther("1"));
          await withdraw(batchId, parseEther("1"));
          const batchAfter = await subject(batchId);
          expect(batchBefore.suppliedTokenBalance.sub(parseEther("3"))).to.equal(batchAfter.suppliedTokenBalance);
          expect(batchBefore.unclaimedShares.sub(parseEther("3"))).to.equal(batchAfter.unclaimedShares);
        });
        it("transfers set token to depositor after withdraw", async function () {
          const batchId = await contracts.threeXStorage.accountBatches(depositor.address, 1);
          await contracts.threeXBatchProcessing
            .connect(depositor)
            ["withdrawFromBatch(bytes32,uint256,address)"](batchId, BigNumber.from("1"), depositor.address);
          expectBigNumberCloseTo(
            await contracts.token.setToken.balanceOf(depositor.address),
            BigNumber.from("8297564781640256149"),
            parseEther("0.00015")
          );
        });
        it("reverts when the batch was already redeemed", async function () {
          const batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
          await timeTravel(1800);
          await contracts.threeXBatchProcessing.connect(owner).batchRedeem();
          await expect(withdraw(batchId, parseEther("1"))).to.be.revertedWith("already processed");
        });
      });
      context("mint batch withdrawal", () => {
        beforeEach(async function () {
          await mintDeposit();
        });
        it("decrements suppliedTokenBalance and unclaimedShares when a withdrawal is made", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
          const batchBefore = await subject(batchId);
          await withdraw(batchId, BigNumber.from("10000000"));
          const batchAfter = await subject(batchId);
          expect(batchAfter.suppliedTokenBalance.lt(batchBefore.suppliedTokenBalance)).to.be.true;
          expect(batchAfter.unclaimedShares.lt(batchBefore.unclaimedShares)).to.be.true;
        });
        it("decrements suppliedTokenBalance and unclaimedShares when multiple withdrawals are made", async () => {
          const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
          const batchBefore = await subject(batchId);
          await withdraw(batchId, BigNumber.from("1000000"));
          await withdraw(batchId, BigNumber.from("1000000"));
          await withdraw(batchId, BigNumber.from("1000000"));
          const batchAfter = await subject(batchId);
          expect(batchBefore.suppliedTokenBalance.sub(BigNumber.from("3000000"))).to.equal(
            batchAfter.suppliedTokenBalance
          );
          expect(batchBefore.unclaimedShares.sub(BigNumber.from("3000000"))).to.equal(batchAfter.unclaimedShares);
        });
        it("emits an event when withdrawn", async function () {
          const batchId = await contracts.threeXStorage.accountBatches(depositor.address, 0);
          await expect(await withdraw(batchId, BigNumber.from("10000000")))
            .to.emit(contracts.threeXBatchProcessing, "WithdrawnFromBatch")
            .withArgs(batchId, BigNumber.from("10000000"), depositor.address);
        });
        it("transfers usdc to depositor after withdraw", async function () {
          const batchId = await contracts.threeXStorage.accountBatches(depositor.address, 0);
          const balanceBefore = await contracts.token.usdc.balanceOf(depositor.address);
          await contracts.threeXBatchProcessing
            .connect(depositor)
            ["withdrawFromBatch(bytes32,uint256,address)"](batchId, BigNumber.from("10000000"), depositor.address);
          const balanceAfter = await contracts.token.usdc.balanceOf(depositor.address);
          expect(balanceAfter.sub(balanceBefore)).to.equal(BigNumber.from("10000000"));
        });
        it("reverts when the batch was already minted", async function () {
          const batchId = await contracts.threeXStorage.accountBatches(depositor.address, 0);
          await timeTravel(1800);
          await contracts.threeXBatchProcessing.batchMint();
          await expect(withdraw(batchId, BigNumber.from("1000000"))).to.be.revertedWith("already processed");
        });
      });
    });
  });

  context("depositUnclaimedSetTokenForRedeem", function () {
    it("moves set token into current redeemBatch", async function () {
      await contracts.token.usdc
        .connect(depositor)
        .approve(contracts.threeXBatchProcessing.address, parseEther("10000"));
      await contracts.threeXBatchProcessing
        .connect(depositor)
        .depositForMint(BigNumber.from("1000000000"), depositor.address);
      const batchId = await contracts.threeXStorage.accountBatches(depositor.address, 0);
      await provider.send("evm_increaseTime", [1800]);
      await provider.send("evm_mine", []);
      await contracts.threeXBatchProcessing.connect(owner).batchMint();
      const mintedButter = await contracts.token.setToken.balanceOf(
        await contracts.threeXBatchProcessing.batchStorage()
      );
      expect(
        await contracts.threeXBatchProcessing
          .connect(depositor)
          .moveUnclaimedIntoCurrentBatch([batchId], [BigNumber.from("1000000000")], false)
      ).to.emit(contracts.threeXBatchProcessing, "DepositedUnclaimedSetTokenForRedeem");
      const currentRedeemBatchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
      const redeemBatch = await contracts.threeXBatchProcessing.getBatch(currentRedeemBatchId);
      expect(redeemBatch.sourceTokenBalance).to.be.equal(mintedButter);
    });
  });

  context("paused", function () {
    let claimableMintId;
    let claimableRedeemId;
    let currentMintId;
    let currentRedeemId;

    beforeEach(async function () {
      //Prepare MintBatches
      claimableMintId = await contracts.threeXBatchProcessing.currentMintBatchId();
      await mintDeposit();
      await timeTravel(1800);
      await contracts.threeXBatchProcessing.connect(owner).batchMint();

      //Prepare RedeemBatches
      claimableRedeemId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
      await mintAndClaim();
      await redeemDeposit();
      await contracts.threeXBatchProcessing.connect(owner).batchRedeem();
      currentRedeemId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
      await mintAndClaim();
      await redeemDeposit();

      //Prepare 2. MintBatch
      currentMintId = await contracts.threeXBatchProcessing.currentMintBatchId();
      await mintDeposit();

      //Allow token for later usage
      await contracts.token.setToken
        .connect(depositor)
        .approve(contracts.threeXBatchProcessing.address, parseEther("10"));
      await contracts.token.usdc.connect(depositor).approve(contracts.threeXBatchProcessing.address, parseEther("10"));

      //Pause Contract
      await contracts.threeXBatchProcessing.connect(owner).pause();
    });
    it("prevents deposit for mint", async function () {
      await expectRevert(
        contracts.threeXBatchProcessing.connect(depositor).depositForMint(parseEther("1"), depositor.address),
        "Pausable: paused"
      );
    });
    it("prevents deposit for redeem", async function () {
      await expectRevert(
        contracts.threeXBatchProcessing.connect(depositor).depositForRedeem(parseEther("1")),
        "Pausable: paused"
      );
    });
    it("prevents mint", async function () {
      await expectRevert(contracts.threeXBatchProcessing.connect(owner).batchMint(), "Pausable: paused");
    });
    it("prevents redeem", async function () {
      await expectRevert(contracts.threeXBatchProcessing.connect(owner).batchRedeem(), "Pausable: paused");
    });
    it("prevents to move unclaimed deposits into the current batch", async function () {
      const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      await expectRevert(
        contracts.threeXBatchProcessing
          .connect(depositor)
          .moveUnclaimedIntoCurrentBatch([batchId], [parseEther("1")], true),
        "Pausable: paused"
      );
    });
    it("still allows to withdraw from mint batch", async function () {
      await expect(
        contracts.threeXBatchProcessing
          .connect(depositor)
          ["withdrawFromBatch(bytes32,uint256,address)"](currentMintId, BigNumber.from("10000000"), depositor.address)
      )
        .to.emit(contracts.threeXBatchProcessing, "WithdrawnFromBatch")
        .withArgs(currentMintId, BigNumber.from("10000000"), depositor.address);
    });
    it("still allows to withdraw from redeem batch", async function () {
      await expect(
        contracts.threeXBatchProcessing
          .connect(depositor)
          ["withdrawFromBatch(bytes32,uint256,address)"](currentRedeemId, parseEther("1"), depositor.address)
      )
        .to.emit(contracts.threeXBatchProcessing, "WithdrawnFromBatch")
        .withArgs(currentRedeemId, parseEther("1"), depositor.address);
    });
    it("still allows to claim minted butter", async function () {
      await expect(contracts.threeXBatchProcessing.connect(depositor).claim(claimableMintId, depositor.address))
        .to.emit(contracts.threeXBatchProcessing, "Claimed")
        .withArgs(depositor.address, BatchType.Mint, BigNumber.from("10000000"), BigNumber.from("994285180715117"));
    });
    it("still allows to claim redemeed usdc", async function () {
      await expect(contracts.threeXBatchProcessing.connect(depositor).claim(claimableRedeemId, depositor.address))
        .to.emit(contracts.threeXBatchProcessing, "Claimed")
        .withArgs(depositor.address, BatchType.Redeem, parseEther("1"), BigNumber.from("9932120547"));
    });
    it("allows deposits for minting after unpausing", async function () {
      await contracts.threeXBatchProcessing.unpause();

      await expect(
        contracts.threeXBatchProcessing
          .connect(depositor)
          .depositForMint(BigNumber.from("100000000"), depositor.address)
      )
        .to.emit(contracts.threeXBatchProcessing, "Deposit")
        .withArgs(depositor.address, BigNumber.from("100000000"));
    });
    it("allows deposits for redeeming after unpausing", async function () {
      await contracts.threeXBatchProcessing.unpause();

      await expect(contracts.threeXBatchProcessing.connect(depositor).depositForRedeem(parseEther("0.01")))
        .to.emit(contracts.threeXBatchProcessing, "Deposit")
        .withArgs(depositor.address, parseEther("0.01"));
    });
  });

  describe("allows only clients to interact with the storage contract", () => {
    const deposit = async (amount?: number) => {
      await contracts.threeXBatchProcessing
        .connect(depositor)
        .depositForMint(parseEther(amount ? amount.toString() : "10"), depositor.address);
    };
    it("reverts when a non client tries to deposit", async function () {
      const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      await expect(
        contracts.threeXStorage.connect(depositor).deposit(batchId, depositor.address, parseEther("10"))
      ).to.be.revertedWith("!allowed");
    });
    it("reverts when a non client tries to claim", async function () {
      const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      deposit();
      await expect(
        contracts.threeXStorage
          .connect(depositor)
          .claim(batchId, depositor.address, parseEther("10"), depositor.address)
      ).to.be.revertedWith("!allowed");
    });
    it("reverts when a non client tries to withdraw", async function () {
      const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      deposit();
      await expect(
        contracts.threeXStorage
          .connect(depositor)
          .withdraw(batchId, depositor.address, parseEther("10"), depositor.address)
      ).to.be.revertedWith("!allowed");
    });
    it("reverts when a non client tries to withdrawSourceTokenFromBatch", async function () {
      const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      deposit();
      await expect(contracts.threeXStorage.connect(depositor).withdrawSourceTokenFromBatch(batchId)).to.be.revertedWith(
        "!allowed"
      );
    });
    it("reverts when a non client tries to moveUnclaimedIntoCurrentBatch", async function () {
      const batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      const redeemId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
      deposit();
      await expect(
        contracts.threeXStorage
          .connect(depositor)
          .moveUnclaimedIntoCurrentBatch(batchId, redeemId, depositor.address, parseEther("1"))
      ).to.be.revertedWith("!allowed");
    });
  });
  describe("redemption fee", () => {
    context("sets RedemptionFee", () => {
      it("sets a redemptionRate when called with DAO role", async () => {
        await expect(
          await contracts.threeXBatchProcessing.setFee(
            utils.formatBytes32String("redeem"),
            100,
            owner.address,
            contracts.token.usdc.address
          )
        )
          .to.emit(contracts.threeXBatchProcessing, "FeeUpdated")
          .withArgs(utils.formatBytes32String("redeem"), 100, owner.address, contracts.token.usdc.address);

        const redemptionFee = await contracts.threeXBatchProcessing.fees(utils.formatBytes32String("redeem"));
        expect(redemptionFee[0]).to.equal(BigNumber.from("0"));
        expect(redemptionFee[1]).to.equal(BigNumber.from("100"));
        expect(redemptionFee[2]).to.equal(owner.address);
      });
      it("reverts when setting redemptionRate without DAO role", async () => {
        await expectRevert(
          contracts.threeXBatchProcessing
            .connect(depositor)
            .setFee(utils.formatBytes32String("redeem"), 100, owner.address, contracts.token.usdc.address),
          "you dont have the right role"
        );
      });
      it("reverts when setting a feeRate higher than 1%", async () => {
        await expectRevert(
          contracts.threeXBatchProcessing.setFee(
            utils.formatBytes32String("redeem"),
            1000,
            owner.address,
            contracts.token.usdc.address
          ),
          "dont be greedy"
        );
      });
    });
    context("with redemption fee", () => {
      let batchId;
      beforeEach(async () => {
        await mintAndClaim();
        await redeemDeposit();
        await contracts.threeXBatchProcessing.setSlippage(50, 50);
        await timeTravel(1800);
        batchId = await contracts.threeXBatchProcessing.currentRedeemBatchId();
      });
      it("fee is equivalent to difference between slippage amount and received amount up to 75bps", async () => {
        const feeRate = 75;
        const { threeXBatchProcessing } = contracts;
        const batchBefore = await threeXBatchProcessing.getBatch(batchId);

        await expect(contracts.threeXBatchProcessing.connect(owner).batchRedeem())
          .to.emit(contracts.threeXBatchProcessing, "BatchRedeemed")
          .withArgs(batchId, batchBefore.sourceTokenBalance, parseUnits("10003.48736", 6));

        const batchAfterRedeem = await threeXBatchProcessing.getBatch(batchId);
        const redeemedAmountAfterFees = batchAfterRedeem.targetTokenBalance;
        const accumulatedFees = (await contracts.threeXBatchProcessing.fees(utils.formatBytes32String("redeem")))
          .accumulated;
        const totalRedeemAmount = accumulatedFees.add(redeemedAmountAfterFees);

        expect(accumulatedFees).to.equal(parseUnits("41.330159", 6));
        expect(true).to.equal(accumulatedFees.lte(totalRedeemAmount.mul(feeRate).div(10000)));
      });

      it("can collect a 60 bps fee", async () => {
        const feeRate = 60;
        const { threeXBatchProcessing, token } = contracts;
        await threeXBatchProcessing.setFee(
          utils.formatBytes32String("redeem"),
          feeRate,
          owner.address,
          token.usdc.address
        );
        const batchBefore = await threeXBatchProcessing.getBatch(batchId);
        const redeemedAmount = parseUnits("10003.487360", 6);
        await expect(contracts.threeXBatchProcessing.connect(owner).batchRedeem())
          .to.emit(contracts.threeXBatchProcessing, "BatchRedeemed")
          .withArgs(batchId, batchBefore.sourceTokenBalance, redeemedAmount);

        const batchAfterRedeem = await threeXBatchProcessing.getBatch(batchId);

        const accumulatedFees = (await contracts.threeXBatchProcessing.fees(utils.formatBytes32String("redeem")))
          .accumulated;

        expect(redeemedAmount.sub(batchAfterRedeem.targetTokenBalance)).to.equal(parseUnits("41.330159", 6));

        expect(accumulatedFees).to.equal(parseUnits("41.330159", 6));
      });
    });
  });
  describe("mint fee", () => {
    context("sets MintFee", () => {
      it("sets a MintFee when called with DAO role", async () => {
        await expect(
          await contracts.threeXBatchProcessing.setFee(
            utils.formatBytes32String("mint"),
            100,
            owner.address,
            contracts.token.setToken.address
          )
        )
          .to.emit(contracts.threeXBatchProcessing, "FeeUpdated")
          .withArgs(utils.formatBytes32String("mint"), 100, owner.address, contracts.token.setToken.address);

        const redemptionFee = await contracts.threeXBatchProcessing.fees(utils.formatBytes32String("mint"));
        expect(redemptionFee[0]).to.equal(BigNumber.from("0"));
        expect(redemptionFee[1]).to.equal(BigNumber.from("100"));
        expect(redemptionFee[2]).to.equal(owner.address);
      });
      it("reverts when setting redemptionRate without DAO role", async () => {
        await expectRevert(
          contracts.threeXBatchProcessing
            .connect(depositor)
            .setFee(utils.formatBytes32String("mint"), 100, owner.address, contracts.token.usdc.address),
          "you dont have the right role"
        );
      });
      it("reverts when setting a feeRate higher than 1%", async () => {
        await expectRevert(
          contracts.threeXBatchProcessing.setFee(
            utils.formatBytes32String("mint"),
            1000,
            owner.address,
            contracts.token.usdc.address
          ),
          "dont be greedy"
        );
      });
    });
    context("with mint fee", () => {
      let batchId;
      beforeEach(async () => {
        await contracts.threeXBatchProcessing.setSlippage(50, 50);
        await contracts.threeXBatchProcessing.setFee(
          utils.formatBytes32String("mint"),
          50,
          owner.address,
          contracts.token.setToken.address
        );
        await mintDeposit(10000000000);
        await timeTravel(1800);
        batchId = await contracts.threeXBatchProcessing.currentMintBatchId();
      });
      it("fee is equivalent to difference between slippage amount and received amount up to 50bps", async () => {
        const feeRate = 50;
        const { threeXBatchProcessing } = contracts;
        const batchBeforeMint = await threeXBatchProcessing.getBatch(batchId);

        const minAmount = parseEther("0.995837983774335844");

        await expect(contracts.threeXBatchProcessing.connect(owner).batchMint())
          .to.emit(contracts.threeXBatchProcessing, "BatchMinted")
          .withArgs(batchId, batchBeforeMint.sourceTokenBalance, parseEther("0.995837983774335844"));

        const batchAfterMint = await threeXBatchProcessing.getBatch(batchId);
        const mintedTokens = batchAfterMint.targetTokenBalance;
        const accumulatedFees = (await contracts.threeXBatchProcessing.fees(utils.formatBytes32String("mint")))
          .accumulated;
        const totalMintedAmount = accumulatedFees.add(mintedTokens);

        expectBigNumberCloseTo(accumulatedFees, totalMintedAmount.sub(minAmount));
        expect(true).to.equal(accumulatedFees.lte(totalMintedAmount.mul(feeRate).div(10000)));
      });

      it("can collect a 5 bps fee", async () => {
        const feeRate = 5;
        const { threeXBatchProcessing } = contracts;
        threeXBatchProcessing.setFee(
          utils.formatBytes32String("mint"),
          feeRate,
          owner.address,
          contracts.token.setToken.address
        );

        const batchAfterMint = await threeXBatchProcessing.getBatch(batchId);
        const mintedTokens = batchAfterMint.targetTokenBalance;
        const accumulatedFees = (await contracts.threeXBatchProcessing.fees(utils.formatBytes32String("mint")))
          .accumulated;
        const totalMintedAmount = accumulatedFees.add(mintedTokens);

        expect(accumulatedFees).to.equal(totalMintedAmount.mul(feeRate).div(10000));
      });
    });
  });
});
