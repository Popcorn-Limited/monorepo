import { SetToken__factory } from "@setprotocol/set-protocol-v2/dist/typechain";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface Args {
  token: string;
  manager: string;
}

export default task("set-token:set-manager", "assigns new manager to set token")
  .addOptionalParam("token", "set token address")
  .addOptionalParam("manager", "set token manager")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const [signer] = await hre.ethers.getSigners();

    const setToken = new SetToken__factory.connect(args.token, signer);
    const tx = await setToken.setManager(args.manager);
    const receipt = await tx.wait(1);
    console.log(receipt);
  });
