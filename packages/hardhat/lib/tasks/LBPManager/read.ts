import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
interface Args {
  to: string;
  amount: string;
}

async function main(args: Args, hre: HardhatRuntimeEnvironment) {
  const lbp = await hre.ethers.getContractAt(
    "LBPManager",
    (
      await hre.deployments.get("LBPManager")
    ).address
  );
  const tx = await lbp.poolConfig();
  console.log(tx);
}

export default task("LBPManager:read", "gets pool info").setAction(main);
