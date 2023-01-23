import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { batchRedeem } from "../../utils/batchFunctions";
import { getContractWithSigner } from "../../utils/getContractWithSigner";

interface Args {
  dryRun: string;
}

export default task("butter:batch-redeem", "process current batch for redeeming")
  .addOptionalParam("dryRun", "will not submit transaction")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const butterBatchProcessing = await getContractWithSigner(hre, "butterBatch", "ButterBatchProcessing");
    await batchRedeem(butterBatchProcessing, args["dryRun"]);
  });
