import { BigNumber } from "ethers";
import { ChainId } from "@popcorn/utils";

export type PriceResolver = (
  address: string,
  chainId: ChainId,
  rpc?: any,
  resolvers?: PriceResolvers,
) => Promise<{ value: BigNumber; decimals: number }>;

export type PriceResolvers = Record<string, PriceResolver>;
