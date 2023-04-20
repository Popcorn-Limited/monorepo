import useSWR from "swr";
import { useProvider } from "wagmi";
import { BigNumber } from "ethers";
import { resolve_price } from "../../utils/resolvers/price-resolvers/resolve_price";
import { Pop } from "../../types";
import { popHookAdapter } from "../../utils/hooks/swrPopHookAdapter";
import { useNamedAccounts } from "../../utils";

interface Props extends Pop.StdProps {
  resolver?: string;
}
export const usePrice: Pop.Hook<{ value: BigNumber; decimals: number }> = ({ address, chainId, resolver }: Props) => {
  const provider = useProvider({ chainId: Number(chainId) });
  const [metadata] = useNamedAccounts(chainId.toString() as any, (!!address && [address]) || []);
  const _resolver = resolver || (metadata?.priceResolver && metadata?.priceResolver) || undefined;
  const shouldFetch = !!address && !!chainId;

  return popHookAdapter(
    useSWR(
      shouldFetch ? [`usePrice:${chainId}:${address}:${resolver}`] : null,
      async () => !!address && resolve_price({ address, chainId, rpc: provider, resolver: _resolver }),
    ),
  );
};
export default usePrice;
