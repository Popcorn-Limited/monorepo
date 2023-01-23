import { ISetToken, ISetToken__factory } from "@popcorn/hardhat/typechain";
import { ChainId, isButterSupportedOnCurrentNetwork } from "@popcorn/utils";
import { useMemo } from "react";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";

export default function useSetToken(tokenAddress: string, chainId: ChainId): ISetToken {
  const provider = useRpcProvider(chainId);

  return useMemo(() => {
    if (tokenAddress && isButterSupportedOnCurrentNetwork(chainId)) {
      return ISetToken__factory.connect(tokenAddress, provider);
    }
  }, [chainId, tokenAddress]);
}
