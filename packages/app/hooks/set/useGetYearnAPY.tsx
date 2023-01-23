import { ChainId } from "@popcorn/utils";
import YearnVault from "@popcorn/app/helper/YearnVault";
import useSWR, { SWRResponse } from "swr";

const PERCENT = 100;
const calculateApyForVaults = (vaults: YearnVault[], addresses: string[]) => {
  return (
    (addresses
      .map((address) => vaults.find((vault) => vault?.address.toLowerCase() === address)?.apy?.net_apy)
      .reduce((acc, curr) => acc + curr, 0) /
      addresses.length) *
    PERCENT
  );
};

async function getApyForYearnVaults(chainId: number, addresses: string[]): Promise<number | void> {
  if (chainId === ChainId.Localhost) chainId = ChainId.Ethereum;
  return fetch(`https://api.yearn.finance/v1/chains/1/vaults/all`)
    .then((res) => res.json())
    .then((vaults) => {
      return calculateApyForVaults(vaults, addresses);
    })
    .catch((ex) => {
      console.log("Error while fetching yearn vaults", ex.toString());
    });
}

export default function useGetYearnAPY(addresses: string[], chainId): SWRResponse<number | void, Error> {
  return useSWR([chainId, addresses], (args) => getApyForYearnVaults(...args), {
    refreshInterval: 3 * 1000,
  });
}
