import { useNamedAccounts } from "@popcorn/components/lib/utils/hooks";
import { useToken as _useToken } from "wagmi";
import { useEffect } from "react";

interface UseTokenProps {
  chainId: number;
  address?: string;
  alias?: string;
  enabled?: boolean;
}

export const useToken = ({ chainId, address, enabled, alias }: UseTokenProps) => {
  const [metadata] = useNamedAccounts(chainId.toString() as any, (!!address && [address]) || []);

  const { data, isLoading, isError } = _useToken({
    chainId,
    address: address as "0x${string}",
    cacheTime: 1000 * 60 * 5,
    scopeKey: `erc20:${chainId}:${address}`,
    enabled:
      typeof metadata?.isERC20 !== "undefined" && !metadata.isERC20
        ? false
        : typeof enabled === "boolean"
        ? enabled && !!address && !!chainId
        : !!address && !!chainId,
  });

  useEffect(() => {
    console.log({ useToken: { data, isLoading, isError, metadata } });
  }, [data, metadata, isLoading, isError]);

  return { data: { ...data }, isLoading, isError };
};

export default useToken;
