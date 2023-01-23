import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getNamedAccountsByChainId } from "../../utils/getNamedAccounts";

interface Args {
  address: string;
}

export default task("aragon:spendableBalanceOf", "gets spendable balance of address")
  .addParam("address", "address to check balance of")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const { tokenManager } = getNamedAccountsByChainId(1);
    const [signer] = await hre.ethers.getSigners();

    const tokens = new hre.ethers.Contract(tokenManager, require("../../external/aragon/TokenManager.json"), signer);

    console.log("getting spendable balance of " + args.address);
    const bal = await tokens.spendableBalanceOf(args.address);
    console.log({ balance: formatEther(bal) });
  });
