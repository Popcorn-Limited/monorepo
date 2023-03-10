import { NotAvailable } from "@popcorn/app/components/Rewards/NotAvailable";
import useWeb3 from "@popcorn/app/hooks/useWeb3";
import { ChainId } from "@popcorn/utils";
import { constants } from "ethers";
import { useSum } from "@popcorn/components";
import { useEffect, useState } from "react";
import Vesting from "./Vesting";

interface VestingContainerProps {
  selectedNetworks: ChainId[];
}

export default function VestingContainer({ selectedNetworks }: VestingContainerProps): JSX.Element {
  const { account } = useWeb3();
  const [prevAccount, setPrevAccount] = useState(account);
  const { loading, sum, add, reset } = useSum({ expected: selectedNetworks?.length || 1 });

  useEffect(() => {
    if (prevAccount !== account) {
      setPrevAccount(account);
      reset();
    }
  }, [prevAccount, account]);

  return (
    <>
      <div className={`mb-4 ${!loading && sum?.eq(constants.Zero) ? "" : "hidden"}`}>
        <NotAvailable
          title="No Records Available"
          body="No vesting records available"
          image="/images/emptyRecord.svg"
        />
      </div>
      {selectedNetworks.map((chain) => (
        <Vesting
          key={chain + "Vesting"}
          chainId={chain}
          addClaimable={add}
          isNotAvailable={!loading && sum?.eq(constants.Zero)}
        />
      ))}
    </>
  );
}
