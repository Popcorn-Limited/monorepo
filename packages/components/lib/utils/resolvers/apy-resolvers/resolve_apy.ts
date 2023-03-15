import { BigNumber } from "ethers";
import { formatAndRoundBigNumber, getNamedAccounts } from "@popcorn/utils";
import { ApyResolvers } from ".";

interface ResolveApyProps {
  address: string;
  chainId: number;
  resolver?: string;
  rpc?: any;
}

/**
 * recursively resolve apy of token
 */
export async function resolve_apy({
  address,
  chainId,
  rpc,
  resolver,
}: ResolveApyProps): Promise<{ formatted: string; value: BigNumber }> {
  const [metadata] = getNamedAccounts(chainId.toString() as any, [address as any]);

  const _resolver = resolver || metadata?.apyResolver;

  let apy;
  if (_resolver && typeof ApyResolvers[_resolver] === "function") {
    apy = await ApyResolvers[_resolver](address, Number(chainId), rpc);
  } else {
    apy = await ApyResolvers.default(address, Number(chainId), rpc);
  }
  console.log(apy)
  return { ...apy, formatted: formatAndRoundBigNumber(apy.value, apy.decimals) + "%" };
}
