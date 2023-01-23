import { ChainId } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import useSWR, { SWRResponse } from "swr";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import useTokenPrices from "@popcorn/app/hooks/tokens/useTokenPrices";
import { ERC20__factory } from "@popcorn/hardhat/typechain";

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
  const pop = ERC20__factory.connect(popAddress, rpcProvider);
  const usdc = ERC20__factory.connect(usdcAddress, rpcProvider);

  const popBal = await pop.balanceOf(poolAddress);
  const usdcBal = await usdc.balanceOf(poolAddress);

  const popValue = popBal.mul(popPrice).div(constants.WeiPerEther);
  const usdcValue = usdcBal.mul(usdcPrice).div("1000000"); // use 1e6
  return popValue.add(usdcValue);
}

export default function usePoolTVL(chainId: ChainId): SWRResponse<BigNumber, Error> {
  const rpcProvider = useRpcProvider(chainId);

  const { pop, usdc, popUsdcUniV3Pool } = useDeployment(chainId);
  const { pop: ethPop, usdc: ethUsdc } = useDeployment(ChainId.Ethereum);
  const { data: priceData } = useTokenPrices([ethPop, ethUsdc], ChainId.Ethereum);

  return useSWR(
    [`getPoolTVL-${chainId}`, popUsdcUniV3Pool, rpcProvider, pop, usdc, priceData?.[ethPop], priceData?.[ethUsdc]],
    (args) => getPoolTVL(...args),
    {
      refreshInterval: REFETCH_INTERVAL,
      dedupingInterval: REFETCH_INTERVAL,
      keepPreviousData: true,
      shouldRetryOnError: false,
    },
  );
}
