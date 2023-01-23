import { task } from "hardhat/config";
import { DefaultConfiguration } from "../../external/SetToken/3XConfiguration";
import SetTokenManager from "../../external/SetToken/SetTokenManager";

interface Args {
  debug: boolean; // 1 or 0
}

export default task("set-token:create", "creates set token")
  .addFlag("debug", "display debug information")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();

    console.log("set token configuration:", JSON.stringify(DefaultConfiguration, null, 2));

    const manager = new SetTokenManager({ ...DefaultConfiguration, manager: await signer.getAddress() }, hre, signer);

    const address = await manager.createSet({
      args: { debug: args.debug ? true : false },
    });
    return address;
  });
