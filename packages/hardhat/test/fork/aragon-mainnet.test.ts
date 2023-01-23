import { parseEther } from "@ethersproject/units";
import { ethers, network } from "hardhat";
import { encodeCallScript } from "../../lib/utils/aragon/callscript";
import { expectValue } from "../../lib/utils/expectValue";
import { getNamedAccountsByChainId } from "../../lib/utils/getNamedAccounts";
import { DAYS, getErc20, impersonateSigner, sendEth, timeTravel } from "../../lib/utils/test";

const { pop, voting, daoAgent, tokenManager, rewardsDistribution } = getNamedAccountsByChainId(1);

describe.skip("aragon test", () => {
  context("create vote to transfer tokens from agent", () => {
    beforeEach(async () => {
      await network.provider.request({
        method: "hardhat_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: process.env.FORKING_RPC_URL,
              blockNumber: 14078388,
            },
          },
        ],
      });
    });

    it("will transfer funds to RewardsDistribution contract via vote", async () => {
      const popContract = await getErc20(pop);
      const POP_WHALE = "0x719a363735dfa5023033640197359665072b8c0e";

      console.log("sending eth to whale");
      await sendEth(POP_WHALE, "100");

      const signer = await impersonateSigner("0x719a363735dfa5023033640197359665072b8c0e");

      const votingContract = new ethers.Contract(voting, require("../../lib/external/aragon/Voting.json"), signer);

      const agent = new ethers.Contract(daoAgent, require("../../lib/external/aragon/Agent.json"));

      const tokens = new ethers.Contract(tokenManager, require("../../lib/external/aragon/TokenManager.json"), signer);

      const evmScript = encodeCallScript([
        {
          to: daoAgent,
          data: agent.interface.encodeFunctionData("execute(address,uint256,bytes)", [
            pop,
            0,
            popContract.interface.encodeFunctionData("transfer", [rewardsDistribution, parseEther("1224000")]),
          ]),
        },
      ]);

      const voteEvmScript = encodeCallScript([
        {
          to: voting,
          data: votingContract.interface.encodeFunctionData("newVote(bytes,string)", [evmScript, ""]),
        },
      ]);

      console.log("forwarding vote ...");
      await tokens.forward(voteEvmScript);

      console.log("voting ...");
      await votingContract.vote(9, true, true);
      await timeTravel(5 * DAYS);
      await votingContract.executeVote(9);

      expectValue(await popContract.balanceOf(rewardsDistribution), parseEther("1224000.999999999999999699"));
    });
  });
});
