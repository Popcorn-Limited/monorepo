import { BigNumber } from "ethers";
import { ChainId } from "@popcorn/utils";
import { synthetix } from "./resolvers/synthetix";
import { set_token } from "./resolvers/set-token";
import { yearn, yearnAsset } from "./resolvers";

export type ApyResolver = (
  address: string,
  chainId: ChainId,
  rpc?: any,
) => Promise<{ value: BigNumber; formatted: number }>;

export type ApyResolvers = typeof ApyResolvers;

export const ApyResolvers = {
  yearn,
  synthetix,
  set_token,
  yearnAsset,
  default: synthetix,
};

export default ApyResolvers;
