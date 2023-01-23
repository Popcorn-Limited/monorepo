import { PRC_PROVIDERS, supportedChainIds } from "@popcorn/utils/src/connectors";
import { useMemo } from "react";

export function useRpcProvider(chainId) {
  return useMemo(() => {
    if (supportedChainIds.includes(chainId)) return PRC_PROVIDERS[chainId];
  }, [chainId]);
}
