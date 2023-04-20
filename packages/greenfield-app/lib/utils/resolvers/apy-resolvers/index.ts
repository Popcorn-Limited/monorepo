import { BigNumber } from "ethers";
import { ChainId } from "@popcorn/utils";
import { synthetix, set_token, yearn, yearnAsset, convex, beefy,multiRewardStaking } from "./resolvers";

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
  beefy,
  multiRewardStaking,
  default: synthetix,
};

export default ApyResolvers;
