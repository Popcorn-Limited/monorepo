import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { batchMint } from "../../utils/batchFunctions";
import { getContractWithSigner } from "../../utils/getContractWithSigner";

interface Args {
  dryRun: string;
}

export default task("threeX:batch-mint", "process current 3X batch for minting")
  .addOptionalParam("dryRun", "will not submit transaction if set to 1")
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const threeXBatchProcessing = await getContractWithSigner(hre, "threeXBatch", "ThreeXBatchProcessing");
    await batchMint(threeXBatchProcessing, args["dryRun"]);
  });
