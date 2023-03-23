import { atomWithStorage } from "jotai/utils";
import assets from "./constants/assets.json";

export type Asset = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export const useAssets = () => {
  return assets;
};

export const assetAtom = atomWithStorage<Asset>("select.asset", assets[0]);

