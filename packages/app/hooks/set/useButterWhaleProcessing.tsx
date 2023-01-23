import { ButterWhaleProcessing, ButterWhaleProcessing__factory } from "@popcorn/hardhat/typechain";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { ChainId, isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { useMemo } from "react";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";

export default function useButterWhaleProcessing(address: string, chainId: ChainId): ButterWhaleProcessing {
  const { account } = useWeb3();
  const provider = useRpcProvider(chainId);

  return useMemo(() => {
    if (isButterSupportedOnCurrentNetwork(chainId) && !!address)
      return ButterWhaleProcessing__factory.connect(address, provider);
  }, [provider, address, account, chainId]);
}
