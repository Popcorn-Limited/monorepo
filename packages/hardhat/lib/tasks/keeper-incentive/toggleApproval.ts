import { utils } from "ethers";
import { task } from "hardhat/config";
import { getContractWithSigner } from "../../utils/getContractWithSigner";

interface Args {
  contract: string;
  index: string;
}

export default task("keeper-incentive:toggleApproval", "updates keeper incentive")
  .addParam("contract", "name of contract")
  .addParam("index", "index of incentive")
  .setAction(async (args: Args, hre) => {
    const keeperIncentive = await getContractWithSigner(hre, "keeperIncentive", "KeeperIncentiveV2");

    const initialIncentive = await keeperIncentive.incentives(
      utils.formatBytes32String(args.contract),
      parseInt(args.index)
    );

    const tx = await keeperIncentive.toggleApproval(utils.formatBytes32String(args.contract), parseInt(args.index));
    const receipt = await tx.wait(1);

    const finalIncentive = await keeperIncentive.incentives(
      utils.formatBytes32String(args.contract),
      parseInt(args.index)
    );
    if (finalIncentive.openToEveryone === initialIncentive.openToEveryone) {
      console.error("Did not change incentive permissions");
    }

    console.log(receipt);
  });
