import { ButterBatchProcessing, ButterBatchProcessing__factory } from "@popcorn/hardhat/typechain";
import { ChainId, isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useMemo } from "react";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";

export default function useButterBatch(address: string, chainId: ChainId): ButterBatchProcessing | undefined {
  const { account } = useWeb3();

  const provider = useRpcProvider(chainId);

  const zapper = useMemo(
    () =>
      isButterSupportedOnCurrentNetwork(chainId) &&
      !!address &&
      ButterBatchProcessing__factory.connect(address, provider),
    [provider, address, account, chainId],
  );

  return zapper;
}
