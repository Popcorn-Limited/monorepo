import { BigNumber } from "ethers/lib/ethers";
import getAssetValue from "@popcorn/app/helper/getAssetValue";
import useSWR, { SWRResponse } from "swr";

export default function useDefiLlamaPrices(
  chainId: number,
  addresses: string[],
): SWRResponse<{
  [x: string]: BigNumber;
}> {
  return useSWR(["assetValue", chainId, addresses], () => getAssetValue(addresses, chainId), {
    refreshInterval: 10000,
  });
}
