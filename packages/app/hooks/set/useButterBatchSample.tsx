import { ButterBatchProcessing, ButterBatchProcessing__factory } from "@popcorn/hardhat/typechain";
import { isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { useMemo } from "react";

export default function useButterBatchSample(contractAddresses, chainId, rpcProvider?): ButterBatchProcessing {
  return useMemo(() => {
    if (contractAddresses?.butterBatch && isButterSupportedOnCurrentNetwork(chainId))
      return ButterBatchProcessing__factory.connect(contractAddresses.butterBatch, rpcProvider);
  }, [contractAddresses.butterBatch]);
}
