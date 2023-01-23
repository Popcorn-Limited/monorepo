import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { encodeCallScript } from "../../lib/utils/aragon/callscript";
import { expectRevert } from "../../lib/utils/expectValue";
import { getNamedAccountsByChainId } from "../../lib/utils/getNamedAccounts";
import {
  DAYS,
  getErc20,
  impersonateSigner,
  sendEth,
  setTimestamp,
  timeTravel,
  transferErc20,
} from "../../lib/utils/test";

const LBP_MANAGER = "0xe7F0E61a07D540F6Ab3C3e81D87c6ed0F2C0244d";
const USDC_WHALE = "0x6BE8ef6207b4114A52ae5011FE8846dA2Af8F281";
const POP_WHALE = "0xF023E5eF2Eb3b8747cBaD5B3847813b66E9BFdD7";
const POP_GUPPY = "0x084e8A8cF1C38dEF1D6dB8542a73aa0d54284F8D";
const namedAccounts = getNamedAccountsByChainId(1);
const START_TIME = 1638172800;

const prepareLbpManager = async () => {
  await network.provider.request({
    method: "hardhat_reset",
    params: [
      {
        forking: {
          jsonRpcUrl: process.env.FORKING_RPC_URL,
          blockNumber: 13677417,
        },
      },
    ],
  });
  await transferErc20(namedAccounts.usdc, USDC_WHALE, LBP_MANAGER, "562500");

  await transferErc20(namedAccounts.pop, POP_WHALE, LBP_MANAGER, "1875000");
};

const deployPoolByVote = async (): Promise<string> => {
  /**
   * Voting for proposal to deployLBP
   */
  const voting = new ethers.Contract(
    namedAccounts.voting,
    require("../../lib/external/aragon/Voting.json"),
    await impersonateSigner(POP_WHALE)
  );
  await voting.vote(5, true, true);

  const lbp = await ethers.getContractAt("LBPManager", LBP_MANAGER);

  return lbp.lbp();
};

const deployPoolByVoteWithoutMajority = async (): Promise<string> => {
  /**
   * Voting for proposal to deployLBP
   */

  const voting = new ethers.Contract(
    namedAccounts.voting,
    require("../../lib/external/aragon/Voting.json"),
    await impersonateSigner(POP_GUPPY)
  );

  await voting.vote(5, true, true);

  const lbp = await ethers.getContractAt("LBPManager", LBP_MANAGER);

  return lbp.lbp();
};

const getPoolTokenBalances = async (address) => {
  const usdc = await getErc20(namedAccounts.usdc);
  const pop = await getErc20(namedAccounts.pop);
  return [await usdc.balanceOf(address), await pop.balanceOf(address)];
};

