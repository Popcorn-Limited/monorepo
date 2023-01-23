import { useProvider } from "wagmi";
import useSWR from "swr";
import { resolve_apy } from "../../utils/resolvers/apy-resolvers/resolve_apy";
import { useMemo } from "react";
import { popHookAdapter } from "../../utils/hooks/swrPopHookAdapter";
import { BigNumberWithFormatted, Pop } from "../../types";
import { useNamedAccounts } from "../../utils";
import useLog from "../../utils/hooks/useLog";

interface UseApyProps extends Pop.StdProps {
  resolver?: string;
}

export const useApy: Pop.Hook<BigNumberWithFormatted> = ({ resolver, address, chainId }: UseApyProps) => {
  const provider = useProvider({ chainId: Number(chainId) });
  const [metadata] = useNamedAccounts(chainId.toString() as any, (!!address && [address]) || []);
  const _resolver = useMemo(() => resolver || metadata?.apyResolver, [resolver, metadata]);
  useLog({ resolver, address, chainId, _resolver, metadata, shouldFetch: !!address && !!chainId && !!_resolver }, [
    resolver,
    address,
    chainId,
    _resolver,
    metadata,
  ]);

  if (!_resolver) {
    // todo: build a map of protocol addresses to resolvers so we don't need to add a resolver to the metadata. this would be a good fallback and also allow us to use arbitrary tokenlists
  }

  return popHookAdapter(
    useSWR(!!address && !!chainId && !!_resolver ? [`useApy:${chainId}:${address}:${_resolver}`] : null, async () => {
      return address && (await resolve_apy({ address, chainId, rpc: provider, resolver: _resolver }));
    }),
  ) as Pop.HookResult<BigNumberWithFormatted>;
};
