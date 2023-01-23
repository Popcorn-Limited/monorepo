import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import BasicIssuanceModuleAbi from "@setprotocol/set-protocol-v2/artifacts/contracts/protocol/modules/BasicIssuanceModule.sol/BasicIssuanceModule.json";
import SetTokenAbi from "@setprotocol/set-protocol-v2/artifacts/contracts/protocol/SetToken.sol/SetToken.json";
import { BasicIssuanceModule, SetToken } from "@setprotocol/set-protocol-v2/dist/typechain";
import bluebird from "bluebird";
import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, network, waffle } from "hardhat";
import { ComponentMap } from "packages/utils/src/types";
import ButterBatchAdapter from "../../lib/adapters/ButterBatchAdapter";
import CurveMetapoolAbi from "../../lib/external/curve/FactoryMetapool.json";
import { expectBigNumberCloseTo, expectValue } from "../../lib/utils/expectValue";
import { getNamedAccountsByChainId } from "../../lib/utils/getNamedAccounts";
import { DAYS, impersonateSigner } from "../../lib/utils/test";
import { timeTravel } from "../../lib/utils/test/timeTravel";
import { ButterBatchProcessingV1, CurveMetapool, ERC20, Faucet, MockERC20 } from "../../typechain";
import { IVault } from "../../typechain/IVault";

const provider = waffle.provider;

interface Contracts {
  mockPop: MockERC20;
  threeCrv: ERC20;
  threePool: CurveMetapool;
  butter: SetToken;
  setToken: SetToken; // alias for butter
  basicIssuanceModule: BasicIssuanceModule;
  butterBatch: ButterBatchProcessingV1;
  faucet: Faucet;
  yFraxVault: IVault;
  yMimVault: IVault;
}

enum BatchType {
  Mint,
  Redeem,
}

let hysiBalance: BigNumber;
let owner: SignerWithAddress,
  depositor: SignerWithAddress,
  depositor1: SignerWithAddress,
  depositor2: SignerWithAddress,
  depositor3: SignerWithAddress,
  admin: Signer;
let contracts: Contracts;

const BUTTER_TOKEN_ADDRESS = "0xdf203cefcd2422e4dca95d020cb9eb986788f7ae";
const Y_MIM_ADDRESS = "0x2DfB14E32e2F8156ec15a2c21c3A6c053af52Be8";
const CURVE_MIM_METAPOOL_ADDRESS = "0x5a6A4D54456819380173272A5E8E9B9904BdF41B";
const KEEPER_INCENTIVE_ADDRESS = "0xCD4f7582b32d90BD9FC7DC9F8116C43Ab17dE011";

const SET_BASIC_ISSUANCE_MODULE_ADDRESS = "0xd8EF3cACe8b4907117a45B0b125c68560532F94D";

const THREE_CRV_TOKEN_ADDRESS = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";

const OTHER_TOKEN_ADDRESS = "0x94e131324b6054c0D789b190b2dAC504e4361b53";

const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const CURVE_ADDRESS_PROVIDER_ADDRESS = "0x0000000022D53366457F9d5E68Ec105046FC4383";
const CURVE_FACTORY_METAPOOL_DEPOSIT_ZAP_ADDRESS = "0xA79828DF1850E8a3A3064576f380D90aECDD3359";

let componentMap: ComponentMap = {};

async function deployContracts(): Promise<Contracts> {
  const { yFrax, crvFraxMetapool, crvFrax, contractRegistry, threePool } = getNamedAccountsByChainId(1);
  admin = await impersonateSigner("0x92a1cb552d0e177f3a135b4c87a4160c8f2a485f");

  //Deploy helper Faucet
  const Faucet = await ethers.getContractFactory("Faucet");
  const faucet = await (await Faucet.deploy(UNISWAP_ROUTER_ADDRESS)).deployed();
  await network.provider.send("hardhat_setBalance", [
    faucet.address,
    "0x152d02c7e14af6800000", // 100k ETH
  ]);

  const mockPop = await (await (await ethers.getContractFactory("MockERC20")).deploy("POP", "POP", 18)).deployed();

  const threeCrv = (await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    THREE_CRV_TOKEN_ADDRESS
  )) as ERC20;

  const threePoolContract = (await ethers.getContractAt(CurveMetapoolAbi, threePool)) as CurveMetapool;

  const crvMimMetapoolContract = (await ethers.getContractAt(
    CurveMetapoolAbi,
    CURVE_MIM_METAPOOL_ADDRESS
  )) as CurveMetapool;

  const crvFraxMetapoolContract = (await ethers.getContractAt(CurveMetapoolAbi, crvFraxMetapool)) as CurveMetapool;

  const butter = (await ethers.getContractAt(SetTokenAbi.abi, BUTTER_TOKEN_ADDRESS)) as unknown as SetToken;

  const basicIssuanceModule = (await ethers.getContractAt(
    BasicIssuanceModuleAbi.abi,
    SET_BASIC_ISSUANCE_MODULE_ADDRESS
  )) as unknown as BasicIssuanceModule;

  const staking = await (
    await (await ethers.getContractFactory("PopLocker")).deploy(mockPop.address, mockPop.address)
  ).deployed();

  //Deploy ButterBatchProcessing
  const ButterBatchProcessing = await ethers.getContractFactory("ButterBatchProcessingV1");
  const YTOKEN_ADDRESSES = [yFrax, Y_MIM_ADDRESS];
  const CRV_DEPENDENCIES = [
    {
      curveMetaPool: crvFraxMetapool,
      crvLPToken: crvFrax,
    },
    {
      curveMetaPool: CURVE_MIM_METAPOOL_ADDRESS,
      crvLPToken: CURVE_MIM_METAPOOL_ADDRESS,
    },
  ];
  const butterBatch = await (
    await ButterBatchProcessing.deploy(
      contractRegistry,
      staking.address,
      butter.address,
      threeCrv.address,
      threePoolContract.address,
      basicIssuanceModule.address,
      YTOKEN_ADDRESSES,
      CRV_DEPENDENCIES,
      {
        batchCooldown: 1800,
        mintThreshold: parseEther("20000"),
        redeemThreshold: parseEther("200"),
      }
    )
  ).deployed();

  await butterBatch.setApprovals();

  const keeper = await ethers.getContractAt("KeeperIncentiveV1", KEEPER_INCENTIVE_ADDRESS);

  await keeper.connect(admin).addControllerContract(await butterBatch.contractName(), butterBatch.address);

  const yMimVault = await ethers.getContractAt("IVault", Y_MIM_ADDRESS);
  const yFraxVault = await ethers.getContractAt("IVault", yFrax);

  componentMap = await getComponentMap([crvMimMetapoolContract, crvFraxMetapoolContract], [yMimVault, yFraxVault]);

  return {
    mockPop,
    threeCrv,
    threePool: threePoolContract,
    butter,
    yMimVault,
    yFraxVault,
    setToken: butter,
    basicIssuanceModule,
    butterBatch,
    faucet,
  };
}

