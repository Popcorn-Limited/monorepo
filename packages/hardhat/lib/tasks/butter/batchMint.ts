import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { batchMint } from "../../utils/batchFunctions";
import { getContractWithSigner } from "../../utils/getContractWithSigner";
interface Args {
  dryRun: string;
}

export default task("butter:batch-mint", "process current batch for minting")
  .addOptionalParam("dryRun", "will not submit transaction if set to 1")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const butterBatchProcessing = await getContractWithSigner(hre, "butterBatch", "ButterBatchProcessing");
    await batchMint(butterBatchProcessing, args["dryRun"]);
  });
