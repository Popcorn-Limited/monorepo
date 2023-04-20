import { ChainId, PRC_PROVIDERS } from "@popcorn/utils";
import { BigNumber, Contract, constants } from "ethers";
import useSWR, { SWRResponse } from "swr";
import { usePrice } from "@popcorn/greenfield-app/lib/Price";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";

const REFETCH_INTERVAL = 10 * 1_000;

export async function getPoolTVL(
  _key,
  poolAddress: string,
  rpcProvider,
  popAddress: string,
  usdcAddress: string,
  popPrice: BigNumber,
  usdcPrice: BigNumber,
): Promise<BigNumber> {
  const pop = new Contract(popAddress, ["function balanceOf(address) external view returns (uint256)"], rpcProvider);
  const usdc = new Contract(usdcAddress, ["function balanceOf(address) external view returns (uint256)"], rpcProvider);

  const popBal = await pop.balanceOf(poolAddress);
  const usdcBal = await usdc.balanceOf(poolAddress);

  const popValue = popBal.mul(popPrice).div(constants.WeiPerEther);
  const usdcValue = usdcBal.mul(usdcPrice).div("1000000"); // use 1e6
  return popValue.add(usdcValue);
}

export default function usePoolTVL(chainId: ChainId): SWRResponse<BigNumber, Error> {
  const [pop, usdc, popUsdcUniV3Pool] = useNamedAccounts(String(chainId) as any, ["pop", "usdc", "popUsdcUniV3Pool"])
  const [ethPop, ethUsdc] = useNamedAccounts("1", ["pop", "usdc"]);

  const { data: popPrice } = usePrice({ address: ethPop?.address, chainId: ChainId.Ethereum });
  const { data: usdcPrice } = usePrice({ address: ethUsdc?.address, chainId: ChainId.Ethereum });

  return useSWR(
    [`getPoolTVL-${chainId}`, popUsdcUniV3Pool?.address, PRC_PROVIDERS[chainId], pop?.address, usdc?.address, popPrice?.value, usdcPrice?.value],
    getPoolTVL,
    {
      refreshInterval: REFETCH_INTERVAL,
      dedupingInterval: REFETCH_INTERVAL,
      shouldRetryOnError: false,
      keepPreviousData: true
    },
  );
}
