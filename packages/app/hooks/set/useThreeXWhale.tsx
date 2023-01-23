import { ThreeXWhaleProcessing, ThreeXWhaleProcessing__factory } from "@popcorn/hardhat/typechain";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { ChainId, isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import { useMemo } from "react";

export default function useThreeXWhale(address: string, chainId: ChainId): ThreeXWhaleProcessing {
  const { account } = useWeb3();

  const provider = useRpcProvider(chainId);
  return useMemo(() => {
    if (isButterSupportedOnCurrentNetwork(chainId) && !!address)
      return ThreeXWhaleProcessing__factory.connect(address, provider);
  }, [provider, address, chainId, account]);
}
