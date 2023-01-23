import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { getNamedAccountsFromNetwork } from "../../utils/getNamedAccounts";

interface Args {
  slippage: string;
}

export default task("butter:set-mint-slippage", "process current batch for minting")
  .addOptionalParam("slippage", "slippage in bps")

  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const { butterBatchProcessing } = await getContractDependencies(hre);

    console.log("Submitting tx");
    const tx = await butterBatchProcessing.setSlippage(Number(args.slippage), Number(args.slippage));
    const receipt = await tx.wait(1);
    console.log("Transaction confirmed: ", receipt.transactionHash);
  });

const getContractDependencies = async (hre: HardhatRuntimeEnvironment) => {
  const { butterBatch, threePool, setBasicIssuanceModule, yMim, yFrax, crvMimMetapool, crvFraxMetapool } =
    getNamedAccountsFromNetwork(hre);

  const butterBatchProcessing = await hre.ethers.getContractAt("ButterBatchProcessing", butterBatch);
  const threePoolContract = await hre.ethers.getContractAt("MockCurveThreepool", threePool);
  const basicIssuanceModule = await hre.ethers.getContractAt("IBasicIssuanceModule", setBasicIssuanceModule);
  const crvMimMetapoolContract = await hre.ethers.getContractAt("CurveMetapool", crvMimMetapool);
  const crvFraxMetapoolContract = await hre.ethers.getContractAt("CurveMetapool", crvFraxMetapool);

  const yMimVault = await hre.ethers.getContractAt("YearnVault", yMim);
  const yFraxVault = await hre.ethers.getContractAt("YearnVault", yFrax);
  return {
    butterBatchProcessing,
    threePoolContract,
    basicIssuanceModule,
    crvMimMetapoolContract,
    crvFraxMetapoolContract,
    yMimVault,
    yFraxVault,
  };
};
