import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getNamedAccountsByChainId } from "../../utils/getNamedAccounts";

interface Args {
  address: string;
  id: number;
}

export default task("aragon:getVesting", "gets spendable balance of address")
  .addParam("address", "address to check vesting balance of")
  .addParam("id", "vesting id")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const { tokenManager } = getNamedAccountsByChainId(1);
    const [signer] = await hre.ethers.getSigners();

    const tokens = new hre.ethers.Contract(tokenManager, require("../../external/aragon/TokenManager.json"), signer);

    console.log("getting vesting for " + args.address);
    const { amount, start, cliff, vesting, revokable } = await tokens.getVesting(args.address, args.id);
    console.log({
      amount: formatEther(amount),
      start: new Date(start.toNumber() * 1000).toISOString(),
      cliff: new Date(cliff.toNumber() * 1000).toISOString(),
      vesting: new Date(vesting.toNumber() * 1000).toISOString(),
      revokable: revokable,
    });
  });
