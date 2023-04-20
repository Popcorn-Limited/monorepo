import { ChainId, PRC_PROVIDERS } from "@popcorn/utils";
import { BigNumber, constants, ethers } from "ethers";
import useSWR, { SWRResponse } from "swr";
import { useNamedAccounts } from "@popcorn/greenfield-app/lib/utils";
import { usePrice } from "@popcorn/greenfield-app/lib/Price";

const REFETCH_INTERVAL = 10 * 1_000;

export async function getStakingTVL(
  _key,
  popLockerAddress: string,
  rpcProvider,
  popPrice: BigNumber,
): Promise<BigNumber> {
  const popLocker = new ethers.Contract(
    popLockerAddress,
    ["function lockedSupply() external view returns (uint256)"],
    rpcProvider,
  );
  const totalStake = await popLocker.lockedSupply();
  return totalStake.mul(popPrice).div(constants.WeiPerEther);
}

export default function useStakingTVL(chainId: ChainId): SWRResponse<BigNumber, Error> {
  const [popStaking] = useNamedAccounts(String(chainId) as any, ["popStaking"])
  const [pop] = useNamedAccounts("1", ["pop"]);
  const { data: popPrice } = usePrice({ address: pop?.address, chainId: ChainId.Ethereum })


  return useSWR(
    [`getStakingTVL-${chainId}`, popStaking?.address, PRC_PROVIDERS[chainId], popPrice?.value],
    getStakingTVL,
    {
      refreshInterval: REFETCH_INTERVAL,
      dedupingInterval: REFETCH_INTERVAL,
      shouldRetryOnError: false,
      keepPreviousData: true
    },
  );
}
