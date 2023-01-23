import { Contract } from "packages/utils/node_modules/ethers/lib";
import { formatUnits } from "ethers/lib/utils";

export const batchMint = async (contract: Contract, dryRun: string): Promise<void> => {
  let shouldSubmitTx = false;

  await (async () => {
    try {
      const mintTx = await contract.estimateGas.batchMint();
      console.log({ mintTxGas: formatUnits(mintTx, "gwei") });
      shouldSubmitTx = true;
    } catch (e) {
      console.error("Could not estimate gas, cannot submit tx");
    }
  })();

  if (shouldSubmitTx && !Boolean(parseInt(dryRun))) {
    console.log("Submitting batch mint tx");
    const tx = await contract.batchMint();
    const receipt = await tx.wait(1);
    console.log("Transaction confirmed: ", receipt.transactionHash);
  }
};

export const batchRedeem = async (contract: Contract, dryRun: string): Promise<void> => {
  let shouldSubmitTx = false;

  await (async () => {
    try {
      const mintTx = await contract.estimateGas.batchRedeem();
      console.log({ mintTxGas: formatUnits(mintTx, "gwei") });
      shouldSubmitTx = true;
    } catch (e) {
      console.error("Could not estimate gas, cannot submit tx");
    }
  })();

  if (shouldSubmitTx && !Boolean(parseInt(dryRun))) {
    console.log("Submitting batch mint tx");
    const tx = await contract.batchRedeem();
    const receipt = await tx.wait(1);
    console.log("Transaction confirmed: ", receipt.transactionHash);
  }
};
