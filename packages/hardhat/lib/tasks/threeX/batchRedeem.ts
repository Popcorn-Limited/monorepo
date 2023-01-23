import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { batchRedeem } from "../../utils/batchFunctions";
import { getContractWithSigner } from "../../utils/getContractWithSigner";

interface Args {
  dryRun: string;
}

export default task("threeX:batch-redeem", "process current 3X batch for redeeming")
  .addOptionalParam("dryRun", "will not submit transaction")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const threeXBatchProcessing = await getContractWithSigner(hre, "threeXBatch", "ThreeXBatchProcessing");
    await batchRedeem(threeXBatchProcessing, args["dryRun"]);
  });
