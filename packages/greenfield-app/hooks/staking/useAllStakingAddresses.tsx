import { useNamedAccounts } from "@popcorn/components/lib/utils";
import { ChainId } from "@popcorn/utils";

export enum StakingType {
  PopLocker,
  StakingPool,
}

interface StakingAddressWithMetadata {
  chainId?: ChainId;
  stakingType?: StakingType;
  address?: string;
}

export default function useAllStakingAddresses(): StakingAddressWithMetadata[] {
  // Ethereum
  const [ethereumPopStaking] = useNamedAccounts("1", ["popStaking"]);
  const ethereumStakingAddresses = useNamedAccounts("1", ["butterStaking", "threeXStaking", "xenStaking", "popUsdcArrakisVaultStaking"]);

  // Polygon
  const [polygonPopStaking] = useNamedAccounts("137", ["popStaking"]);
  const polygonStakingAddresses = useNamedAccounts("137", ["popUsdcArrakisVaultStaking"]);

  //Optimism
  const [optimismPopStaking] = useNamedAccounts("10", ["popStaking"]);

  return [
    { chainId: ChainId.Ethereum, stakingType: StakingType.PopLocker, address: ethereumPopStaking?.address },
    { chainId: ChainId.Polygon, stakingType: StakingType.PopLocker, address: polygonPopStaking?.address },
    { chainId: ChainId.Optimism, stakingType: StakingType.PopLocker, address: optimismPopStaking?.address },
    ...(ethereumStakingAddresses?.length ? ethereumStakingAddresses : []).map(
      (staking) => ({ chainId: ChainId.Ethereum, stakingType: StakingType.StakingPool, address: staking?.address } || {}),
    ),
    ...(polygonStakingAddresses?.length ? polygonStakingAddresses : []).map(
      (staking) => ({ chainId: ChainId.Polygon, stakingType: StakingType.StakingPool, address: staking?.address } || {}),
    )
  ];
}
