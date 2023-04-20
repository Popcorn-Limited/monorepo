import StakeCard from "components/staking/StakeCard";
import React, { useMemo } from "react";
import useNetworkFilter from "hooks/useNetworkFilter";
import { useChainsWithStaking } from "hooks/staking/useChainsWithStaking";
import NetworkFilter from "@popcorn/greenfield-app/components/NetworkFilter";
import useAllStakingAddresses from "hooks/staking/useAllStakingAddresses";
import NoSSR from "react-no-ssr";

export default function StakingOverviewPage(): JSX.Element {
  const stakingAddresses = useAllStakingAddresses();
  const supportedNetworks = useChainsWithStaking();
  const [selectedNetworks, selectNetwork] = useNetworkFilter(supportedNetworks);

  const stakingPools = useMemo(
    () => (stakingAddresses || [])?.filter((staking) => selectedNetworks.includes(staking?.chainId)),
    [selectedNetworks, stakingAddresses],
  );

  return (
    <NoSSR>
      <div className="grid grid-cols-12 mb-8">
        <div className="col-span-12 md:col-span-4">
          <h1 className=" text-5xl md:text-6xl leading-12">Staking</h1>
          <p className="text-black mt-2 mb-4">Earn more by staking your tokens</p>
        </div>
      </div>
      <NetworkFilter supportedNetworks={supportedNetworks} selectNetwork={selectNetwork} />
      <div className="border-t border-t-customLightGray border-opacity-40">
        <div className="w-full">
          <div className="h-full ">
            {stakingPools.map((staking) => (
              <StakeCard
                key={`${staking.chainId}.${staking.address}`}
                chainId={staking?.chainId}
                stakingAddress={staking?.address}
                stakingType={staking?.stakingType}
              />
            ))}
          </div>
        </div>
      </div>
    </NoSSR>
  );
}
