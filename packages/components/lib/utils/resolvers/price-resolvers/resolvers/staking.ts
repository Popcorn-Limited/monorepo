import { ChainId, getNamedAccounts } from "@popcorn/utils";
import { Contract } from "ethers/lib/ethers";
import { resolve_price } from "../resolve_price";
import { PriceResolver } from "../types";

export const staking: PriceResolver = async (address: string, chainId: ChainId, rpc) => {
  const staking = new Contract(address, ["function stakingToken() external view returns (address)"], rpc);

  const stakingToken = await staking.stakingToken();

  const [token] = getNamedAccounts(chainId.toString() as any, [stakingToken as any]);

  return resolve_price({ address: token.address, chainId, resolver: token?.priceResolver, rpc });
};
