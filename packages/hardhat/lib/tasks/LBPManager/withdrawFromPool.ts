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

  console.log("Withdrawing from Pool");

  const tx = await lbp.withdrawFromPool({ gasLimit: 2000000 });

  const receipt = await tx.wait(1);
  console.log(receipt);
  console.log("Withdrew from pool");
}

export default task("LBPManager:withdrawFromPool", "exits LBP").setAction(main);
