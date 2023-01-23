import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { IpfsClient } from "@popcorn/utils/src/IpfsClient/IpfsClient";
import { encodeCallScript } from "../../utils/aragon/callscript";
import { getNamedAccountsByChainId } from "../../utils/getNamedAccounts";

interface Args {}

export default task("aragon:create-vote", "creates an aragon vote").setAction(
  async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const DESCRIPTION = "PIP-2"; // set vote description

    const { voting, daoAgent, tokenManager, popUsdcLp, daoAgentV2 } = getNamedAccountsByChainId(1);
    const [signer] = await hre.ethers.getSigners();

    const votingContract = new hre.ethers.Contract(voting, require("../../external/aragon/Voting.json"), signer);

    const agent = new hre.ethers.Contract(daoAgent, require("../../external/aragon/Agent.json"));

    const tokens = new hre.ethers.Contract(tokenManager, require("../../external/aragon/TokenManager.json"), signer);

    const prepareCall = (target, encodedFunctionData, ethValue = 0) => ({
      to: agent.address,
      data: agent.interface.encodeFunctionData("execute(address,uint256,bytes)", [
        target,
        ethValue,
        encodedFunctionData,
      ]),
    });

    const ipfsHash = await IpfsClient.add({ text: DESCRIPTION });
    console.log({ ipfsHash });

    const evmScript = encodeCallScript([
      prepareCall(
        popUsdcLp,
        await (
          await hre.ethers.getContractAt("@openzeppelin/contracts/access/Ownable.sol:Ownable", popUsdcLp)
        ).interface.encodeFunctionData("transferOwnership", [daoAgentV2])
      ),
    ]);

    const voteEvmScript = encodeCallScript([
      {
        to: voting,
        data: votingContract.interface.encodeFunctionData("newVote(bytes,string)", [evmScript, `ipfs:${ipfsHash}`]),
      },
    ]);

    console.log("forwarding vote ...");
    const tx = await tokens.forward(voteEvmScript);
    const receipt = await tx.wait();
    console.log({ receipt });
  }
);
