import { ethers, network } from "hardhat";
import { encodeCallScript } from "../../lib/utils/aragon/callscript";
import { getNamedAccountsByChainId } from "../../lib/utils/getNamedAccounts";
import { IpfsClient } from "../../../utils/src/IpfsClient/IpfsClient";
import { DAYS, impersonateSigner, timeTravel } from "../../lib/utils/test";

const POP_WHALE = "0x719a363735dfa5023033640197359665072b8c0e";
const namedAccounts = getNamedAccountsByChainId(1);
const { popUsdcLp, daoAgent, daoAgentV2, butterv1 } = namedAccounts;

describe.skip("voting test", () => {
  context("aragon votes", () => {
    beforeEach(async () => {
      await network.provider.request({
        method: "hardhat_reset",
        params: [
          {
            forking: {
              jsonRpcUrl: process.env.RPC_URL,
              blockNumber: 15117858,
            },
          },
        ],
      });
    });
    it("will transfer funds back to DAO agent when pool is closed (via vote)", async () => {
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

      const prepareCall = (target, encodedFunctionData, ethValue = 0) => ({
        to: agent.address,
        data: agent.interface.encodeFunctionData("execute(address,uint256,bytes)", [
          target,
          ethValue,
          encodedFunctionData,
        ]),
      });

      const evmScript = encodeCallScript([
        prepareCall(
          popUsdcLp,
          await (
            await ethers.getContractAt("@openzeppelin/contracts/access/Ownable.sol:Ownable", popUsdcLp)
          ).interface.encodeFunctionData("transferOwnership", [daoAgentV2])
        ),
      ]);

      console.log({ evmScript });
      // @ts-ignore
      const ipfsHash = await IpfsClient.add({ text: "PIP-2" });
      console.log({ ipfsHash });

      const voteEvmScript = encodeCallScript([
        {
          to: namedAccounts.voting,
          data: voting.interface.encodeFunctionData("newVote(bytes,string)", [evmScript, `ipfs:${ipfsHash}`]),
        },
      ]);

      await tokens.connect(signer).forward(voteEvmScript);

      await voting.connect(signer).vote(10, true, true);

      await timeTravel(7 * DAYS);
      await voting.connect(signer).executeVote(10);
      console.log(
        "owner",
        await (await new ethers.Contract(popUsdcLp, ["function manager() view returns (address)"], signer)).manager()
      );
    });
  });
});
