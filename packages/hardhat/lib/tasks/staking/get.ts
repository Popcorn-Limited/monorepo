import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface Args {
  address: string;
  method: string;
  args: string;
}

export default task(
  "staking:get",
  "call arbitrary methods from staking contract"
)
  .addParam("address", "address of contract")
  .addParam("method", "method to call")
  .addOptionalParam("args", "comma separated list of arguments for method")
  .setAction(async (arg: Args, hre: HardhatRuntimeEnvironment) => {
    const { method, args, address } = arg;
    const staking = await hre.ethers.getContractAt("Staking", address);
    const argmnts = args ? args.split(",") : undefined;
    if (argmnts) {
      console.log(await staking[method](...argmnts));
    } else {
      console.log(await staking[method]());
    }
  });
