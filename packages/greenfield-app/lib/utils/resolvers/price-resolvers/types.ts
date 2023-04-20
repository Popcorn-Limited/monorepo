import { BigNumber } from "ethers";
import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";

export type PriceResolver = (
  address: string,
  chainId: ChainId,
  rpc?: any,
  resolvers?: PriceResolvers,
) => Promise<{ value: BigNumber; decimals: number }>;

export type PriceResolvers = Record<string, PriceResolver>;
