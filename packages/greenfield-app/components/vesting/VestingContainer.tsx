import { NotAvailable } from "@popcorn/app/components/Rewards/NotAvailable";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { ChainId } from "@popcorn/utils";
import { constants } from "ethers";
import { useChainsWithStakingRewards } from "hooks/staking/useChainsWithStaking";
import { useSum } from "@popcorn/components";
import { useEffect, useState } from "react";
import Vesting from "./Vesting";
interface VestingContainerProps {
  selectedNetworks: ChainId[];
}

export default function VestingContainer({ selectedNetworks }: VestingContainerProps): JSX.Element {
  const { account } = useWeb3();
  const supportedNetworks = useChainsWithStakingRewards();
  const { loading, sum, add, reset } = useSum({ expected: selectedNetworks?.length || 1 });
  const [filteredNetworks, setFilteredNetworks] = useState(supportedNetworks);
  const [keyValue, setKeyValue] = useState(0);

  useEffect(() => {
    setKeyValue(keyValue + 1);
    setFilteredNetworks(supportedNetworks.filter((chain) => selectedNetworks.includes(chain)));
    reset();
  }, [account, selectedNetworks, keyValue, supportedNetworks, reset]);

  return (
    <>
      <div className={`mb-4 ${!loading && sum?.eq(constants.Zero) ? "" : "hidden"}`}>
        <NotAvailable
          title="No Records Available"
          body="No vesting records available"
          image="/images/emptyRecord.svg"
        />
      </div>
      {filteredNetworks.map((chain) => {
        let props = {
          chainId: chain,
          addClaimable: add,
          isNotAvailable: !loading && sum?.eq(constants.Zero),
        };
        return <Vesting key={chain + "Vesting"} {...props} />;
      })}
    </>
  );
}
