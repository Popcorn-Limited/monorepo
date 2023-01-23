import { ChainId } from "@popcorn/utils";
import useGetMultipleStakingPools from "./staking/useGetMultipleStakingPools";
import { useStakingContracts } from "./useStakingContracts";

export const useAllStakingPools = () => {
  const polygonStakingAddresses = useStakingContracts(ChainId.Polygon);
  const ethereumStakingAddresses = useStakingContracts(ChainId.Ethereum);
  const localhostStakingAddresses = useStakingContracts(ChainId.Localhost);

  const { data: polygonStakingPools, isValidating: polygonStakingPoolsIsValidating } = useGetMultipleStakingPools(
    polygonStakingAddresses,
    ChainId.Polygon,
  );

  const { data: ethereumStakingPools, isValidating: ethereumStakingPoolsIsValidating } = useGetMultipleStakingPools(
    ethereumStakingAddresses,
    ChainId.Ethereum,
  );

  const { data: localhostStakingPools, isValidating: localhostStakingPoolsIsValidating } = useGetMultipleStakingPools(
    localhostStakingAddresses,
    ChainId.Localhost,
  );

  return {
    stakingPoolsIsValidating:
      polygonStakingPoolsIsValidating || ethereumStakingPoolsIsValidating || localhostStakingPoolsIsValidating,
    stakingPools: [
      ...(polygonStakingPools?.length ? polygonStakingPools : []).map(
        (pool) => ({ chainId: ChainId.Polygon, pool } || []),
      ),
      ...(ethereumStakingPools?.length ? ethereumStakingPools : []).map(
        (pool) => ({ chainId: ChainId.Ethereum, pool } || []),
      ),
      ...(localhostStakingPools?.length ? localhostStakingPools : []).map(
        (pool) => ({ chainId: ChainId.Localhost, pool } || []),
      ),
    ],
  };
};