describe.skip("LBP test", () => {
  context("LBPManager has funds on mainnet", () => {
    beforeEach(async () => {
      await prepareLbpManager();
    });
    it("has correct configuration for LBP", async () => {
      const lbpManager = await ethers.getContractAt("LBPManager", LBP_MANAGER);
      const config = await lbpManager.poolConfig();
      const dao = await lbpManager.dao();
      expect(config.deployed).to.be.false;
      expect(config.startTime).to.equal(START_TIME);
      expect(config.swapEnabledOnStart).to.equal(false);
      expect(config.durationInSeconds).to.equal(2.5 * DAYS);
      expect(dao.treasury).to.equal("0x0Ec6290aBb4714ba5f1371647894Ce53c6dD673a");
      expect(dao.agent).to.equal("0x0Ec6290aBb4714ba5f1371647894Ce53c6dD673a");
    });

    it("deploys LBP from aragon dao agent address when impersonating dao agent", async () => {
      /**
       * deploy LBP from aragon dao agent
       */
      await sendEth(namedAccounts.daoAgent, "1");

      const lbpManager = await ethers.getContractAt(
        "LBPManager",
        LBP_MANAGER,
        await impersonateSigner(namedAccounts.daoAgent)
      );
      const tx = await lbpManager.deployLBP();
      const lbp = await lbpManager.lbp();

      const config = await lbpManager.poolConfig();
      expect(config.deployed).to.be.true;
      expect(lbp).to.equal("0x604A625B1db031e8CdE1D49d30d425E0b6cf734f");
    });

    it("deploys LBP from aragon dao agent address when voting", async () => {
      const lbpManager = await ethers.getContractAt("LBPManager", LBP_MANAGER);

      const poolAddress = await deployPoolByVote();
      await ethers.getContractAt("ILBP", poolAddress);

      const config = await lbpManager.poolConfig();

      expect(config.deployed).to.be.true;
      expect(poolAddress).to.equal("0x604A625B1db031e8CdE1D49d30d425E0b6cf734f");
    });

    it("will allow anyone to enable trading on the 29th", async () => {
      const poolAddress = await deployPoolByVote();
      const [anyone] = await ethers.getSigners();
      const lbpManager = await ethers.getContractAt("LBPManager", LBP_MANAGER, anyone);

      await setTimestamp((await lbpManager.poolConfig()).startTime.toNumber());

      await lbpManager.enableTrading();

      const lbp = await ethers.getContractAt("ILBP", poolAddress);
      expect(await lbp.getSwapEnabled()).to.be.true;
    });

    it("will not allow trading to be enabled before the 29th", async () => {
      await deployPoolByVote();

      await setTimestamp(START_TIME - 15);

      const [anyone] = await ethers.getSigners();
      const lbpManager = await ethers.getContractAt("LBPManager", LBP_MANAGER, anyone);

      await expectRevert(lbpManager.enableTrading(), "Trading can not be enabled yet");
    });

    it("will transfer funds from LBP manager to Pool when LBP is deployed", async () => {
      const poolAddress = await deployPoolByVote();
      const [usdcBalancerAfter, popBalanceAfter] = await getPoolTokenBalances(LBP_MANAGER);
      const vault = await ethers.getContractAt("IVault", namedAccounts.balancerVault);

      const lbp = await ethers.getContractAt("ILBP", poolAddress);
      //@ts-expect-error
      const tokens = await vault.getPoolTokens(await lbp.getPoolId());

      expect(tokens[0].map((token) => token.toLowerCase())).to.eql([
        namedAccounts.usdc.toLowerCase(),
        namedAccounts.pop.toLowerCase(),
      ]);
      expect(tokens[1][0]).equal(parseUnits("562500", "6"));
      expect(tokens[1][1]).equal(parseEther("1875000"));
      expect(usdcBalancerAfter).to.equal(BigNumber.from("0"));
      expect(popBalanceAfter).to.equal(BigNumber.from("0"));
    });

    it("will transfer funds back to DAO agent when pool is closed (impersonation)", async () => {
      /**
       * send ETH to aragon dao agent address
       */
      await sendEth(namedAccounts.daoAgent, "1");

      await deployPoolByVote();
      await timeTravel(5 * DAYS);

      const lbpManager = await ethers.getContractAt(
        "LBPManager",
        LBP_MANAGER,
        await impersonateSigner(namedAccounts.daoAgent)
      );

      await lbpManager.enableTrading();

      const [usdcBalanceBefore, popBalanceBefore] = await getPoolTokenBalances(namedAccounts.daoTreasury);

      await lbpManager.withdrawFromPool();

      const [usdcBalanceAfter, popBalanceAfter] = await getPoolTokenBalances(namedAccounts.daoTreasury);

      expect(usdcBalanceAfter.gt(usdcBalanceBefore)).to.be.true;
      expect(popBalanceAfter.gt(popBalanceBefore)).to.be.true;
    });
    it("will transfer funds back to DAO agent when pool is closed (via vote)", async () => {
      const poolAddress = await deployPoolByVote();

      await timeTravel(5 * DAYS);
      const [anyone] = await ethers.getSigners();
      const lbpManager = await ethers.getContractAt("LBPManager", LBP_MANAGER, anyone);

      await lbpManager.enableTrading();

      const lbp = await ethers.getContractAt("ILBP", poolAddress);
      expect(await lbp.getSwapEnabled()).to.be.true;

      await timeTravel(5 * DAYS);

      const signer = await impersonateSigner(POP_WHALE);

      const voting = new ethers.Contract(
        namedAccounts.voting,
        require("../../lib/external/aragon/Voting.json"),
        signer
      );

      const agent = new ethers.Contract(namedAccounts.daoAgent, require("../../lib/external/aragon/Agent.json"));

      const tokens = new ethers.Contract(
        namedAccounts.tokenManager,
        require("../../lib/external/aragon/TokenManager.json"),
        signer
      );

      const evmScript = encodeCallScript([
        {
          to: namedAccounts.daoAgent,
          data: agent.interface.encodeFunctionData("execute(address,uint256,bytes)", [
            LBP_MANAGER,
            0,
            lbpManager.interface.encodeFunctionData("withdrawFromPool"), // withdrawFromPool()
          ]),
        },
      ]);

      const voteEvmScript = encodeCallScript([
        {
          to: namedAccounts.voting,
          data: voting.interface.encodeFunctionData("newVote(bytes,string)", [evmScript, ""]),
        },
      ]);

      await tokens.forward(voteEvmScript);

      const [usdcBalanceBefore, popBalanceBefore] = await getPoolTokenBalances(namedAccounts.daoTreasury);

      await voting.vote(6, true, true);

      const [usdcBalanceAfter, popBalanceAfter] = await getPoolTokenBalances(namedAccounts.daoTreasury);

      expect(usdcBalanceAfter.gt(usdcBalanceBefore)).to.be.true;
      expect(popBalanceAfter.gt(popBalanceBefore)).to.be.true;
    });
    it("executes vote if LBPManager has the requisite token amounts", async () => {
      await deployPoolByVoteWithoutMajority();

      await timeTravel(5 * DAYS);

      const signer = await ethers.getSigners();

      const voting = new ethers.Contract(
        namedAccounts.voting,
        require("../../lib/external/aragon/Voting.json"),
        signer[0]
      );

      await voting.executeVote(5);
      const lbp = await ethers.getContractAt("LBPManager", LBP_MANAGER);
      expect((await lbp.poolConfig()).deployed).to.equal(true);
    });
  });
  context("LBPManager does not have funds on mainnet", () => {
    beforeEach(async () => {
      await network.provider.request({
        method: "hardhat_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: process.env.FORKING_RPC_URL,
              blockNumber: 13677417,
            },
          },
        ],
      });
    });
    it("does not execute vote if LBPManager does not have requisite token amount", async () => {
      await deployPoolByVoteWithoutMajority();

      await timeTravel(5 * DAYS);

      const voting = new ethers.Contract(
        namedAccounts.voting,
        require("../../lib/external/aragon/Voting.json"),
        await impersonateSigner(POP_WHALE)
      );
      await expectRevert(voting.executeVote(5), "Manager does not have enough pool tokens");
    });
  });
});
