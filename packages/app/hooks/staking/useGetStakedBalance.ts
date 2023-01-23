import { isAddress } from "@ethersproject/address";
import { Staking } from "@popcorn/hardhat/typechain";
import { BigNumber, constants } from "ethers";
import useSWR, { SWRResponse } from "swr";

export default function useGetStakedBalance(
  stakingContract: Staking,
  account: string | undefined | null,
): SWRResponse<BigNumber, Error> {
  const shouldFetch =
    !!stakingContract &&
    account !== undefined &&
    account !== null &&
    isAddress(stakingContract.address) &&
    isAddress(account) &&
    account !== constants.AddressZero;

  return useSWR(
    shouldFetch ? ["StakedTokenBalance", stakingContract, account] : null,
    () => stakingContract.balanceOf(account),
    {
      refreshInterval: 3 * 1000,
      dedupingInterval: 3 * 1000,
    },
  );
}
