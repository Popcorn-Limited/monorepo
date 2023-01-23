import { ButterBatchProcessingZapper, ButterBatchProcessingZapper__factory } from "@popcorn/hardhat/typechain";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { ChainId, isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import { useMemo } from "react";

export default function useButterBatchZapper(
  address: string,
  chainId: ChainId,
): ButterBatchProcessingZapper | undefined {
  const { account } = useWeb3();

  const provider = useRpcProvider(chainId);

  return useMemo(() => {
    if (isButterSupportedOnCurrentNetwork(chainId) && !!address)
      return ButterBatchProcessingZapper__factory.connect(address, provider);
  }, [provider, address, account, chainId]);
}
