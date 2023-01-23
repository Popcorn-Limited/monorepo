import { isAddress } from "@ethersproject/address";
import { Staking } from "@popcorn/hardhat/typechain";
import { constants } from "ethers";
import useSWR from "swr";

export default function useGetEarned(stakingContract: Staking, account: string | undefined | null) {
  const shouldFetch =
    !!stakingContract &&
    account !== undefined &&
    account !== null &&
    isAddress(stakingContract.address) &&
    isAddress(account) &&
    account !== constants.AddressZero;

  return useSWR(shouldFetch ? ["Earned", stakingContract, account] : null, () => stakingContract.earned(account), {
    refreshInterval: 3 * 1000,
    dedupingInterval: 3 * 1000,
  });
}
