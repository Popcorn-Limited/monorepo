import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
interface Args {
  to: string;
  amount: string;
}

async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  const signer = hre.askForSigner();

  const lbp = await hre.ethers.getContractAt(
    "LBPManager",
    (
      await hre.deployments.get("LBPManager")
    ).address,
    signer
  );
  const tx = await lbp.enableTrading({ gasLimit: 2000000 });

  const receipt = await tx.wait(1);
  console.log("LBP Trading is enabled");
  console.log(receipt);
}

export default task(
  "LBPManager:enableTrading",
  "deploys LBP with factory"
).setAction(main);
