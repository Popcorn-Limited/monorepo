import { Staking__factory } from "@popcorn/hardhat/typechain";
import { ChainId } from "@popcorn/utils/connectors";
import { getStakingPool, StakingPoolMetadata } from "@popcorn/app/helper/getStakingPool";
import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { useMemo } from "react";
import useSWR, { SWRResponse } from "swr";
import { useRpcProvider } from "@popcorn/app/hooks/useRpcProvider";

export default function useGetMultipleStakingPools(
  addresses: string[] = [],
  chainId: ChainId,
): SWRResponse<StakingPoolMetadata[], Error> {
  const { account } = useWeb3();
  const rpcProvider = useRpcProvider(chainId);
  const contractAddresses = useDeployment(chainId);

  const stakingContracts = useMemo(
    () => addresses.map((address) => Staking__factory.connect(address, rpcProvider)),
    [chainId, addresses, rpcProvider],
  );

  const shouldFetch = !!stakingContracts && !!chainId;

  return useSWR(shouldFetch ? [`getPoolInfo`, account, chainId, addresses, rpcProvider] : null, async ([key]) => {
    return Promise.all(
      stakingContracts.map(async (contract) =>
        getStakingPool(key, account, contract, chainId, rpcProvider, contractAddresses),
      ),
    );
  });
}
