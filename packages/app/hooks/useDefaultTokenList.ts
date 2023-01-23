import { ChainId } from "@popcorn/utils";
import { useMemo } from "react";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";

export const useDefaultTokenList = (chainId: ChainId) => {
  const { dai, usdc, usdt, sUSD, eth } = useDeployment(chainId);
  return useMemo(() => [dai, usdc, usdt, sUSD, eth].filter((token) => !!token), [chainId]);
};
