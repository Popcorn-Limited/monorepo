import { isAddress } from "@ethersproject/address";
import { Staking__factory } from "@popcorn/hardhat/typechain";
import { ChainId } from "@popcorn/utils";
import { getStakingPool } from "@popcorn/app/helper/getStakingPool";
import { StakingPoolMetadata } from "@popcorn/app/helper/getStakingPool";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useMemo } from "react";
import useSWR, { SWRResponse } from "swr";

export default function useStakingPool(address: string, chainId: ChainId): SWRResponse<StakingPoolMetadata, Error> {
  const { account } = useWeb3();
  const provider = useRpcProvider(chainId);
  const contractAddresses = useDeployment(chainId);

  const stakingContract = useMemo(
    () => isAddress(address) && !!chainId && !!provider && Staking__factory.connect(address, provider),
    [chainId, address, provider],
  );

  const shouldFetch = !!stakingContract && !!chainId;

  return useSWR(
    shouldFetch
      ? [`getStakingPoolInfo-${address}`, account, stakingContract, chainId, provider, contractAddresses]
      : null,
    (key) => getStakingPool(...key),
  );
}
