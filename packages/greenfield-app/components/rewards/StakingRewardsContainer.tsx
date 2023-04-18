import { NotAvailable } from "@popcorn/components/components/NotAvailable";
import { ChainId } from "@popcorn/utils";
import { constants } from "ethers";
import useAllStakingAddresses from "hooks/staking/useAllStakingAddresses";
import { useSum } from "@popcorn/components";
import { useEffect, useState } from "react";
import ClaimCard from "./ClaimCard";
import { Address } from "wagmi";

interface StakingRewardsContainerProps {
  selectedNetworks: ChainId[];
}

export default function StakingRewardsContainer({ selectedNetworks }: StakingRewardsContainerProps): JSX.Element {
  const stakingAddresses = useAllStakingAddresses();
  const [displayAddresses, setDisplayAddresses] = useState(stakingAddresses);
  const [cachedSelectedNetworks, setCachedNetworks] = useState([]);
  const { loading, sum, add, reset } = useSum({ expected: displayAddresses.length });

  useEffect(() => {
    reset();
  }, [selectedNetworks, reset]);

  useEffect(() => {
    if ((stakingAddresses && stakingAddresses.length > 0, cachedSelectedNetworks !== selectedNetworks)) {
      setDisplayAddresses(stakingAddresses?.filter((pool) => selectedNetworks.includes(pool.chainId)));
      setCachedNetworks(selectedNetworks);
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
        <ClaimCard
          key={`${staking?.address}-${staking?.chainId}`}
          chainId={staking?.chainId}
          staking={staking?.address as Address}
          addEarned={add}
        />
      ))}
    </>
  );
}
