import { NotAvailable } from "@popcorn/greenfield-app/components/NotAvailable";
import { ChainId } from "@popcorn/greenfield-app/lib/utils/connectors";
import { constants } from "ethers";
import { useSum } from "@popcorn/greenfield-app/hooks";
import { useEffect, useState } from "react";
import Vesting from "./Vesting";
import { useAccount } from "wagmi";

interface VestingContainerProps {
  selectedNetworks: ChainId[];
}

export default function VestingContainer({ selectedNetworks }: VestingContainerProps): JSX.Element {
  const { address: account } = useAccount();
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