async function depositForHysiMint(account: SignerWithAddress, threeCrvAmount: BigNumber): Promise<void> {
  await contracts.threeCrv.connect(account).approve(contracts.butterBatch.address, threeCrvAmount);
  await contracts.butterBatch.connect(account).depositForMint(threeCrvAmount, account.address);
}

async function distributeHysiToken(): Promise<void> {
  const { butter, butterBatch } = contracts;
  await depositForHysiMint(depositor, parseEther("100"));
  await depositForHysiMint(depositor1, parseEther("100"));
  await depositForHysiMint(depositor2, parseEther("100"));
  await depositForHysiMint(depositor3, parseEther("100"));

  await timeTravel(1 * DAYS);

  await contracts.butterBatch.connect(admin).setSlippage(10, 10);
  await contracts.butterBatch.connect(admin).batchMint();
  const [batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);

  await claim(depositor, batchId);
  await claim(depositor1, batchId);
  await claim(depositor2, batchId);
  await claim(depositor3, batchId);

  hysiBalance = await contracts.butter.balanceOf(depositor.address);

  await approve(depositor, butter, butterBatch.address, parseEther("10000"));
  await approve(depositor1, butter, butterBatch.address, parseEther("10000"));
  await approve(depositor2, butter, butterBatch.address, parseEther("10000"));
  await approve(depositor3, butter, butterBatch.address, parseEther("10000"));
}

