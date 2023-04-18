import { ChainId } from "@popcorn/utils";
import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { useMemo } from "react";

export const useDefaultTokenList = (chainId: ChainId) => {
  const [dai, usdc, usdt] = useNamedAccounts(String(chainId) as any, ["dai", "usdc", "usdt", ""]);
  return useMemo(() => [dai, usdc, usdt].filter((token) => !!token), [chainId]);
};
