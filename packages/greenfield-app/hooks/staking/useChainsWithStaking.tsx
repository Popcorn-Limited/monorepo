import { ChainId } from "@popcorn/utils";

export function useChainsWithStaking(): ChainId[] {
  return [
    ChainId.ALL,
    ChainId.Ethereum,
    ChainId.Polygon,
    ChainId.Optimism,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [ChainId.Hardhat] : [])
  ]
}

export function useChainsWithStakingRewards(): ChainId[] {
  return [
    ChainId.ALL,
    ChainId.Ethereum,
    ChainId.Polygon,
    ChainId.Optimism,
    ChainId.BNB,
    ChainId.Arbitrum,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [ChainId.Hardhat] : [])
  ]
}
