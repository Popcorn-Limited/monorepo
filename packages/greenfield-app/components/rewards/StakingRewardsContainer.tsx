import { NotAvailable } from "@popcorn/app/components/Rewards/NotAvailable";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { ChainId } from "@popcorn/utils";
import { constants } from "ethers";
import useAllStakingAddresses from "hooks/staking/useAllStakingAddresses";
import { useSum } from "@popcorn/components";
import { useEffect, useState } from "react";
import ClaimCard from "./ClaimCard";

interface StakingRewardsContainerProps {
  selectedNetworks: ChainId[];
}

export default function StakingRewardsContainer({ selectedNetworks }: StakingRewardsContainerProps): JSX.Element {
  const { account } = useWeb3();
  const stakingAddresses = useAllStakingAddresses();
  const [displayAddresses, setDisplayAddresses] = useState(stakingAddresses);
  const { loading, sum, add, reset } = useSum({ expected: displayAddresses.length });

  useEffect(() => {
    reset();
  }, [account, selectedNetworks, reset]);

  useEffect(() => {
    if (stakingAddresses && stakingAddresses.length > 0) {
      setDisplayAddresses(stakingAddresses?.filter((pool) => selectedNetworks.includes(pool.chainId)));
    }
  }, [selectedNetworks, stakingAddresses]);

  return (
    <>
      <div className={`mt-4 ${!loading && sum.eq(constants.Zero) ? "" : "hidden"}`}>
        <NotAvailable
          title="No Records Available"
          body="No staking records available"
          image="/images/emptyRecord.svg"
        />
      </div>
      {displayAddresses.map((staking) => (
        <div key={staking?.chainId + staking?.address}>
          <ClaimCard
            chainId={staking?.chainId}
            stakingAddress={staking?.address}
            stakingType={staking?.stakingType}
            addEarned={add}
            isNotAvailable={!loading && sum?.eq(constants.Zero)}
          />
        </div>
      ))}
    </>
  );
}
