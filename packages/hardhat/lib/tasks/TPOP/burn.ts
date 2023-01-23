import { formatEther, parseEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

interface Args {
  from: string;
  amount: string;
}
async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  if (hre.network.name !== "kovan") {
    throw new Error("This task only works for Kovan");
  }

  const signer = hre.askForSigner();
  const address = (await hre.deployments.get("TestPOP")).address;
  const burnAmount = parseEther(args.amount);

  const POP = await hre.ethers.getContractAt("MockERC20", address, signer);

  await (await POP.burn(args.from, burnAmount)).wait(1);

  console.log("Burned", formatEther(burnAmount), "TPOP");
}

export default task("TPOP:burn", "burns TPOP")
  .addParam("from", "address to burn from")
  .addParam("amount", "amount to burn")
  .setAction(main);
