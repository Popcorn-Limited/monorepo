import { ChainId, PRC_PROVIDERS } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import useSWR, { SWRResponse } from "swr";
import { ERC20__factory } from "@popcorn/hardhat/typechain";
import { usePrice } from "@popcorn/components/lib/Price";
import { useNamedAccounts } from "@popcorn/components/lib/utils";

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
