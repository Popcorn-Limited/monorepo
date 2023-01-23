import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import useGetUserEscrows, { Escrow } from "@popcorn/app/hooks/useGetUserEscrows";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { ChainId } from "@popcorn/utils";
import { BigNumber, constants } from "ethers";
import { useMemo } from "react";

interface EscrowSummary {
  escrows: Escrow[];
  totalClaimablePop: BigNumber;
  totalVestingPop: BigNumber;
  revalidate: () => void;
  isValidating: boolean;
  error: Error;
}

export default function useEscrows(chainId: ChainId): EscrowSummary {
  const { account } = useWeb3();
  const { rewardsEscrow, vaultsRewardsEscrow } = useDeployment(chainId);

  const {
    data: escrowsFetchResult,
    isValidating: escrowsFetchResultIsValidating,
    error: escrowsFetchResultError,
    mutate: revalidateEscrowsFetchResult,
  } = useGetUserEscrows(rewardsEscrow, account, chainId);
  const {
    data: vaultsEscrowsFetchResults,
    isValidating: vaultsEscrowsFetchResultsIsValidating,
    error: vaultsEscrowsFetchResultsError,
    mutate: revalidateVaultsEscrowsFetchResults,
  } = useGetUserEscrows(vaultsRewardsEscrow, account, chainId);

  return useMemo(() => {
    return {
      escrows: [].concat(escrowsFetchResult?.escrows || []).concat(vaultsEscrowsFetchResults?.escrows || []),
      totalClaimablePop: constants.Zero.add(escrowsFetchResult?.totalClaimablePop || "0").add(
        vaultsEscrowsFetchResults?.totalClaimablePop || "0",
      ),
      totalVestingPop: constants.Zero.add(escrowsFetchResult?.totalVestingPop || "0").add(
        vaultsEscrowsFetchResults?.totalVestingPop || "0",
      ),
      revalidate: () => {
        revalidateEscrowsFetchResult();
        revalidateVaultsEscrowsFetchResults();
      },
      isValidating: escrowsFetchResultIsValidating || vaultsEscrowsFetchResultsIsValidating,
      error: escrowsFetchResultError || vaultsEscrowsFetchResultsError,
    };
  }, [
    escrowsFetchResult,
    vaultsEscrowsFetchResults,
    revalidateEscrowsFetchResult,
    revalidateVaultsEscrowsFetchResults,
    escrowsFetchResultIsValidating,
    vaultsEscrowsFetchResultsIsValidating,
    escrowsFetchResultError,
    vaultsEscrowsFetchResultsError,
  ]);
}
