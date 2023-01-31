import { networkMap } from "@popcorn/utils";
import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { PriceResolver } from "../types";

export const defi_llama: PriceResolver = async (address: string, chainId: number) => {
  const chainString = chainId === 1337 ? "ethereum" : networkMap[chainId].toLowerCase();
  const queryString = `${chainString}:${address}`;
  const url = `https://coins.llama.fi/prices/current/${queryString}`;
  const result = await fetch(url);
  const parsed = await result.json();
  const token = parsed.coins[`${chainString}:${address}`];

  return token?.price && token?.decimals
    ? {
        value: parseUnits(`${token.price}`, token.decimals),
        decimals: token.decimals,
      }
    : { value: constants.Zero, decimals: 0 };
};

export default defi_llama;
