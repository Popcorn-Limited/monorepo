import { networkMap, ChainId } from "@popcorn/utils";
import { BigNumber } from "ethers/lib/ethers";
import { parseEther } from "ethers/lib/utils";

export default async function getAssetValue(
  addresses: string[],
  chainId: ChainId,
): Promise<{ [x: string]: BigNumber }> {
  const chainString = chainId === 1337 ? "ethereum" : networkMap[chainId].toLowerCase();
  const queryString = addresses
    .map((address) => `${chainString}:${address}`)
    .reduce((query, address) => query.concat(`,${address}`));
  const url = `https://coins.llama.fi/prices/current/${queryString}`;
  const result = await fetch(url);
  const parsed = await result.json();
  return addresses
    .map((address) => ({
      [address]: parseEther(String(parsed.coins[`${chainString}:${address}`]?.price)),
    }))
    .reduce((accumulated, current) => ({ ...accumulated, ...current }));
}
