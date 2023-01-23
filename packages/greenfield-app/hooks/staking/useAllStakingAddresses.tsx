import { useDeployment } from "@popcorn/app/hooks/useDeployment";
import { useStakingContracts } from "@popcorn/app/hooks/useStakingContracts";
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
  const { popStaking: ethereumPopStaking } = useDeployment(ChainId.Ethereum);
  const ethereumStakingAddresses = useStakingContracts(ChainId.Ethereum);

  // Polygon
  const { popStaking: polygonPopStaking } = useDeployment(ChainId.Polygon);
  const polygonStakingAddresses = useStakingContracts(ChainId.Polygon);

  // Localhost
  const { popStaking: localhostPopStaking } = useDeployment(ChainId.Localhost);
  const localhostStakingAddresses = useStakingContracts(ChainId.Localhost);

  return [
    { chainId: ChainId.Ethereum, stakingType: StakingType.PopLocker, address: ethereumPopStaking },
    { chainId: ChainId.Polygon, stakingType: StakingType.PopLocker, address: polygonPopStaking },
    { chainId: ChainId.Localhost, stakingType: StakingType.PopLocker, address: localhostPopStaking },
    ...(ethereumStakingAddresses?.length ? ethereumStakingAddresses : []).map(
      (address) => ({ chainId: ChainId.Ethereum, stakingType: StakingType.StakingPool, address } || {}),
    ),
    ...(polygonStakingAddresses?.length ? polygonStakingAddresses : []).map(
      (address) => ({ chainId: ChainId.Polygon, stakingType: StakingType.StakingPool, address } || {}),
    ),
    ...(localhostStakingAddresses?.length ? localhostStakingAddresses : []).map(
      (address) => ({ chainId: ChainId.Localhost, stakingType: StakingType.StakingPool, address } || {}),
    ),
  ];
}