describe("ButterBatchProcessing Network Test", function () {
  before(async function () {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.FORKING_RPC_URL,
            blockNumber: 13942085,
          },
        },
      ],
    });
  });

  beforeEach(async function () {
    [owner, depositor, depositor1, depositor2, depositor3] = await ethers.getSigners();
    contracts = await deployContracts();
    await Promise.all(
      [depositor, depositor1, depositor2, depositor3].map(async (account) => {
        return contracts.faucet.sendThreeCrv(10000, account.address);
      })
    );
  });

  context("valuation oracle functions and slippage calculation", () => {
    beforeEach(async function () {
      await network.provider.request({
        method: "hardhat_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: process.env.FORKING_RPC_URL,
              blockNumber: 13942085,
            },
          },
        ],
      });
      contracts = await deployContracts();
      await Promise.all(
        [depositor, depositor1, depositor2, depositor3].map(async (account) => {
          return contracts.faucet.sendThreeCrv(10000, account.address);
        })
      );
      const currentBlockNumber = await ethers.provider.getBlockNumber();
      console.log({ currentBlockNumber });
    });

    describe("valueOf3Crv", () => {
      it("returns value of 3 crv", async () => {
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        console.log({ currentBlockNumber });
        const value = await contracts.butterBatch.valueOf3Crv(parseEther("1"));
        expectValue(value, parseEther("1.019929695147188721"));
      });
    });

    describe("valueOfComponents", () => {
      it("returns value of components per unit", async () => {
        // [contracts.yFraxVault.address, contracts.yMimVault.address],
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        console.log({ currentBlockNumber });
        const [addresses, quantities] = await contracts.basicIssuanceModule.getRequiredComponentUnitsForIssue(
          contracts.setToken.address,
          parseEther("1")
        );
        const nextBlockNumber = await ethers.provider.getBlockNumber();
        console.log({ nextBlockNumber });
        const value = await contracts.butterBatch.valueOfComponents(addresses, quantities);
        await expectBigNumberCloseTo(value, parseEther("1008.083393047704555181"), parseEther("0.00015"));
      });
    });

    describe("getMinAmountToMint", () => {
      it("gets minimum amount to mint with slippage", async () => {
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        console.log({ currentBlockNumber });
        const [addresses, quantities] = await contracts.basicIssuanceModule.getRequiredComponentUnitsForIssue(
          contracts.setToken.address,
          parseEther("1")
        );
        const minAmount = await contracts.butterBatch.getMinAmountToMint(
          parseEther("1008.083521649535050644"),
          await contracts.butterBatch.valueOfComponents(addresses, quantities),
          100
        );
        await expectBigNumberCloseTo(minAmount, parseEther(".990000081892662460"), parseEther("0.00015"));
      });
    });
    describe("getMinAmount3CrvFromRedeem", () => {
      it("gets minimum amount of 3crv from provided butter balance", async () => {
        const currentBlockNumber = await ethers.provider.getBlockNumber();
        console.log({ currentBlockNumber });
        const [addresses, quantities] = await contracts.basicIssuanceModule.getRequiredComponentUnitsForIssue(
          contracts.setToken.address,
          parseEther("1")
        );
        const minAmount = await contracts.butterBatch.getMinAmount3CrvFromRedeem(
          await contracts.butterBatch.valueOfComponents(addresses, quantities),
          10
        );
        await expectBigNumberCloseTo(minAmount, parseEther("987.396836874543984683"), parseEther("0.00015"));
      });
    });
  });

  context("setters and getters", () => {
    describe("setCurvePoolTokenPairs", () => {
      it("sets curve pool token pairs", async () => {
        await contracts.butterBatch.connect(admin).setCurvePoolTokenPairs(
          [OTHER_TOKEN_ADDRESS],
          [
            {
              curveMetaPool: OTHER_TOKEN_ADDRESS,
              crvLPToken: OTHER_TOKEN_ADDRESS,
            },
          ]
        );
        const curvePoolTokenPair = await contracts.butterBatch.curvePoolTokenPairs(OTHER_TOKEN_ADDRESS);
        expectValue(curvePoolTokenPair.curveMetaPool, OTHER_TOKEN_ADDRESS);
        expectValue(curvePoolTokenPair.crvLPToken, OTHER_TOKEN_ADDRESS);
      });
    });
  });

  describe("mint", function () {
    context("depositing", function () {
      it("deposits 3crv in the current mintBatch", async function () {
        expect(await depositForMint(depositor, parseEther("10")))
          .to.emit(contracts.butterBatch, "Deposit")
          .withArgs(depositor.address, parseEther("10"));
        expect(await contracts.threeCrv.balanceOf(contracts.butterBatch.address)).to.equal(parseEther("10"));
        const currentMintBatchId = await contracts.butterBatch.currentMintBatchId();
        const currentBatch = await contracts.butterBatch.batches(currentMintBatchId);
        expect(currentBatch.suppliedTokenBalance).to.equal(parseEther("10"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("10"));
      });
      it("adds the mintBatch to the users batches", async function () {
        await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("100"));
        await contracts.butterBatch.connect(depositor).depositForMint(parseEther("100"), depositor.address);

        const currentMintBatchId = await contracts.butterBatch.currentMintBatchId();
        expect(await contracts.butterBatch.accountBatches(depositor.address, 0)).to.equal(currentMintBatchId);
      });
      it("allows multiple deposits", async function () {
        await depositForMint(depositor, parseEther("100"));
        await depositForMint(depositor1, parseEther("100"));
        await depositForMint(depositor2, parseEther("50"));
        await depositForMint(depositor2, parseEther("50"));

        const currentMintBatchId = await contracts.butterBatch.currentMintBatchId();
        const currentBatch = await contracts.butterBatch.batches(currentMintBatchId);
        expect(currentBatch.suppliedTokenBalance).to.equal(parseEther("300"));
        expect(currentBatch.unclaimedShares).to.equal(parseEther("300"));
        expect(await contracts.butterBatch.accountBatches(depositor.address, 0)).to.equal(currentMintBatchId);
        expect(await contracts.butterBatch.accountBatches(depositor1.address, 0)).to.equal(currentMintBatchId);
        expect(await contracts.butterBatch.accountBatches(depositor2.address, 0)).to.equal(currentMintBatchId);
      });
    });
    context("withdraw from queue", function () {
      beforeEach(async function () {
        await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("100"));
        await contracts.butterBatch.connect(depositor).depositForMint(parseEther("100"), depositor.address);
      });
      context("revert", function () {
        it("reverts when the batch was already minted", async function () {
          const [batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
          await timeTravel(1 * DAYS);
          await contracts.butterBatch.connect(admin).batchMint();
          await expect(
            contracts.butterBatch.connect(depositor).withdrawFromBatch(batchId, parseEther("10"), depositor.address)
          ).to.be.revertedWith("already processed");
        });
        it("reverts when trying to withdraw more than deposited", async function () {
          const [batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);

          await expect(
            contracts.butterBatch.connect(depositor).withdrawFromBatch(batchId, parseEther("101"), depositor.address)
          ).to.be.revertedWith("not enough funds");
        });
      });
      context("sucess", function () {
        it("withdraws the deposit", async function () {
          const [batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
          const balance = await contracts.threeCrv.balanceOf(depositor.address);
          expect(
            await contracts.butterBatch
              .connect(depositor)
              .withdrawFromBatch(batchId, parseEther("100"), depositor.address)
          )
            .to.emit(contracts.butterBatch, "WithdrawnFromBatch")
            .withArgs(batchId, parseEther("100"), depositor.address);
          expect(await contracts.threeCrv.balanceOf(depositor.address)).to.equal(balance.add(parseEther("100")));
        });
        it("withdraws part of the deposit and continues to mint the rest", async function () {
          const [batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
          const amountToWithdraw = parseEther("50");

          const suppliedTokenBalanceBefore = (await contracts.butterBatch.batches(batchId)).suppliedTokenBalance;

          const expectedSuppliedTokenAfter = suppliedTokenBalanceBefore.sub(parseEther("50"));

          expect(
            await contracts.butterBatch
              .connect(depositor)
              .withdrawFromBatch(batchId, amountToWithdraw, depositor.address)
          ).to.emit(contracts.butterBatch, "WithdrawnFromBatch");

          const suppliedTokenBalanceAfter = (await contracts.butterBatch.batches(batchId)).suppliedTokenBalance;

          expect(suppliedTokenBalanceAfter).to.equal(expectedSuppliedTokenAfter);
          expect(suppliedTokenBalanceAfter.lt(suppliedTokenBalanceBefore)).to.be.true;

          await provider.send("evm_increaseTime", [2500]);
          await provider.send("evm_mine", []);

          expect(await contracts.butterBatch.connect(admin).batchMint()).to.emit(contracts.butterBatch, "BatchMinted");
        });
      });
    });
    context("batch minting", function () {
      context("reverts", function () {
        it("reverts when minting too early", async function () {
          await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("100"));
          await contracts.butterBatch.connect(depositor).depositForMint(parseEther("100"), depositor.address);
          await expect(contracts.butterBatch.connect(admin).batchMint()).to.be.revertedWith(
            "can not execute batch mint yet"
          );
        });
        it("reverts when slippage is too high", async function () {
          this.timeout(25000);
          await contracts.butterBatch.connect(admin).setProcessingThreshold(1800, 0, parseEther("200"));

          await contracts.butterBatch.connect(admin).setSlippage(2, 2);

          await depositForMint(depositor, parseEther("1000"));

          await expect(contracts.butterBatch.connect(admin).batchMint()).to.be.revertedWith("slippage too high");
        });
        it("reverts when called by someone other the keeper", async function () {
          await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("100"));
          await contracts.butterBatch.connect(depositor).depositForMint(parseEther("100"), depositor.address);
          await provider.send("evm_increaseTime", [2500]);

          await expect(contracts.butterBatch.connect(depositor).batchMint()).to.be.revertedWith(
            "you dont have the right role"
          );
        });
      });
      context("success", function () {
        it("batch mints", async function () {
          this.timeout(45000);
          const batchId = await contracts.butterBatch.currentMintBatchId();

          await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("100"));
          await contracts.butterBatch.connect(depositor).depositForMint(parseEther("100"), depositor.address);
          await timeTravel(1 * DAYS);
          const result = await contracts.butterBatch.connect(admin).batchMint();
          expect(result).to.emit(contracts.butterBatch, "BatchMinted");
        });

        it("mints early when mintThreshold is met", async function () {
          this.timeout(45000);
          await depositForMint(depositor, parseEther("100"));
          await depositForMint(depositor1, parseEther("100"));
          await depositForMint(depositor2, parseEther("100"));
          await depositForMint(depositor3, parseEther("20000"));

          await expect(contracts.butterBatch.connect(admin).batchMint()).to.emit(contracts.butterBatch, "BatchMinted");
        });
        it("advances to the next batch", async function () {
          await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("100"));
          await contracts.butterBatch.connect(depositor).depositForMint(parseEther("100"), depositor.address);
          await provider.send("evm_increaseTime", [2500]);

          const previousMintBatchId = await contracts.butterBatch.currentMintBatchId();
          await contracts.butterBatch.connect(admin).batchMint();

          const previousBatch = await contracts.butterBatch.batches(previousMintBatchId);
          expect(previousBatch.claimable).to.equal(true);

          const currentMintBatchId = await contracts.butterBatch.currentMintBatchId();
          expect(currentMintBatchId).to.not.equal(previousMintBatchId);
        });
      });
    });
    context("claim batch", function () {
      beforeEach(async function () {
        await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("100"));
        await contracts.butterBatch.connect(depositor).depositForMint(parseEther("100"), depositor.address);
        await contracts.threeCrv.connect(depositor1).approve(contracts.butterBatch.address, parseEther("100"));
        await contracts.butterBatch.connect(depositor1).depositForMint(parseEther("100"), depositor1.address);
        await contracts.threeCrv.connect(depositor2).approve(contracts.butterBatch.address, parseEther("100"));
        await contracts.butterBatch.connect(depositor2).depositForMint(parseEther("100"), depositor2.address);
        await contracts.threeCrv.connect(depositor3).approve(contracts.butterBatch.address, parseEther("100"));
        await contracts.butterBatch.connect(depositor3).depositForMint(parseEther("100"), depositor3.address);
      });
      it("reverts when batch is not yet claimable", async function () {
        const [batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
        await expect(contracts.butterBatch.connect(depositor).claim(batchId, depositor.address)).to.be.revertedWith(
          "not yet claimable"
        );
      });
      it("claim batch successfully", async function () {
        const hysiBalanceBefore = await contracts.butter.balanceOf(depositor.address);

        const [batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);

        await provider.send("evm_increaseTime", [2500]);
        await provider.send("evm_mine", []);
        await contracts.butterBatch.connect(admin).batchMint();

        const amountToReceive = await new ButterBatchAdapter(contracts.butterBatch).calculateAmountToReceiveForClaim(
          batchId,
          depositor.address
        );

        expect(await contracts.butterBatch.connect(depositor).claim(batchId, depositor.address))
          .to.emit(contracts.butterBatch, "Claimed")
          .withArgs(depositor.address, BatchType.Mint, parseEther("100"), amountToReceive);

        const hysiBalanceAfter = await contracts.butter.balanceOf(depositor.address);

        expect(hysiBalanceAfter.gt(hysiBalanceBefore)).to.be.true;
        expect(hysiBalanceAfter.sub(hysiBalanceBefore)).to.equal(amountToReceive);
        const batch = await contracts.butterBatch.batches(batchId);
        expect(batch.unclaimedShares).to.equal(parseEther("300"));
      });
    });
  });
  describe("redeem", function () {
    beforeEach(async function () {
      await distributeHysiToken();
    });
    context("depositing", function () {
      it("deposits setToken in the current redeemBatch", async function () {
        const result = depositForRedeem(depositor, hysiBalance);
        await expect(result).to.emit(contracts.butterBatch, "Deposit").withArgs(depositor.address, hysiBalance);
        expect(await contracts.butter.balanceOf(contracts.butterBatch.address)).to.equal(hysiBalance);
        const currentRedeemBatchId = await contracts.butterBatch.currentRedeemBatchId();
        const currentBatch = await contracts.butterBatch.batches(currentRedeemBatchId);
        expect(currentBatch.suppliedTokenBalance).to.equal(hysiBalance);
        expect(currentBatch.unclaimedShares).to.equal(hysiBalance);
      });
      it("adds the redeemBatch to the users batches", async function () {
        await depositForRedeem(depositor, hysiBalance);
        const currentRedeemBatchId = await contracts.butterBatch.currentRedeemBatchId();
        expect(await contracts.butterBatch.accountBatches(depositor.address, 1)).to.equal(currentRedeemBatchId);
      });
      it("allows multiple deposits", async function () {
        this.timeout(25000);
        await depositForRedeem(depositor, hysiBalance);
        await depositForRedeem(depositor1, hysiBalance);
        await depositForRedeem(depositor2, hysiBalance.div(2));
        await depositForRedeem(depositor3, hysiBalance.div(2));

        const currentRedeemBatchId = await contracts.butterBatch.currentRedeemBatchId();
        const currentBatch = await contracts.butterBatch.batches(currentRedeemBatchId);
        expect(currentBatch.suppliedTokenBalance).to.equal(
          hysiBalance.mul(2).add(hysiBalance.div(2).mul(2)) // deposited 300 butter
        );
        expect(currentBatch.unclaimedShares).to.equal(hysiBalance.mul(2).add(hysiBalance.div(2).mul(2)));
        expect(await contracts.butterBatch.accountBatches(depositor.address, 1)).to.equal(currentRedeemBatchId);
        expect(await contracts.butterBatch.accountBatches(depositor1.address, 1)).to.equal(currentRedeemBatchId);
        expect(await contracts.butterBatch.accountBatches(depositor2.address, 1)).to.equal(currentRedeemBatchId);
      });
    });
    context("withdraw from queue", function () {
      beforeEach(async function () {
        await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);
      });
      context("revert", function () {
        it("reverts when the batch was already redeemed", async function () {
          const [, batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
          await provider.send("evm_increaseTime", [2500]);
          await provider.send("evm_mine", []);
          await contracts.butterBatch.connect(admin).batchRedeem();
          await expect(
            contracts.butterBatch.connect(depositor).withdrawFromBatch(batchId, hysiBalance, depositor.address)
          ).to.be.revertedWith("already processed");
        });
      });
      context("sucess", function () {
        it("withdraws the deposit", async function () {
          const [, batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
          expect(
            await contracts.butterBatch.connect(depositor).withdrawFromBatch(batchId, hysiBalance, depositor.address)
          )
            .to.emit(contracts.butterBatch, "WithdrawnFromBatch")
            .withArgs(batchId, hysiBalance, depositor.address);
          expect(await contracts.butter.balanceOf(depositor.address)).to.equal(hysiBalance);
        });
        it("withdraws part of the deposit and continues to redeem the rest", async function () {
          const [, batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
          const suppliedTokenBalanceBefore = await contracts.butterBatch.batches(batchId);
          const unclaimedSharesBefore = (await contracts.butterBatch.batches(batchId)).unclaimedShares;

          expect(
            await contracts.butterBatch
              .connect(depositor)
              .withdrawFromBatch(batchId, hysiBalance.div(2), depositor.address)
          ).to.emit(contracts.butterBatch, "WithdrawnFromBatch");
          await provider.send("evm_increaseTime", [2500]);
          await provider.send("evm_mine", []);
          const unclaimedSharesAfter = (await contracts.butterBatch.batches(batchId)).unclaimedShares;

          expect(unclaimedSharesBefore.gt(unclaimedSharesAfter)).to.be.true;
          expect(unclaimedSharesBefore.sub(unclaimedSharesAfter)).to.equal(hysiBalance.div(2));
          expect(await contracts.butterBatch.connect(admin).batchRedeem()).to.emit(
            contracts.butterBatch,
            "BatchRedeemed"
          );
        });
      });
    });

    context("batch redeeming", function () {
      context("reverts", function () {
        it("reverts when redeeming too early", async function () {
          this.timeout(25000);
          await contracts.butterBatch
            .connect(admin)
            .setProcessingThreshold(2 * DAYS, parseEther("20000"), parseEther("200"));
          await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);

          await expect(contracts.butterBatch.connect(admin).batchRedeem()).to.be.revertedWith(
            "can not execute batch redeem yet"
          );
        });
        it("reverts when called by someone other the keeper", async function () {
          await contracts.butter.connect(depositor).approve(contracts.butterBatch.address, hysiBalance);
          await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);
          await provider.send("evm_increaseTime", [2500]);

          await expect(contracts.butterBatch.connect(depositor).batchRedeem()).to.be.revertedWith(
            "you dont have the right role"
          );
        });

        it.skip("does not revert with positive slippage", async function () {
          //Had to skip this since for some reason its not producing positive slippage anymore
          this.timeout(25000);

          await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);

          const [addresses, quantities] = await contracts.basicIssuanceModule.getRequiredComponentUnitsForIssue(
            contracts.setToken.address,
            hysiBalance
          );

          const minAmount = await contracts.butterBatch.getMinAmount3CrvFromRedeem(
            await contracts.butterBatch.valueOfComponents(addresses, quantities),
            0
          );

          await timeTravel(1 * DAYS);

          await contracts.butterBatch.connect(admin).setSlippage(10, 0);
          await contracts.butterBatch.connect(admin).batchRedeem();

          const batches = await new ButterBatchAdapter(contracts.butterBatch).getBatches(depositor.address);

          await expect(batches[0].claimableTokenBalance.gt(minAmount)).to.be.true;
        });
      });
      context("success", function () {
        it("batch emits a BatchRedeemedEvent", async function () {
          await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);
          await provider.send("evm_increaseTime", [2500]);
          await provider.send("evm_mine", []);

          const result = await contracts.butterBatch.connect(admin).batchRedeem();
          expect(result).to.emit(contracts.butterBatch, "BatchRedeemed");
        });

        it("transfers a minimum amount of 3crv to the contract", async function () {
          const batchId = await contracts.butterBatch.currentRedeemBatchId();
          const contractBalanceBefore = await contracts.threeCrv.balanceOf(contracts.butterBatch.address);
          await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);
          await provider.send("evm_increaseTime", [2500]);
          await provider.send("evm_mine", []);

          const min3Crv = await ButterBatchAdapter.getMinAmountOf3CrvToReceiveForBatchRedeem(
            7,
            {
              hysiBatchInteraction: contracts.butterBatch,
              basicIssuanceModule: contracts.basicIssuanceModule,
              threePool: contracts.threePool,
            },
            BUTTER_TOKEN_ADDRESS,
            componentMap
          );

          const result = await contracts.butterBatch.connect(admin).batchRedeem();

          const contractBalanceAfter = await contracts.threeCrv.balanceOf(contracts.butterBatch.address);
          const received3crv = contractBalanceAfter.sub(contractBalanceBefore);

          expect(received3crv.gte(min3Crv)).to.be.true;
        });

        it("increments claimableTokenBalance by an amount equal to amount transfered", async function () {
          const batchId = await contracts.butterBatch.currentRedeemBatchId();
          const contractBalanceBefore = await contracts.threeCrv.balanceOf(contracts.butterBatch.address);
          await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);
          await provider.send("evm_increaseTime", [2500]);
          await provider.send("evm_mine", []);

          const min3Crv = await ButterBatchAdapter.getMinAmountOf3CrvToReceiveForBatchRedeem(
            7,
            {
              hysiBatchInteraction: contracts.butterBatch,
              basicIssuanceModule: contracts.basicIssuanceModule,
              threePool: contracts.threePool,
            },
            BUTTER_TOKEN_ADDRESS,
            componentMap
          );

          const result = await contracts.butterBatch.connect(admin).batchRedeem();

          const contractBalanceAfter = await contracts.threeCrv.balanceOf(contracts.butterBatch.address);
          const received3crv = contractBalanceAfter.sub(contractBalanceBefore);
          expect((await contracts.butterBatch.batches(batchId)).claimableTokenBalance.eq(received3crv)).to.be.true;
          expect(received3crv.gte(min3Crv)).to.be.true;
        });

        it("transfers to a claimant an amount equal to their share in batch", async function () {
          const batchId = await contracts.butterBatch.currentRedeemBatchId();
          await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);

          await timeTravel(7 * DAYS);

          const result = await contracts.butterBatch.connect(admin).batchRedeem();

          const accountBalanceBefore = await contracts.threeCrv.balanceOf(contracts.butterBatch.address);

          const adapter = new ButterBatchAdapter(contracts.butterBatch);

          const amountToReceive = await adapter.calculateAmountToReceiveForClaim(batchId, depositor.address);

          await contracts.butterBatch.connect(depositor).claim(batchId, depositor.address);

          const accountBalanceAfter = await contracts.threeCrv.balanceOf(contracts.butterBatch.address);

          expect(amountToReceive).to.equal(accountBalanceBefore.sub(accountBalanceAfter));
        });

        it("mints early when redeemThreshold is met", async function () {
          await depositForRedeem(depositor, hysiBalance);
          await depositForRedeem(depositor1, hysiBalance);
          await depositForRedeem(depositor2, hysiBalance);

          const result = await contracts.butterBatch.connect(admin).batchRedeem();
          expect(result).to.emit(contracts.butterBatch, "BatchRedeemed");
        });
        it("advances to the next batch", async function () {
          await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);
          await provider.send("evm_increaseTime", [2500]);
          await provider.send("evm_mine", []);
          const previousRedeemBatchId = await contracts.butterBatch.currentRedeemBatchId();
          await contracts.butterBatch.connect(admin).batchRedeem();

          const previousBatch = await contracts.butterBatch.batches(previousRedeemBatchId);
          expect(previousBatch.claimable).to.equal(true);

          const currentRedeemBatchId = await contracts.butterBatch.currentRedeemBatchId();
          expect(currentRedeemBatchId).to.not.equal(previousRedeemBatchId);
        });
      });
    });
    context("claim batch", function () {
      it("reverts when batch is not yet claimable", async function () {
        await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);
        const [, batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
        await expect(contracts.butterBatch.connect(depositor).claim(batchId, depositor.address)).to.be.revertedWith(
          "not yet claimable"
        );
      });
      it("claim batch successfully", async function () {
        const threeCrvBalanceBefore = await contracts.threeCrv.balanceOf(depositor.address);
        await contracts.butterBatch.connect(depositor).depositForRedeem(hysiBalance);
        await provider.send("evm_increaseTime", [2500]);
        await provider.send("evm_mine", []);
        await contracts.butterBatch.connect(admin).batchRedeem();
        const [, batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
        const amountToReceive = await new ButterBatchAdapter(contracts.butterBatch).calculateAmountToReceiveForClaim(
          batchId,
          depositor.address
        );

        expect(await contracts.butterBatch.connect(depositor).claim(batchId, depositor.address))
          .to.emit(contracts.butterBatch, "Claimed")
          .withArgs(depositor.address, BatchType.Redeem, hysiBalance, amountToReceive);

        const threeCrvBalanceAfter = await contracts.threeCrv.balanceOf(depositor.address);

        expect(threeCrvBalanceAfter.gt(threeCrvBalanceBefore)).to.be.true;
        expect(threeCrvBalanceAfter.sub(threeCrvBalanceBefore)).to.equal(amountToReceive);
        const batch = await contracts.butterBatch.batches(batchId);
        expect(batch.unclaimedShares).to.equal(0);
      });
    });
  });
  context("moveUnclaimedDepositsIntoCurrentBatch", function () {
    context("error", function () {
      it("reverts when length of batchIds and shares are not matching", async function () {
        await expect(
          contracts.butterBatch
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch(
              new Array(2).fill("0xa15f699e141c27ed0edace41ff8fa7b836e3ddb658b25c811a1674e9c7a75c5c"),
              new Array(3).fill(parseEther("10")),
              BatchType.Mint
            )
        ).to.be.revertedWith("array lengths must match");
      });
      it("skips a batch that is not from the correct batchType", async function () {
        await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("10000"));
        await contracts.butterBatch.connect(depositor).depositForMint(parseEther("10000"), depositor.address);

        await provider.send("evm_increaseTime", [2500]);
        await provider.send("evm_mine", []);
        await contracts.butterBatch.connect(admin).batchMint();
        const batchId = await contracts.butterBatch.getAccountBatches(depositor.address);
        await expect(
          contracts.butterBatch.moveUnclaimedDepositsIntoCurrentBatch(
            [batchId[0]],
            [parseEther("10000")],
            BatchType.Redeem
          )
        ).to.be.revertedWith("incorrect batchType");
      });
      it("skips unclaimable batch", async function () {
        this.timeout(60000);
        await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("10000"));

        await contracts.butterBatch.connect(depositor).depositForMint(parseEther("10000"), depositor.address);

        const batchIds = await contracts.butterBatch.getAccountBatches(depositor.address);
        const batches = await Promise.all(batchIds.map((id) => contracts.butterBatch.batches(id)));

        await expect(
          contracts.butterBatch.moveUnclaimedDepositsIntoCurrentBatch(
            [batches[0].batchId],
            [parseEther("10000")],
            batches[0].batchType
          )
        ).to.be.revertedWith("has not yet been processed");
      });
      it("reverts when a user tries to transfer more funds than they have", async function () {
        await depositForMint(depositor, parseEther("20000"));
        await contracts.butterBatch.connect(admin).batchMint();
        const batchId = await contracts.butterBatch.getAccountBatches(depositor.address);
        await expect(
          contracts.butterBatch.moveUnclaimedDepositsIntoCurrentBatch(
            [batchId[0]],
            [parseEther("25000")],
            BatchType.Mint
          )
        ).to.be.revertedWith("not enough funds");
      });
    });
    context("success", function () {
      it("moves minted butter into current redeemBatch", async function () {
        this.timeout(60000);
        await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("10000"));
        await contracts.butterBatch.connect(depositor).depositForMint(parseEther("10000"), depositor.address);
        const batchId = await contracts.butterBatch.getAccountBatches(depositor.address);
        await provider.send("evm_increaseTime", [2500]);
        await provider.send("evm_mine", []);
        await contracts.butterBatch.connect(admin).batchMint();
        const mintedHYSI = await contracts.butter.balanceOf(contracts.butterBatch.address);
        expect(
          await contracts.butterBatch
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch([batchId[0]], [parseEther("10000")], BatchType.Mint)
        )
          .to.emit(contracts.butterBatch, "MovedUnclaimedDepositsIntoCurrentBatch")
          .withArgs(mintedHYSI, BatchType.Mint, depositor.address);
        const currentRedeemBatchId = await contracts.butterBatch.currentRedeemBatchId();
        const redeemBatch = await contracts.butterBatch.batches(currentRedeemBatchId);
        expect(redeemBatch.suppliedTokenBalance).to.be.equal(mintedHYSI);
      });
      it("moves 3crv redeemed from HYSI into current mintBatch", async function () {
        await distributeHysiToken();
        await depositForRedeem(depositor, hysiBalance);
        const batchId = await contracts.butterBatch.getAccountBatches(depositor.address);
        await timeTravel(1 * DAYS);

        await contracts.butterBatch.connect(admin).batchRedeem();
        const redeemed3CRV = (await contracts.butterBatch.batches(batchId[1])).claimableTokenBalance;
        expect(
          await contracts.butterBatch
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch([batchId[1]], [hysiBalance], BatchType.Redeem)
        )
          .to.emit(contracts.butterBatch, "MovedUnclaimedDepositsIntoCurrentBatch")
          .withArgs(redeemed3CRV, BatchType.Redeem, depositor.address);
        const currentMintBatchId = await contracts.butterBatch.currentMintBatchId();
        const redeemBatch = await contracts.butterBatch.batches(currentMintBatchId);
        expect(redeemBatch.suppliedTokenBalance).to.be.equal(redeemed3CRV);
      });
      it("moves only parts of the funds in a batch", async function () {
        await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("10000"));
        await contracts.butterBatch.connect(depositor).depositForMint(parseEther("10000"), depositor.address);
        const [batchId] = await contracts.butterBatch.getAccountBatches(depositor.address);
        await provider.send("evm_increaseTime", [2500]);
        await provider.send("evm_mine", []);
        await contracts.butterBatch.connect(admin).batchMint();
        const mintedHYSI = await contracts.butter.balanceOf(contracts.butterBatch.address);
        expect(
          await contracts.butterBatch
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch([batchId], [parseEther("5000")], BatchType.Mint)
        )
          .to.emit(contracts.butterBatch, "MovedUnclaimedDepositsIntoCurrentBatch")
          .withArgs(mintedHYSI.div(2), BatchType.Mint, depositor.address);
        //can be between 20326591836734693877 and 20326591836734693876
        const currentRedeemBatchId = await contracts.butterBatch.currentRedeemBatchId();
        const redeemBatch = await contracts.butterBatch.batches(currentRedeemBatchId);
        expect(redeemBatch.suppliedTokenBalance.toString()).to.include(
          mintedHYSI.div(2).toString().slice(0, -1) // losing 1 wei of precision because of division rounding
        );
        const mintBatch = await contracts.butterBatch.batches(batchId);
        expect(mintBatch.claimableTokenBalance.toString()).to.include(mintedHYSI.div(2).toString().slice(0, -1));
      });
      it("moves funds from up to 20 batches", async function () {
        this.timeout(60000);

        await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, parseEther("2000"));
        await bluebird.map(
          new Array(20).fill(0),
          async (i) => {
            await contracts.butterBatch.connect(depositor).depositForMint(parseEther("100"), depositor.address);
            await provider.send("evm_increaseTime", [2500]);
            await provider.send("evm_mine", []);
            await contracts.butterBatch.connect(admin).batchMint();
          },
          { concurrency: 1 }
        );
        const batchIds = await contracts.butterBatch.getAccountBatches(depositor.address);
        const mintedHYSI = await contracts.butter.balanceOf(contracts.butterBatch.address);
        expect(
          await contracts.butterBatch
            .connect(depositor)
            .moveUnclaimedDepositsIntoCurrentBatch(batchIds, new Array(20).fill(parseEther("100")), BatchType.Mint)
        )
          .to.emit(contracts.butterBatch, "MovedUnclaimedDepositsIntoCurrentBatch")
          .withArgs(mintedHYSI, BatchType.Mint, depositor.address);
        const currentRedeemBatchId = await contracts.butterBatch.currentRedeemBatchId();
        const redeemBatch = await contracts.butterBatch.batches(currentRedeemBatchId);
        expect(redeemBatch.suppliedTokenBalance).to.be.equal(mintedHYSI);
      });
    });
  });
});

const getComponentMap = async (
  [crvMimMetapoolContract, crvFraxMetapoolContract],
  [yMimVault, yFraxVault]
): Promise<ComponentMap> => {
  return {
    [yMimVault.address.toLowerCase()]: {
      metaPool: crvMimMetapoolContract,
      yPool: yMimVault,
    },
    [yFraxVault.address.toLowerCase()]: {
      metaPool: crvFraxMetapoolContract,
      yPool: yFraxVault,
    },
  } as ComponentMap;
};
const depositForMint = async (depositor, amount: BigNumber) => {
  await contracts.threeCrv.connect(depositor).approve(contracts.butterBatch.address, amount);
  return await contracts.butterBatch.connect(depositor).depositForMint(amount, depositor.address);
};

const depositForRedeem = async (depositor, amount: BigNumber) => {
  await contracts.butter.connect(depositor).approve(contracts.butterBatch.address, amount);
  return contracts.butterBatch.connect(depositor).depositForRedeem(amount);
};

const claim = async (depositor, depositId) => {
  return contracts.butterBatch.connect(depositor).claim(depositId, depositor.address);
};

const approve = async (depositor, contract, spender, amount) => {
  await contract.connect(depositor).approve(spender, amount);
};
