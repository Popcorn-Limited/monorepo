import { BigNumber } from "ethers";
import { formatAndRoundBigNumber, getNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import { Resolvers } from ".";

interface GetPriceProps {
  address: string;
  chainId: number;
  resolver?: string;
  rpc?: any;
}

/**
 * recursively resolve price of token
 */
export async function resolve_price({
  address,
  chainId,
  rpc,
  resolver,
}: GetPriceProps): Promise<{ value: BigNumber; decimals: number; formatted: string }> {
  const [metadata] = getNamedAccounts(chainId.toString() as any, [address as any]);
  const _resolver = resolver || metadata?.priceResolver;

  let price: { value: BigNumber; decimals: number } | undefined;
  if (_resolver && typeof Resolvers[_resolver] === "function") {
    return (price = format(await Resolvers[_resolver](address, Number(chainId), rpc)));
  }
  return format(await Resolvers.default(address, Number(chainId), rpc));
}

const format = (price) => {
  return {
    ...price,
    formatted: formatAndRoundBigNumber(price.value, price.decimals),
  };
};
