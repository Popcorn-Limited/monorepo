import { ChainId } from "@popcorn/utils";

export function useChainsWithStaking(): ChainId[] {
  return [ChainId.ALL, ChainId.Ethereum, ChainId.Polygon, ChainId.Optimism, ChainId.Localhost].filter((chain) =>
    process.env.NODE_ENV === "development" ? true : chain !== ChainId.Localhost,
  );
}

export function useChainsWithStakingRewards(): ChainId[] {
  return [
    ChainId.ALL,
    ChainId.Ethereum,
    ChainId.Polygon,
    ChainId.Optimism,
    ChainId.BNB,
    ChainId.Arbitrum,
    ChainId.Localhost,
  ].filter((chain) => (process.env.NODE_ENV === "development" ? true : chain !== ChainId.Localhost));
}
