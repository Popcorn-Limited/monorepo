import { formatAndRoundBigNumber } from "@popcorn/greenfield-app/lib/utils";
import { UpdateNetworthActionProps } from "../../reducers/portfolio";
import { BigNumber, constants } from "ethers";
import { useComponentState } from "../utils/hooks/useComponentState";

interface NetworthProps {
  account?: string;
  loading?: boolean;
  value?: BigNumber;
}

export const Networth: React.FC<NetworthProps> = ({ value, loading, account }) => {
  const { ready, loading: _loading } = useComponentState(
    {
      ready: !!account,
      loading: !account || loading,
    },
    [account],
  );

  return (
    <>
      <div className={`border-b border-gray-200 pb-5`}>
        <h3 className={`text-lg font-medium leading-6 text-gray-900 ${!ready ? "" : "hidden"}`}>
          Please connect your wallet to view your networth
        </h3>
        <h3 className={`text-lg font-medium leading-6 text-gray-900 ${ready ? "" : "hidden"}`}>
          Connected to {ready && account}
        </h3>
        <h3 className={`text-lg font-medium leading-6 text-gray-900  ${!loading && ready ? "" : "hidden"}`}>
          Networth: {!loading && ready && value && "$" + formatAndRoundBigNumber(value, 18)}
        </h3>
        <h3 className={`text-lg font-medium leading-6 text-gray-900  ${loading ? "" : "hidden"}`}>Loading ...</h3>
      </div>
    </>
  );
};
