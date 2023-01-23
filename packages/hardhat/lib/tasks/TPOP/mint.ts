import { formatEther, parseEther } from "ethers/lib/utils";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
interface Args {
  to: string;
  amount: string;
}

async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  if (hre.network.name !== "kovan") {
    throw new Error(
      `This task is only valid for Kovan. The selected network is: ${hre.network.name}`
    );
  }
  const signer = hre.askForSigner();
  const address = (await hre.deployments.get("TestPOP")).address;
  const mintAmount = parseEther(args.amount);

  const POP = await hre.ethers.getContractAt("MockERC20", address, signer);
  await (await POP.mint(args.to, mintAmount)).wait(1);
  console.log("Minted", formatEther(mintAmount), "TPOP");
}

export default task("TPOP:mint", "mints TPOP")
  .addParam("to", "address to transfer to")
  .addParam("amount", "amount to mint")
  .setAction(main);
