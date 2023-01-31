import { BigNumber } from "ethers";
import { ChainId } from "@popcorn/utils";
import { synthetix, set_token, yearn, yearnAsset, convex } from "./resolvers";

export type ApyResolver = (
  address: string,
  chainId: ChainId,
  rpc?: any,
) => Promise<{ value: BigNumber; formatted: number }>;

export type ApyResolvers = typeof ApyResolvers;

export const ApyResolvers = {
  yearn,
  yearnAsset,
  synthetix,
  set_token,
  convex,
  default: synthetix,
};

export default ApyResolvers;
